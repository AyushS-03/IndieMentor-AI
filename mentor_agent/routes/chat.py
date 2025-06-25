from fastapi import APIRouter, Request
from ..states.mentor_flow import mentor_graph

chat_router = APIRouter()

@chat_router.post("/")
async def chat(request: Request):
    body = await request.json()
    user_input = body.get("input", "")
    user_id = body.get("user_id", "user123")
    result = mentor_graph.invoke({"input": user_input, "user_id": user_id})
    return {"response": result.get("reply", "No reply generated"), "tasks": result.get("tasks", [])}