from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class MentorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    price: int = Field(..., ge=0, le=10000)
    expertise: List[str] = Field(..., min_items=1, max_items=20)
    personality: Optional[str] = Field(default="Professional", max_length=100)
    communication_style: Optional[str] = Field(default="Clear and helpful", max_length=200)
    target_audience: Optional[str] = Field(default="General learners", max_length=200)
    background: Optional[str] = Field(default="", max_length=1000)

class MentorCreate(MentorBase):
    creator_id: str = Field(..., description="UUID of the creator")

class MentorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    price: Optional[int] = Field(None, ge=0, le=10000)
    expertise: Optional[List[str]] = Field(None, min_items=1, max_items=20)
    status: Optional[Literal["draft", "active", "paused"]] = None

class MentorResponse(MentorBase):
    id: str
    creator_id: str
    avatar_url: Optional[str] = None
    status: Literal["draft", "active", "paused"]
    subscribers_count: int = 0
    conversations_count: int = 0
    revenue: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True