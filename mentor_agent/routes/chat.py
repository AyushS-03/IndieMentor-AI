from fastapi import APIRouter, Form, Request, Query, UploadFile, File
from mentor_agent.states.mentor_flow import mentor_graph
from mentor_agent.memory.store import get_user_memory, update_user_memory
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

@chat_router.post("/", summary="Chat with a mentor bot", description="Send a message and optionally upload a document for context.")
async def chat(request: Request,
               bot_id: str = Query(...),
               text_input: str = Form(..., description="Message you want to send to your mentor bot"),
               file: UploadFile = File(None)
            ):
    # body = await request.json()
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

        memory = get_user_memory(bot_id)
        memory.setdefault("documents", []).append({"filename": file.filename, "content": document_text})
        update_user_memory(bot_id, memory)

    memory = get_user_memory(bot_id)
    profile = memory.get("profile", {})

    result = mentor_graph.invoke({"input": user_input, "user_id": bot_id, "profile": profile})
    return {
        "response": result.get("reply", "No reply generated"),
        "analytics": result.get("analytics", {})
    }
