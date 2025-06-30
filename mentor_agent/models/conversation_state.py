# mentor_agent/models/conversation_state.py
from pydantic import BaseModel

class MentorState(BaseModel):
    user_id: str
    input: str
    profile: dict = {}
    reply: str = ""  # Add this field
    analytics: dict = {}  # Add this field
