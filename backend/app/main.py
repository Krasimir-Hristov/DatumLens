# backend/app/main.py

from fastapi import FastAPI
from .config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for secure personal data and AI integration.",
    version="1.0.0",
)


@app.get("/")
def read_root():
    """
    Root endpoint to verify the backend is running.
    """
    return {
        "Hello": "DatumLens Backend is Running",
        "App_Name": settings.APP_NAME,
        "Supabase_URL_Loaded": settings.SUPABASE_URL is not None,
    }
