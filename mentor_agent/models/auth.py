from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

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

class RegisterResponse(BaseModel):
    message: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: str
    email: str
    name: str
    role: str
    exp: datetime