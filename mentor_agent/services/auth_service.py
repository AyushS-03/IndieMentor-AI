from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta, timezone
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv()

# Debug environment variables
print("🔍 Environment Debug:")
print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL')}")
print(f"SUPABASE_SERVICE_ROLE_KEY exists: {bool(os.getenv('SUPABASE_SERVICE_ROLE_KEY'))}")
print(f"SUPABASE_ANON_KEY exists: {bool(os.getenv('SUPABASE_ANON_KEY'))}")

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_jwt_key_for_development_12345")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

# Supabase Configuration - Prioritize SERVICE_ROLE_KEY
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Use SERVICE_ROLE_KEY if available, otherwise fallback to ANON_KEY
SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY

print(f"🔑 Using key type: {'SERVICE_ROLE' if SUPABASE_SERVICE_ROLE_KEY else 'ANON' if SUPABASE_ANON_KEY else 'NONE'}")

# Initialize Supabase client
supabase: Optional[Client] = None
supabase_enabled = False

if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "your_supabase_url":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        supabase_enabled = True
        key_type = "service role" if os.getenv("SUPABASE_SERVICE_ROLE_KEY") else "anon"
        print(f"✅ Supabase client initialized successfully with {key_type} key")
    except Exception as e:
        print(f"⚠️ Supabase initialization failed: {e}")
        supabase_enabled = False
else:
    print("⚠️ Supabase credentials not configured")
    print("💡 App will run without Supabase integration")

# Security
security = HTTPBearer()

# In-memory user storage (for demo/testing)
users_db = [
    {
        "id": "550e8400-e29b-41d4-a716-446655440001",
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
        "id": "550e8400-e29b-41d4-a716-446655440002",
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

class AuthService:
    @property
    def supabase_enabled(self):
        return supabase_enabled

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    @staticmethod
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
        print(f"🔑 JWT Token: {token}")
        return token

    @staticmethod
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

    @staticmethod
    def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
        """Get current user from JWT token"""
        token = credentials.credentials
        payload = AuthService.verify_jwt_token(token)

        user = next((u for u in users_db if u["id"] == payload["user_id"]), None)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        return user

    @staticmethod
    def find_user_by_email(email: str) -> Optional[dict]:
        """Find user by email in memory storage"""
        return next((u for u in users_db if u["email"] == email), None)

    @staticmethod
    async def check_user_exists_in_supabase(email: str) -> bool:
        """Check if user exists in Supabase Auth"""
        if not supabase_enabled or not supabase:
            print("🔍 Supabase not enabled, skipping user existence check")
            return False

        # Only use auth.admin if we have service role key
        if not SUPABASE_SERVICE_ROLE_KEY:
            print("🔍 No service role key, skipping user existence check")
            return False

        try:
            print(f"🔍 Checking if user {email} exists in Supabase...")
            result = supabase.auth.admin.list_users()
            if result and hasattr(result, 'users') and result.users:
                for user in result.users:
                    if user.email == email:
                        print(f"✅ User {email} found in Supabase")
                        return True
            print(f"❌ User {email} not found in Supabase")
            return False
        except Exception as e:
            print(f"⚠️ Error checking Supabase user existence: {e}")
            return False

    @staticmethod
    async def save_user_to_supabase(user_data: dict) -> tuple[bool, Optional[str]]:
        """Save user data to Supabase Auth and profiles table"""
        if not supabase_enabled or not supabase:
            print("⚠️ Supabase not configured, skipping user save")
            return False, None

        # Only use auth.admin if we have service role key
        if not SUPABASE_SERVICE_ROLE_KEY:
            print("⚠️ No service role key, cannot create users in Supabase Auth")
            print("💡 Consider using only local storage or get the service role key")
            return False, None

        try:
            print(f"🔄 Creating user in Supabase Auth: {user_data['email']}")

            # Create user in Supabase Auth
            auth_result = supabase.auth.admin.create_user({
                "email": user_data["email"],
                "password": user_data.get("plain_password", "temp_password_123"),
                "user_metadata": {
                    "name": user_data["name"],
                    "avatar_url": user_data["avatar_url"]
                },
                "email_confirm": True
            })

            if auth_result.user:
                auth_user_id = auth_result.user.id
                print(f"✅ User created in Supabase Auth: {user_data['email']} (ID: {auth_user_id})")

                # Try to save to profiles table (this might fail with RLS)
                try:
                    supabase_user_data = {
                        "id": auth_user_id,
                        "email": user_data["email"],
                        "name": user_data["name"],
                        "avatar_url": user_data["avatar_url"],
                        "is_creator": False,
                        "created_at": user_data["created_at"].isoformat()
                    }

                    profile_result = supabase.table("profiles").insert(supabase_user_data).execute()

                    if profile_result.data:
                        print(f"✅ User profile saved to Supabase: {user_data['email']}")
                        return True, auth_user_id
                    else:
                        print(f"⚠️ User created in Auth but profile save failed: {user_data['email']}")
                        return True, auth_user_id  # Still consider it success if auth user created

                except Exception as profile_error:
                    print(f"⚠️ Profile save failed (RLS?): {profile_error}")
                    print(f"✅ But user was created in Auth: {user_data['email']}")
                    return True, auth_user_id  # Auth user created successfully
            else:
                print(f"❌ Failed to create user in Supabase Auth: {user_data['email']}")
                return False, None

        except Exception as e:
            print(f"❌ Supabase error: {str(e)}")

            # Check if it's a duplicate user error
            error_str = str(e).lower()
            if "already been registered" in error_str or "already exists" in error_str or "duplicate" in error_str:
                print(f"⚠️ User {user_data['email']} already exists in Supabase")
                return False, None

            return False, None

# Create singleton instance
auth_service = AuthService()