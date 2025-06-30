from fastapi import APIRouter, Form, UploadFile, File, Depends
from mentor_agent.states.mentor_flow import mentor_graph
from mentor_agent.memory.store import mongo_store, get_user_memory, update_user_memory
from mentor_agent.routes.auth import authenticate_user_basic, get_current_user
import os
import fitz
import docx

chat_router = APIRouter()
UPLOAD_FOLDER = "mentor_agent/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

@chat_router.post("/", summary="Chat with a mentor bot", description="Send a message and optionally upload a document for context. Requires Bearer token authentication.")
async def chat(
    text_input: str = Form(..., description="Message you want to send to your mentor bot"),
    file: UploadFile = File(None),
    current_user = Depends(authenticate_user_basic)
):
    # Extract user_id from authenticated user (using supabase_user_id)
    user_id = current_user['supabase_user_id']
    user_input = text_input
    document_text = ""

    if file:
        ext = file.filename.split(".")[-1].lower()
        path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(path, "wb") as f:
            f.write(file.file.read())
        if ext == "pdf":
            document_text = extract_text_from_pdf(path)
        elif ext in ["doc", "docx"]:
            document_text = extract_text_from_docx(path)

        memory = get_user_memory(user_id)
        memory.setdefault("documents", []).append({"filename": file.filename, "content": document_text})
        update_user_memory(user_id, memory)

    memory = get_user_memory(user_id)
    profile = memory.get("profile", {})

    # Get recent conversation history for context
    recent_conversations = mongo_store.get_recent_conversations(user_id, limit=10)

    result = mentor_graph.invoke({
        "input": user_input,
        "user_id": user_id,
        "profile": profile,
        "conversation_history": recent_conversations
    })

    # Save the chat to MongoDB
    chat_id = mongo_store.save_chat_message(
        user_id=user_id,
        message=user_input,
        response=result.get("reply", "No reply generated"),
        analytics=result.get("analytics", {})
    )

    return {
        "response": result.get("reply", "No reply generated"),
        "analytics": result.get("analytics", {}),
        "chat_id": chat_id,
        "user_info": {
            "user_id": user_id,
            "email": current_user['email'],
            "supabase_user_id": current_user['supabase_user_id']
        }
    }

@chat_router.get("/history", summary="Get chat history")
async def get_chat_history(
    limit: int = 50,
    current_user = Depends(authenticate_user_basic)
):
    user_id = current_user['supabase_user_id']
    history = mongo_store.get_chat_history(user_id, limit)

    return {
        "chats": history,
        "user_id": user_id
    }