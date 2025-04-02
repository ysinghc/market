from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.api.api_v1.api import api_router
from app.db.session import engine, get_db
from app.models import models

# Create tables
models.BaseModel.metadata.create_all(bind=engine)

app = FastAPI(
    title="FarmSync API",
    description="API for FarmSync marketplace",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory for uploads
uploads_dir = Path(__file__).parent.parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "Welcome to FarmSync API",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "api_prefix": "/api/v1"
    }

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Try to make a simple query using SQLAlchemy's text function
        result = db.execute(text("SELECT 1"))
        result.scalar()  # Actually execute the query
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)} 