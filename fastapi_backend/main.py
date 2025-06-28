from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta, timezone
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')  # Try .env.local first
load_dotenv()  # Then try .env

app = FastAPI(title="IndieMentor JWT API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_jwt_key_for_development_12345")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Supabase client (optional) - Using service role key to bypass RLS
supabase: Optional[Client] = None
supabase_enabled = False

if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL != "your_supabase_url":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        supabase_enabled = True
        print("✅ Supabase client initialized successfully with service role")
    except Exception as e:
        print(f"⚠️ Supabase initialization failed: {e}")
        print("💡 App will run without Supabase integration")
        supabase_enabled = False
else:
    print("⚠️ Supabase credentials not configured")
    print("💡 App will run without Supabase integration")

# Security
security = HTTPBearer()

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    role: str = "user"
    subscription_tier: str = "free"
    created_at: datetime

class LoginResponse(BaseModel):
    message: str
    token: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: str
    email: str
    name: str
    role: str
    exp: datetime

# In-memory user storage (for demo/testing)
users_db = [
    {
        "id": "550e8400-e29b-41d4-a716-446655440001",  # UUID format
        "email": "demo@example.com",
        "password": "$2b$12$RufDxO9WIOlTSI3jMRguN.PbKNhN0SqcCbUnn5Lb/Bmt9cZe08SBe",  # 'demo123'
        "name": "Demo User",
        "role": "user",
        "subscription_tier": "free",
        "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=Demo%20User",
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440002",  # UUID format
        "email": "admin@example.com",
        "password": "$2b$12$GWLW0CQ94BrB58GTKVOhi.0AQsjhJZ973rmsaCWk/abgAABig2/66",  # 'admin123'
        "name": "Admin User",
        "role": "admin",
        "subscription_tier": "enterprise",
        "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=Admin%20User",
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
]

# Utility Functions
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_data: dict) -> str:
    """Create a JWT token"""
    payload = {
        "user_id": user_data["id"],
        "email": user_data["email"],
        "name": user_data["name"],
        "role": user_data["role"],
        "subscription_tier": user_data["subscription_tier"],
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Print JWT token to console for development
    print(f"🔑 JWT Token: {token}")
    
    return token

def verify_jwt_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_jwt_token(token)
    
    # Find user in memory or database
    user = next((u for u in users_db if u["id"] == payload["user_id"]), None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

def find_user_by_email(email: str) -> Optional[dict]:
    """Find user by email in memory storage"""
    return next((u for u in users_db if u["email"] == email), None)

async def check_user_exists_in_supabase(email: str) -> bool:
    """Check if user exists in Supabase Auth"""
    if not supabase_enabled or not supabase:
        return False
        
    try:
        # Try to get user by email from Supabase Auth
        result = supabase.auth.admin.list_users()
        if result and hasattr(result, 'users') and result.users:
            for user in result.users:
                if user.email == email:
                    return True
        elif result and isinstance(result, list):
            # Handle if result is directly a list
            for user in result:
                if hasattr(user, 'email') and user.email == email:
                    return True
        return False
    except Exception as e:
        print(f"⚠️ Error checking Supabase user existence: {e}")
        return False

async def save_user_to_supabase(user_data: dict) -> tuple[bool, Optional[str]]:
    """Save user data to Supabase Auth and profiles table. Returns (success, auth_user_id)"""
    if not supabase_enabled or not supabase:
        print("⚠️ Supabase not configured, skipping user save")
        return False, None
        
    try:
        # Step 1: Create user in Supabase Auth (this will appear in the dashboard)
        auth_result = supabase.auth.admin.create_user({
            "email": user_data["email"],
            "password": user_data.get("plain_password", "temp_password_123"),  # Use the actual password
            "user_metadata": {
                "name": user_data["name"],
                "avatar_url": user_data["avatar_url"]
            },
            "email_confirm": True  # Auto-confirm email
        })
        
        if auth_result.user:
            auth_user_id = auth_result.user.id
            print(f"✅ User created in Supabase Auth: {user_data['email']} (ID: {auth_user_id})")
            
            # Step 2: Save to profiles table with the Auth user ID
            supabase_user_data = {
                "id": auth_user_id,  # Use the Auth user ID
                "email": user_data["email"],
                "name": user_data["name"],
                "avatar_url": user_data["avatar_url"],
                "is_creator": False,  # Default new users as non-creators
                "created_at": user_data["created_at"].isoformat()
            }
            
            # Insert into Supabase profiles table
            profile_result = supabase.table("profiles").insert(supabase_user_data).execute()
            
            if profile_result.data:
                print(f"✅ User profile saved to Supabase: {user_data['email']}")
                return True, auth_user_id  # Return the Auth user ID
            else:
                print(f"❌ Failed to save user profile to Supabase: {user_data['email']}")
                return False, None
        else:
            print(f"❌ Failed to create user in Supabase Auth: {user_data['email']}")
            return False, None
            
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Supabase error: {error_msg}")
        
        # Check if it's a duplicate user error
        if "already been registered" in error_msg.lower() or "already exists" in error_msg.lower():
            print(f"⚠️ User {user_data['email']} already exists in Supabase Auth")
            return False, None
        
        # If auth user creation fails, try just saving to profiles table as before
        try:
            supabase_user_data = {
                "id": user_data["id"],  # Use original UUID
                "email": user_data["email"],
                "name": user_data["name"],
                "avatar_url": user_data["avatar_url"],
                "is_creator": False,
                "created_at": user_data["created_at"].isoformat()
            }
            
            result = supabase.table("profiles").insert(supabase_user_data).execute()
            
            if result.data:
                print(f"✅ User saved to profiles only: {user_data['email']}")
                return True, None
            else:
                print(f"❌ Failed to save user to profiles: {user_data['email']}")
                return False, None
                
        except Exception as fallback_error:
            print(f"❌ Fallback save also failed: {str(fallback_error)}")
            return False, None

# Routes
@app.get("/")
async def root():
    return {"message": "IndieMentor JWT API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "OK",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": "FastAPI JWT with Supabase integration",
        "services": {
            "jwt_auth": "available",
            "supabase": "connected" if supabase_enabled else "not configured"
        }
    }

@app.post("/auth/register", response_model=LoginResponse)
async def register(user_data: UserRegister):
    """Register a new user"""
    
    # Check if user already exists in memory or Supabase
    if find_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists in memory"
        )
    
    # Check if user exists in Supabase Auth
    if await check_user_exists_in_supabase(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists in Supabase"
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user object (include plain password for Supabase Auth)
    new_user = {
        "id": str(uuid.uuid4()),  # Generate proper UUID (will be updated if Supabase succeeds)
        "email": user_data.email,
        "password": hashed_password,
        "plain_password": user_data.password,  # For Supabase Auth creation
        "name": user_data.name,
        "role": "user",
        "subscription_tier": "free",
        "avatar_url": f"https://api.dicebear.com/7.x/initials/svg?seed={user_data.name.replace(' ', '%20')}",
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    # Save to Supabase first and get the Auth user ID
    supabase_success, auth_user_id = await save_user_to_supabase(new_user)
    
    # If Supabase Auth creation succeeded, use the Auth user ID
    if supabase_success and auth_user_id:
        new_user["id"] = auth_user_id  # Update with Supabase Auth ID
        print(f"🔄 Updated user ID to Supabase Auth ID: {auth_user_id}")
    
    # Final check if user was created in memory during the process
    existing_user = find_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Add to in-memory storage
    users_db.append(new_user)
    
    print(f"✅ User registered successfully: {user_data.email}")
    if supabase_success:
        print(f"✅ User data saved to Supabase")
    else:
        print(f"⚠️ User registered locally but Supabase save failed")
    
    # Generate JWT token for immediate login after registration
    token = create_jwt_token(new_user)
    
    # Create user response
    user_response = UserResponse(
        id=new_user["id"],
        email=new_user["email"],
        name=new_user["name"],
        avatar_url=new_user["avatar_url"],
        role=new_user["role"],
        subscription_tier=new_user["subscription_tier"],
        created_at=new_user["created_at"]
    )
    
    return LoginResponse(
        message="User created successfully",
        token=token,
        user=user_response
    )

@app.post("/auth/login", response_model=LoginResponse)
async def login(login_data: UserLogin):
    """Login user and return JWT token"""
    
    # Find user
    user = find_user_by_email(login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials"
        )
    
    # Generate JWT token
    token = create_jwt_token(user)
    
    # Create response
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

@app.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
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

@app.post("/auth/validate")
async def validate_token(token_data: dict):
    """Validate JWT token"""
    token = token_data.get("token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required"
        )
    
    try:
        payload = verify_jwt_token(token)
        user = find_user_by_email(payload["email"])
        
        if not user or not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found"
            )
        
        return {
            "valid": True,
            "payload": {
                "user_id": payload["user_id"],
                "email": payload["email"],
                "name": payload["name"],
                "role": payload["role"],
                "exp": payload["exp"]
            },
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "avatar_url": user["avatar_url"],
                "role": user["role"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        return {
            "valid": False,
            "message": "Token validation failed"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
