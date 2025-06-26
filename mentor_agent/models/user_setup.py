from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class UserSetup(BaseModel):
    user_id: str = Field(..., example="user123")
    name: str = Field(..., example="Madhurjya")
    education: str = Field(..., example="BTech CSE, 2nd Year")
    goal: str = Field(..., example="Get a high-paying job")
    strengths: Optional[List[str]] = Field(default=[], example=["DSA", "Python"])
    weaknesses: Optional[List[str]] = Field(default=[], example=["Communication"])
    mentor_type: Optional[str] = Field(default="Tech Mentor", example="Tech Mentor")
    personality: Optional[Literal["Concise", "Professional", "Friendly", "Challenger", "Cheerful", "Empathetic"]] = Field(
        default="Concise",
        description="Defines the communication style of the mentor.",
        example="Friendly"
    )
