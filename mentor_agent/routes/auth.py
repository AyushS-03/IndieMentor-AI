from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, HTTPBasic, HTTPBasicCredentials
from supabase import create_client, Client
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Validate required environment variables
if not all([SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Missing required Supabase environment variables")

# Initialize Supabase clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY or SUPABASE_KEY)

# Create router instance
router = APIRouter()
security = HTTPBearer()
basic_auth = HTTPBasic()

# Pydantic models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class SessionSyncRequest(BaseModel):
    supabase_user_id: str
    supabase_access_token: str
    supabase_refresh_token: str
    email: str
    metadata: Optional[Dict[str, Any]] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]
    expires_in: int

class MessageResponse(BaseModel):
    message: str
    email: Optional[str] = None
    confirmation_required: Optional[bool] = None

# Utility functions
def extract_user_info_from_supabase_jwt(supabase_access_token: str):
    """Extract user information from Supabase JWT token"""
    try:
        # Decode without verification first to get the payload
        # Note: Supabase tokens are signed with their own secret
        decoded_token = jwt.decode(supabase_access_token, options={"verify_signature": False})

        user_id = decoded_token.get('sub')
        email = decoded_token.get('email')
        user_metadata = decoded_token.get('user_metadata', {})
        app_metadata = decoded_token.get('app_metadata', {})

        # Extract session ID (usually the 'jti' claim or generate from user_id + timestamp)
        session_id = decoded_token.get('jti', f"{user_id}_{int(datetime.utcnow().timestamp())}")

        # Extract name from metadata
        full_name = user_metadata.get('full_name') or user_metadata.get('name') or email.split('@')[0]

        return {
            'user_id': user_id,
            'email': email,
            'full_name': full_name,
            'session_id': session_id,
            'user_metadata': user_metadata,
            'app_metadata': app_metadata,
            'issued_at': decoded_token.get('iat'),
            'expires_at': decoded_token.get('exp')
        }
    except Exception as e:
        logger.error(f"Error extracting user info from Supabase JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Supabase token"
        )

def create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT token for FastAPI backend with enhanced claims"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    # Add standard JWT claims
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "iss": "IndieMentor-AI",  # Issuer
        "aud": "fastapi-backend"  # Audience
    })

    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_jwt_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        return payload
    except jwt.PyJWTError as e:
        logger.error(f"JWT verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = credentials.credentials
    payload = verify_jwt_token(token)

    try:
        response = supabase_admin.table('users').select('*').eq('email', payload.get('sub')).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return response.data[0]
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )

# New authentication function for setup endpoint
async def authenticate_user_basic(credentials: HTTPBasicCredentials = Depends(basic_auth)):
    """Authenticate user with username/password for setup endpoint"""
    try:
        # Use email as username
        email = credentials.username
        password = credentials.password

        logger.info(f"Basic auth attempt for: {email}")

        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if auth_response.user is None or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Basic"},
            )

        # Check if email is confirmed
        if not auth_response.user.email_confirmed_at:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email not confirmed",
                headers={"WWW-Authenticate": "Basic"},
            )

        # Extract user info from Supabase JWT
        user_info = extract_user_info_from_supabase_jwt(auth_response.session.access_token)

        # Get or create user in custom table
        try:
            user_response = supabase_admin.table('users').select('*').eq('email', email).execute()

            if not user_response.data:
                # Create user record
                user_record = {
                    "id": auth_response.user.id,
                    "email": email,
                    "full_name": user_info['full_name'],
                    "created_at": datetime.utcnow().isoformat(),
                    "is_active": True,
                    "supabase_user_id": auth_response.user.id,
                    "session_id": user_info['session_id']
                }
                supabase_admin.table('users').insert(user_record).execute()
                user_data = user_record
            else:
                user_data = user_response.data[0]
                # Update session info
                supabase_admin.table('users').update({
                    "last_login": datetime.utcnow().isoformat(),
                    "session_id": user_info['session_id']
                }).eq('id', user_data['id']).execute()
                user_data['session_id'] = user_info['session_id']

        except Exception as db_error:
            logger.error(f"Database error during basic auth: {str(db_error)}")
            # Continue with auth user data
            user_data = {
                "id": auth_response.user.id,
                "email": email,
                "full_name": user_info['full_name'],
                "supabase_user_id": auth_response.user.id,
                "session_id": user_info['session_id']
            }

        # Add extracted info to user data
        user_data.update({
            'supabase_access_token': auth_response.session.access_token,
            'supabase_user_info': user_info
        })

        return user_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Basic authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Basic"},
        )

