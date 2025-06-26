# mentor_agent/models/conversation_state.py
from pydantic import BaseModel

class MentorState(BaseModel):
    user_id: str
    input: str
