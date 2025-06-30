from typing import List, Optional
from fastapi import APIRouter, Body, Form, UploadFile, File, Depends
from mentor_agent.models.user_setup import UserSetup
from mentor_agent.memory.store import get_user_memory, update_user_memory
from mentor_agent.routes.auth import authenticate_user_basic
import os
import fitz  # PyMuPDF
import docx

setup_router = APIRouter()
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

@setup_router.post(
    "/",
    summary="Setup a new mentor bot",
    description="Provide user profile and optionally upload a DOCX/PDF to include in memory. Requires Basic Authentication (username: email, password: your password)."
)
async def setup_user(
    education: str = Form(...),
    goal: str = Form(...),
    strengths: Optional[List[str]] = Form(default=[]),
    weaknesses: Optional[List[str]] = Form(default=[]),
    mentor_type: Optional[str] = Form(default="Tech Mentor"),
    personality: Optional[str] = Form(default="Concise"),
    file: Optional[UploadFile] = File(None),
    current_user = Depends(authenticate_user_basic)
):
    # Extract user_id and name from authenticated user
    user_id = current_user['supabase_user_id']  # Use supabase_user_id as unique identifier
    name = current_user['full_name']

    user_data = UserSetup(
        user_id=user_id,
        name=name,
        education=education,
        goal=goal,
        strengths=strengths,
        weaknesses=weaknesses,
        mentor_type=mentor_type,
        personality=personality
    )

    document_text = ""
    filename = None

    if file:
        ext = file.filename.split(".")[-1].lower()
        path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(path, "wb") as f:
            f.write(file.file.read())
        if ext == "pdf":
            document_text = extract_text_from_pdf(path)
        elif ext in ["doc", "docx"]:
            document_text = extract_text_from_docx(path)
        filename = file.filename

    memory = {
        "profile": user_data.dict(),
        "tasks": [],
        "history": [],
        "documents": [{"filename": filename, "content": document_text}] if file else [],
        "last_check": None,
        "user_info": {
            "email": current_user['email'],
            "supabase_user_id": current_user['supabase_user_id'],
            "session_id": current_user.get('session_id'),
            "created_at": current_user.get('created_at'),
            "last_setup": current_user.get('last_login')
        }
    }

    update_user_memory(user_data.user_id, memory)

    return {
        "message": "Mentor bot created successfully.",
        "user_id": user_data.user_id,
        "supabase_user_id": current_user['supabase_user_id'],
        "email": current_user['email'],
        "name": name
    }

