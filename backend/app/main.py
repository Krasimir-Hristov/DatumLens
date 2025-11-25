"""
DatumLens RAG API - Main application entry point.

This module initializes the FastAPI application, configures CORS,
and registers all API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.document import router as document_router
from app.db.supabase import get_supabase_client

# Create FastAPI application instance
app = FastAPI(
    title="DatumLens RAG API",
    version="1.0.0",
    description="API за интелигентен анализ на документи с RAG",
)

# CORS configuration for cross-origin requests
# This allows the frontend (Next.js on port 3000) to communicate
# with the backend (FastAPI on port 8000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(document_router)


@app.get("/health")
async def health_check():
    """
    Health check endpoint - verifies API and database connectivity.

    Returns:
        dict: Status information including database connection state
    """
    try:
        supabase = get_supabase_client()

        # Perform lightweight database query to verify connection
        _ = (
            supabase.table("document_chunks")
            .select("id", count="exact")
            .limit(1)
            .execute()
        )

        return {
            "status": "ok",
            "message": "DatumLens API & DB are running 🚀",
            "db_connection": "active",
        }
    except Exception as e:  # pylint: disable=broad-except
        # Broad exception is intentional here for health checks
        return {
            "status": "error",
            "message": f"Database connection failed: {str(e)}",
            "db_connection": "inactive",
        }


@app.get("/")
async def root():
    """
    Root endpoint - provides API information.

    Returns:
        dict: Welcome message with link to API documentation
    """
    return {"message": "Welcome to DatumLens API. Visit /docs for Swagger UI."}
