from pymongo import MongoClient
from datetime import datetime
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv("DATABASE_URL")
DATABASE_NAME = os.getenv('DATABASE_NAME')

class MongoMemoryStore:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[DATABASE_NAME]
        self.users_collection = self.db.users
        self.chats_collection = self.db.chats

    def get_user_memory(self, user_id: str) -> Dict:
        """Get user memory/profile from MongoDB"""
        user_doc = self.users_collection.find_one({"user_id": user_id})
        if user_doc:
            return user_doc.get("memory", {})
        return {}

    def update_user_memory(self, user_id: str, user_data: Dict):
        """Update user memory/profile in MongoDB"""
        self.users_collection.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "memory": user_data,
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )

    def save_chat_message(self, user_id: str, message: str, response: str, analytics: Dict = None):
        """Save chat message and response to MongoDB"""
        chat_doc = {
            "user_id": user_id,
            "message": message,
            "response": response,
            "analytics": analytics or {},
            "timestamp": datetime.utcnow()
        }
        result = self.chats_collection.insert_one(chat_doc)
        return str(result.inserted_id)

    def get_chat_history(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Get chat history for a user"""
        chats = self.chats_collection.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).limit(limit)

        return list(chats)

    def get_recent_conversations(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get recent conversation context for the AI"""
        chats = self.chats_collection.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).limit(limit)

        conversations = []
        for chat in reversed(list(chats)):  # Reverse to get chronological order
            conversations.extend([
                {"role": "user", "content": chat["message"]},
                {"role": "assistant", "content": chat["response"]}
            ])

        return conversations

# Create global instance
mongo_store = MongoMemoryStore()

# Backward compatibility functions
def get_user_memory(user_id: str) -> Dict:
    return mongo_store.get_user_memory(user_id)

def update_user_memory(user_id: str, user_data: Dict):
    return mongo_store.update_user_memory(user_id, user_data)