from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # AI Configuration
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    groq_api_key: Optional[str] = os.getenv("GROQ_API_KEY")
    
    # Application Configuration
    app_name: str = "IndieMentor AI Backend"
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS Configuration
    allowed_origins: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173", 
        "http://localhost:3000"
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()