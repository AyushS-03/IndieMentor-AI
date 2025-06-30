from sqlalchemy import create_engine, Column, String, Boolean, DateTime, Text, Integer, ARRAY, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from dotenv import load_dotenv
import os
from datetime import datetime, timezone

# Load environment variables
load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./indiementor.db")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=True)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)  # hashed password
    avatar_url = Column(String, nullable=True)
    role = Column(String, default="user", nullable=False)  # user, admin, mentor, creator
    subscription_tier = Column(String, default="free", nullable=False)  # free, basic, premium, enterprise
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class Mentor(Base):
    __tablename__ = "mentors"
    
    id = Column(String, primary_key=True, index=True)
    creator_id = Column(String, nullable=False)  # References users.id
    name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    avatar_url = Column(String, nullable=True)
    price = Column(Float, default=0.0, nullable=False)
    expertise = Column(ARRAY(String), nullable=False)  # Array of expertise areas
    status = Column(String, default="active", nullable=False)  # draft, active, paused
    subscribers_count = Column(Integer, default=0, nullable=False)
    conversations_count = Column(Integer, default=0, nullable=False)
    revenue = Column(Float, default=0.0, nullable=False)
    personality = Column(Text, nullable=True)  # AI personality/behavior description
    system_prompt = Column(Text, nullable=True)  # Custom system prompt for AI
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False)  # References users.id
    mentor_id = Column(String, nullable=False)  # References mentors.id
    title = Column(String, nullable=True)
    status = Column(String, default="active", nullable=False)  # active, paused, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, nullable=False)  # References conversations.id
    sender_type = Column(String, nullable=False)  # user, mentor
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database
def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")

def drop_db():
    """Drop all tables"""
    Base.metadata.drop_all(bind=engine)
    print("✅ Database tables dropped successfully")

def reset_db():
    """Reset database (drop and create)"""
    drop_db()
    init_db()

if __name__ == "__main__":
    init_db()
