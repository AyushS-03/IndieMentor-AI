from supabase import create_client, Client
from backend.config import settings
import logging

logger = logging.getLogger(__name__)

class SupabaseClient:
    def __init__(self):
        self.client: Client = None
        self.initialize()
    
    def initialize(self):
        """Initialize Supabase client"""
        try:
            if not settings.supabase_url or not settings.supabase_key:
                raise ValueError("Supabase URL and key are required")
            
            self.client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            raise
    
    def get_client(self) -> Client:
        """Get Supabase client instance"""
        if not self.client:
            self.initialize()
        return self.client

# Global Supabase client instance
supabase_client = SupabaseClient()

def get_supabase() -> Client:
    """Dependency to get Supabase client"""
    return supabase_client.get_client()