from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
from mentor_agent.routes.setup import setup_router
from mentor_agent.routes.chat import chat_router
from dotenv import load_dotenv
import os


load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))


app = FastAPI(title="Mentor Agent Backend")

api_router = APIRouter(prefix="/IndieMentor/api/v1")

api_router.include_router(setup_router, prefix="/setup", tags=["Setup"])
api_router.include_router(chat_router, prefix="/chat", tags=["Chat"])

app.include_router(api_router)

@app.get("/")
def root():
    return JSONResponse(status_code=200, content={"message": "Welcome to the Mentor Agent API!"})
