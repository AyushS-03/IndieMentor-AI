from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv()

# Debug environment variables
print("🔍 Environment Debug:")
print(f"JWT_SECRET exists: {bool(os.getenv('JWT_SECRET'))}")

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_jwt_key_for_development_12345_updated_2024")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "168"))  # 7 days

print(f"🔑 JWT Configuration: Algorithm={JWT_ALGORITHM}, Expiration={JWT_EXPIRATION_HOURS}h")

# Security
security = HTTPBearer()

# In-memory user storage (for demo/testing)
users_db = [
    {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "email": "demo@example.com",
        "name": "Demo User",
        "password": "$2b$12$VjiB/Ls49EyokEIRbs0CvOYXvtLHzbqi0iSVHHf0KxJIf4O2.Fc2a",  # demo123
        "plain_password": "demo123",
        "role": "user",
        "subscription_tier": "free",
        "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=Demo%20User",
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    },
    {
        "id": "550e8400-e29b-41d4-a716-446655440002", 
        "email": "admin@example.com",
        "name": "Admin User",
        "password": "$2b$12$VjiB/Ls49EyokEIRbs0CvOYXvtLHzbqi0iSVHHf0KxJIf4O2.Fc2a",  # demo123
        "plain_password": "admin123",
        "role": "admin",
        "subscription_tier": "enterprise",
        "avatar_url": "https://api.dicebear.com/7.x/initials/svg?seed=Admin%20User",
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
]

class AuthService:
    def __init__(self):
        print("✅ AuthService initialized successfully")

    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception as e:
            print(f"⚠️ Password verification error: {e}")
            return False

    def create_jwt_token(self, user_data: dict) -> str:
        """Create a JWT token for the user"""
        # Determine permissions based on role
        permissions = self._get_permissions_for_role(user_data.get("role", "user"))
        
        # Token payload with extended information
        payload = {
            "userId": user_data["id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "role": user_data.get("role", "user"),
            "roleId": self._get_role_id(user_data.get("role", "user")),
            "subscriptionTier": user_data.get("subscription_tier", "free"),
            "permissions": permissions,
            "isActive": user_data.get("is_active", True),
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
        }
        
        token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        print(f"🔑 JWT token created for user: {user_data['email']} (role: {user_data.get('role', 'user')})")
        return token

    def _get_permissions_for_role(self, role: str) -> List[str]:
        """Get permissions based on user role"""
        role_permissions = {
            "admin": ["read", "write", "admin", "manage_users", "create_mentor", "manage_mentors"],
            "creator": ["read", "write", "create_mentor", "manage_own_mentors"],
            "mentor": ["read", "write", "mentor_chat"],
            "user": ["read", "chat_with_mentors"]
        }
        return role_permissions.get(role, ["read"])

    def _get_role_id(self, role: str) -> int:
        """Get numeric role ID"""
        role_ids = {
            "admin": 1,
            "creator": 2,
            "mentor": 3,
            "user": 4
        }
        return role_ids.get(role, 4)

    def decode_jwt_token(self, token: str) -> Optional[dict]:
        """Decode and validate a JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            print("🔑 JWT token has expired")
            return None
        except jwt.InvalidTokenError as e:
            print(f"🔑 Invalid JWT token: {e}")
            return None

    def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        """Get current user from JWT token"""
        token = credentials.credentials
        payload = self.decode_jwt_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("userId")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = self.find_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user

    def find_user_by_email(self, email: str) -> Optional[dict]:
        """Find user by email"""
        for user in users_db:
            if user["email"] == email:
                return user
        return None

    def find_user_by_id(self, user_id: str) -> Optional[dict]:
        """Find user by ID"""
        for user in users_db:
            if user["id"] == user_id:
                return user
        return None

    def create_user(self, user_data: dict) -> dict:
        """Create a new user in memory"""
        new_user = {
            "id": user_data["id"],
            "email": user_data["email"],
            "name": user_data["name"],
            "password": user_data["password"],
            "avatar_url": user_data.get("avatar_url"),
            "role": user_data.get("role", "user"),
            "subscription_tier": user_data.get("subscription_tier", "free"),
            "is_active": user_data.get("is_active", True),
            "created_at": datetime.now(timezone.utc)
        }
        
        users_db.append(new_user)
        return new_user

# Create global auth service instance
auth_service = AuthService()
