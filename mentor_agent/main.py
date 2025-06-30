from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from mentor_agent.routes.setup import setup_router
from mentor_agent.routes.chat import chat_router
from mentor_agent.routes.auth import auth_router
from mentor_agent.routes.mentors import mentors_router
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(title="Mentor Agent Backend", description="IndieMentor AI Backend with JWT Auth", version="2.0.0")

# Startup event
@app.on_event("startup")
async def startup_event():
    print("🚀 IndieMentor AI Backend started successfully!")
    print("📊 Using in-memory storage for demo")

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
api_router.include_router(mentors_router, prefix="/mentors", tags=["Mentors"])

app.include_router(api_router)

@app.get("/")
def root():
    return JSONResponse(
        status_code=200, 
        content={
            "message": "Welcome to the IndieMentor AI API!",
            "version": "2.0.0",
            "storage": "In-Memory",
            "features": ["JWT Authentication", "Mentor Management", "AI Chat", "User Profiles"]
        }
    )

@app.get("/health")
def health_check():
    return JSONResponse(
        status_code=200,
        content={"status": "healthy", "service": "IndieMentor AI Backend"}
    )