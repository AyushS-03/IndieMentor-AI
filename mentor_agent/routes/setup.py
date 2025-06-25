# mentor_agent/routes/setup.py
from fastapi import APIRouter
from .models import UserSetup
import json
import os

setup_router = APIRouter()
MEMORY_PATH = "mentor_agent/memory/user_memory.json"

@setup_router.post(
    "/",
    summary="Setup user profile for mentoring",
    description="Provide user ID, education, goal, strengths, weaknesses, and preferred mentor type."
)
def setup_user(data: UserSetup):
    # Load existing memory
    if os.path.exists(MEMORY_PATH):
        with open(MEMORY_PATH, "r") as f:
            memory = json.load(f)
    else:
        memory = {}

    # Insert or update user
    memory[data.user_id] = {
        "profile": data.dict(),
        "tasks": [],
        "history": [],
        "documents": []
    }

    with open(MEMORY_PATH, "w") as f:
        json.dump(memory, f, indent=2)

    return {"message": "User setup complete", "user_id": data.user_id}
