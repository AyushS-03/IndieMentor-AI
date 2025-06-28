"""
Setup script to create the users table in local Supabase
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')
load_dotenv()

def setup_supabase_table():
    try:
        # Get Supabase credentials
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            print("❌ Supabase credentials not found in .env.local")
            return False
        
        print(f"🔗 Connecting to Supabase: {supabase_url}")
        
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # SQL to create users table
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR PRIMARY KEY,
            email VARCHAR UNIQUE NOT NULL,
            name VARCHAR NOT NULL,
            avatar_url VARCHAR,
            role VARCHAR DEFAULT 'user' CHECK (role IN ('user', 'admin', 'mentor', 'creator')),
            subscription_tier VARCHAR DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            is_active BOOLEAN DEFAULT true
        );
        """
        
        # Create indexes
        create_indexes_sql = """
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        """
        
        print("📝 Creating users table...")
        result = supabase.rpc('exec_sql', {'sql': create_table_sql}).execute()
        
        print("📊 Creating indexes...")
        supabase.rpc('exec_sql', {'sql': create_indexes_sql}).execute()
        
        print("✅ Users table created successfully!")
        
        # Test if we can query the table
        print("🔍 Testing table access...")
        result = supabase.table("users").select("*").limit(1).execute()
        print("✅ Table access confirmed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up Supabase table: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up Supabase users table...")
    success = setup_supabase_table()
    
    if success:
        print("\n🎉 Setup complete! You can now run the FastAPI server.")
        print("Run: python main.py")
    else:
        print("\n💡 You can still run the FastAPI server without Supabase.")
        print("Run: python main.py")
