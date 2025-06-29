from fastapi import APIRouter, HTTPException, Depends, status
from mentor_agent.models.auth import RegisterResponse, UserRegister, UserLogin, LoginResponse, UserResponse
from mentor_agent.services.auth_service import auth_service, users_db
import uuid
from datetime import datetime, timezone

auth_router = APIRouter()

@auth_router.post("/register", response_model=RegisterResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if user already exists
    if auth_service.find_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists in memory"
        )

    # Check if user exists in Supabase
    if await auth_service.check_user_exists_in_supabase(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists in Supabase"
        )

    # Hash password
    hashed_password = auth_service.hash_password(user_data.password)

    # Create user object
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": hashed_password,
        "plain_password": user_data.password,
        "name": user_data.name,
        "role": "user",
        "subscription_tier": "free",
        "avatar_url": f"https://api.dicebear.com/7.x/initials/svg?seed={user_data.name.replace(' ', '%20')}",
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }

    # Save to Supabase
    supabase_success, auth_user_id = await auth_service.save_user_to_supabase(new_user)

    if supabase_success and auth_user_id:
        new_user["id"] = auth_user_id
        print(f"🔄 Updated user ID to Supabase Auth ID: {auth_user_id}")

    # Add to in-memory storage
    users_db.append(new_user)

    print(f"✅ User registered successfully: {user_data.email}")

    # Generate JWT token
    # token = auth_service.create_jwt_token(new_user)

    user_response = UserResponse(
        id=new_user["id"],
        email=new_user["email"],
        name=new_user["name"],
        avatar_url=new_user["avatar_url"],
        role=new_user["role"],
        subscription_tier=new_user["subscription_tier"],
        created_at=new_user["created_at"]
    )

    return RegisterResponse(
        message="User created successfully",
        # token=token,
        user=user_response
    )

@auth_router.post("/login", response_model=LoginResponse)
async def login(login_data: UserLogin):
    """Login user and return JWT token"""
    user = auth_service.find_user_by_email(login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials"
        )

    if not auth_service.verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials"
        )

    token = auth_service.create_jwt_token(user)

    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        avatar_url=user["avatar_url"],
        role=user["role"],
        subscription_tier=user["subscription_tier"],
        created_at=user["created_at"]
    )

    return LoginResponse(
        message="Login successful",
        token=token,
        user=user_response
    )

@auth_router.get("/me")
async def get_current_user_info(current_user: dict = Depends(auth_service.get_current_user)):
    """Get current user information"""
    return {
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "name": current_user["name"],
            "avatar_url": current_user["avatar_url"],
            "role": current_user["role"],
            "subscription_tier": current_user["subscription_tier"],
            "created_at": current_user["created_at"]
        }
    }
