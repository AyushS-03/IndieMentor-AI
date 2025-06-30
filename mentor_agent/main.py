from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from mentor_agent.routes.setup import setup_router
from mentor_agent.routes.chat import chat_router
from mentor_agent.routes.auth import auth_router
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(title="Mentor Agent Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/IndieMentor/api/v1")

api_router.include_router(setup_router, prefix="/setup", tags=["Setup"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])

app.include_router(api_router)

@app.get("/")
def root():
    return JSONResponse(status_code=200, content={"message": "Welcome to the Mentor Agent API!"})