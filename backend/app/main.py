"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.config import settings


# Create FastAPI app
app = FastAPI(
    title="UGC Video Testing Platform API",
    description="LangGraph-powered backend for simulating video performance across social media platforms",
    version="1.0.0",
)


# Configure CORS
origins = settings.CORS_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all uncaught exceptions."""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc),
        },
    )


# Include API routes
app.include_router(router, prefix="/api/v1", tags=["video-testing"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "UGC Video Testing Platform API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    print("\n" + "="*60)
    print("UGC Video Testing Platform - Backend Starting")
    print("="*60)
    print(f"API Host: {settings.API_HOST}")
    print(f"API Port: {settings.API_PORT}")
    print(f"Gemini Model: {settings.GEMINI_MODEL}")
    print(f"Max Concurrent API Calls: {settings.GEMINI_MAX_CONCURRENT}")
    print("="*60 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    print("\n" + "="*60)
    print("UGC Video Testing Platform - Backend Shutting Down")
    print("="*60 + "\n")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD,
    )
