from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routes.setup import setup_router
from backend.routes.chat import chat_router
from backend.routes.mentors import mentors_router
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="IndieMentor AI Backend",
    description="Backend API for IndieMentor AI platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(setup_router, prefix="/api/v1/setup", tags=["Setup"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(mentors_router, prefix="/api/v1/mentors", tags=["Mentors"])

@app.get("/")
async def root():
    return JSONResponse(
        status_code=200, 
        content={
            "message": "Welcome to IndieMentor AI Backend API!",
            "version": "1.0.0",
            "docs": "/docs"
        }
    )

@app.get("/health")
async def health_check():
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "IndieMentor AI Backend"
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )