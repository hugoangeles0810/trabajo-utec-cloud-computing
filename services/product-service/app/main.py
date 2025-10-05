from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
from .config import settings
from .database import create_tables
from .api.v1.api import api_router

# Create FastAPI app
app = FastAPI(
    title="Gamarriando Product Service",
    description="Product management microservice for Gamarriando marketplace",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else ["https://gamarriando.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["gamarriando.com", "*.gamarriando.com"]
    )

# Include API router
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup"""
    try:
        create_tables()
    except Exception as e:
        # Log error but don't fail startup in Lambda
        print(f"Warning: Could not create tables: {e}")
        pass

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Gamarriando Product Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "product-service",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )