@echo off
echo Starting FastAPI JWT Backend...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Start the server
echo.
echo 🚀 Starting FastAPI server on http://localhost:8000
echo 📊 API Documentation: http://localhost:8000/docs
echo 🔧 Health Check: http://localhost:8000/health
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
