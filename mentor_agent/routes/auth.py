from fastapi import APIRouter, HTTPException, Depends, status
from mentor_agent.models.auth import RegisterResponse, UserRegister, UserLogin, LoginResponse, UserResponse
from mentor_agent.services.auth_service import auth_service
import uuid
from datetime import datetime, timezone

auth_router = APIRouter()

@auth_router.post("/register", response_model=RegisterResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    # Check if user already exists
    existing_user = auth_service.find_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )

    # Hash password
    hashed_password = auth_service.hash_password(user_data.password)

    # Create user object
    new_user_data = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": hashed_password,
        "name": user_data.name,
        "role": "user",
        "subscription_tier": "free",
        "avatar_url": f"https://api.dicebear.com/7.x/initials/svg?seed={user_data.name.replace(' ', '%20')}",
        "is_active": True
    }

    # Save to memory
    created_user = auth_service.create_user(new_user_data)

    print(f"✅ User registered successfully: {user_data.email}")

    user_response = UserResponse(
        id=created_user["id"],
        email=created_user["email"],
        name=created_user["name"],
        avatar_url=created_user["avatar_url"],
        role=created_user["role"],
        subscription_tier=created_user["subscription_tier"],
        created_at=created_user["created_at"]
    )

    return RegisterResponse(
        message="User created successfully",
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
    
    # Log token creation with more details
    print(f"🔐 JWT Token created for user: {user['email']}")
    print(f"🎫 Token (first 50 chars): {token[:50]}...")
    print(f"👤 User ID: {user['id']}")
    print(f"🏷️ Role: {user['role']}")

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

@auth_router.post("/validate")
async def validate_token(token_data: dict):
    """Validate JWT token"""
    token = token_data.get("token")
    if not token:
        return {"valid": False, "message": "No token provided"}
    
    payload = auth_service.decode_jwt_token(token)
    if not payload:
        return {"valid": False, "message": "Invalid or expired token"}
    
    return {
        "valid": True,
        "payload": payload,
        "user": {
            "id": payload.get("userId"),
            "email": payload.get("email"),
            "name": payload.get("name"),
            "role": payload.get("role"),
            "roleId": payload.get("roleId"),
            "subscriptionTier": payload.get("subscriptionTier"),
            "permissions": payload.get("permissions"),
        }
    }