# Authentication endpoints
@router.post("/register")
async def register(user_data: UserRegister):
    """Register new user with Supabase and create local JWT"""
    try:
        logger.info(f"Attempting to register user: {user_data.email}")

        # Register user with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name
                }
            }
        })

        if auth_response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Email may already be in use."
            )

        # Check if user needs email confirmation
        if not auth_response.session:
            return MessageResponse(
                message="Registration successful. Please check your email to confirm your account.",
                email=user_data.email,
                confirmation_required=True
            )

        # Extract user info from Supabase JWT if session exists
        if auth_response.session:
            user_info = extract_user_info_from_supabase_jwt(auth_response.session.access_token)
            session_id = user_info['session_id']
        else:
            session_id = f"{auth_response.user.id}_{int(datetime.utcnow().timestamp())}"

        # Create user record in custom table
        user_record = {
            "id": auth_response.user.id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True,
            "supabase_user_id": auth_response.user.id,
            "session_id": session_id
        }

        try:
            supabase_admin.table('users').insert(user_record).execute()
            logger.info(f"User record created in database: {user_data.email}")
        except Exception as db_error:
            logger.error(f"Database insert error: {str(db_error)}")
            # Continue anyway, user is created in auth

        # Create JWT token for FastAPI backend
        access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_jwt_token(
            data={
                "sub": user_data.email,
                "user_id": auth_response.user.id,
                "session_id": session_id,
                "full_name": user_data.full_name
            },
            expires_delta=access_token_expires
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_record,
            expires_in=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    except HTTPException:
        raise

    except Exception as e:
        error_message = str(e).lower()
        logger.error(f"Registration error: {str(e)}")

        if "email already registered" in error_message or "already been registered" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered. Please try logging in instead."
            )
        elif "password" in error_message and ("weak" in error_message or "short" in error_message):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too weak. Please use at least 6 characters."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {str(e)}"
            )

@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin):
    """Login user with Supabase and create local JWT"""
    try:
        logger.info(f"Attempting login for user: {user_credentials.email}")

        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_credentials.email,
            "password": user_credentials.password
        })

        # Check for authentication errors
        if auth_response.user is None or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Check if email is confirmed
        if not auth_response.user.email_confirmed_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not confirmed. Please check your email and confirm your account."
            )

        # Extract user info from Supabase JWT
        user_info = extract_user_info_from_supabase_jwt(auth_response.session.access_token)

        # Get or create user details in custom table
        try:
            user_response = supabase_admin.table('users').select('*').eq('email', user_credentials.email).execute()

            if not user_response.data:
                # If user doesn't exist in custom table, create it
                user_record = {
                    "id": auth_response.user.id,
                    "email": user_credentials.email,
                    "full_name": user_info['full_name'],
                    "created_at": datetime.utcnow().isoformat(),
                    "is_active": True,
                    "supabase_user_id": auth_response.user.id,
                    "session_id": user_info['session_id']
                }
                supabase_admin.table('users').insert(user_record).execute()
                user_data = user_record
                logger.info(f"Created user record for existing auth user: {user_credentials.email}")
            else:
                user_data = user_response.data[0]
                # Update last login and session info
                supabase_admin.table('users').update({
                    "last_login": datetime.utcnow().isoformat(),
                    "session_id": user_info['session_id']
                }).eq('id', user_data['id']).execute()
                user_data['session_id'] = user_info['session_id']

        except Exception as db_error:
            logger.error(f"Database error: {str(db_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(db_error)}"
            )

        # Create JWT token for FastAPI backend with session info
        access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_jwt_token(
            data={
                "sub": user_credentials.email,
                "user_id": auth_response.user.id,
                "session_id": user_info['session_id'],
                "full_name": user_info['full_name']
            },
            expires_delta=access_token_expires
        )

        logger.info(f"Successful login for user: {user_credentials.email}")

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_data,
            expires_in=JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

    except HTTPException:
        raise

    except Exception as e:
        error_message = str(e).lower()
        logger.error(f"Login error: {str(e)}")

        if "email not confirmed" in error_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not confirmed. Please check your email and confirm your account."
            )
        elif "invalid login credentials" in error_message or "invalid" in error_message:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        elif "email rate limit exceeded" in error_message or "rate limit" in error_message:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again later."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Login failed: {str(e)}"
            )

@router.post("/sync-session")
async def sync_user_session(
    session_data: SessionSyncRequest,
    current_user = Depends(get_current_user)
):
    """Sync Supabase session data with FastAPI backend after JWT token generation"""
    try:
        logger.info(f"Syncing session for user: {current_user.get('email')}")

        # Update user session information
        session_update = {
            "supabase_user_id": session_data.supabase_user_id,
            "last_login": datetime.utcnow().isoformat(),
            "session_metadata": session_data.metadata,
            "updated_at": datetime.utcnow().isoformat()
        }

        # Update user record with session info
        supabase_admin.table('users').update(session_update).eq('id', current_user['id']).execute()

        return {
            "status": "success",
            "message": "Session synced successfully",
            "user_id": current_user['id'],
            "synced_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Session sync error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Session sync failed: {str(e)}"
        )

@router.get("/me")
async def get_current_user_profile(current_user = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "user": current_user,
        "message": "User profile retrieved successfully"
    }

@router.post("/refresh")
async def refresh_token(current_user = Depends(get_current_user)):
    """Refresh JWT token"""
    access_token_expires = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_jwt_token(
        data={
            "sub": current_user['email'],
            "user_id": current_user['id'],
            "session_id": current_user.get('session_id'),
            "full_name": current_user.get('full_name')
        },
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/resend-confirmation")
async def resend_confirmation_email(request: Dict[str, str]):
    """Resend email confirmation"""
    try:
        email = request.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )

        result = supabase.auth.resend({
            "type": "signup",
            "email": email
        })

        return {
            "message": "Confirmation email sent successfully",
            "email": email
        }

    except Exception as e:
        logger.error(f"Resend confirmation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend confirmation email: {str(e)}"
        )

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """Logout user (invalidate session)"""
    try:
        # In a real implementation, you might want to blacklist the JWT token
        # For now, we'll just return a success message
        logger.info(f"User logged out: {current_user.get('email')}")

        return {
            "message": "Logout successful",
            "user_id": current_user['id']
        }

    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )