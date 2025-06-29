from fastapi import APIRouter, File, UploadFile, Form
import fitz  # PyMuPDF
import docx
import os
import json

upload_router = APIRouter()
MEMORY_PATH = "mentor_agent/memory/user_memory.json"
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

@upload_router.post("/")
def upload_document(user_id: str = Form(...), file: UploadFile = File(...)):
    filename = file.filename
    ext = filename.split(".")[-1].lower()
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(save_path, "wb") as f:
        f.write(file.file.read())

    # Extract text
    if ext == "pdf":
        text = extract_text_from_pdf(save_path)
    elif ext in ["doc", "docx"]:
        text = extract_text_from_docx(save_path)
    else:
        return {"error": "Unsupported file format"}

    # Store in memory
    if os.path.exists(MEMORY_PATH):
        with open(MEMORY_PATH, "r") as f:
            all_data = json.load(f)
    else:
        all_data = {}

    user_data = all_data.get(user_id, {"tasks": [], "history": [], "documents": []})
    user_data["documents"].append({"filename": filename, "content": text})
    all_data[user_id] = user_data

    with open(MEMORY_PATH, "w") as f:
        json.dump(all_data, f, indent=2)

    return {"message": f"Uploaded and parsed {filename}", "content_snippet": text[:300]}

