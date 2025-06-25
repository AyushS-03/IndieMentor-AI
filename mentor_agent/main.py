# mentor_agent/main.py
from fastapi import FastAPI, APIRouter
from mentor_agent.routes.setup import setup_router
from mentor_agent.routes.chat import chat_router
from mentor_agent.routes.upload import upload_router

app = FastAPI(title="IndieMentor Backend")

api_router = APIRouter(prefix="/IndieMentor/api/v1")

api_router.include_router(setup_router, prefix="/setup", tags=["Setup"])
api_router.include_router(upload_router, prefix="/upload", tags=["Upload"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])

app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "IndieMentor is running"}
