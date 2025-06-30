import os
import json

MEMORY_PATH = "mentor_agent/memory/user_memory.json"
os.makedirs(os.path.dirname(MEMORY_PATH), exist_ok=True)

def get_user_memory(user_id: str):
    if os.path.exists(MEMORY_PATH):
        with open(MEMORY_PATH, "r") as f:
            memory = json.load(f)
        return memory.get(user_id, {})
    return {}

def update_user_memory(user_id: str, user_data: dict):
    memory = {}
    if os.path.exists(MEMORY_PATH):
        with open(MEMORY_PATH, "r") as f:
            memory = json.load(f)
    memory[user_id] = user_data
    with open(MEMORY_PATH, "w") as f:
        json.dump(memory, f, indent=2)
