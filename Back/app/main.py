from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine
from app.models.base import BaseModel
# Import user models to ensure they are registered
from app.models.user import User, ArtisanProfile, ArtisanPhoto, UserSession, SocialAccount


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Artizaho Backend...")
    # Create database tables
    # Don't create tables here - use Alembic migrations instead
    # This avoids loading all models and their relationships
    # BaseModel.metadata.create_all(bind=engine)
    
    # Seed initial data (categories, admin user)
    try:
        from scripts.seed_initial_data import seed_initial_data
        print("Seeding initial data...")
        seed_initial_data()
    except Exception as e:
        print(f"Warning: Could not seed initial data: {e}")
        # Ne pas bloquer le démarrage si le seed échoue
        # (peut arriver si les tables n'existent pas encore)
    
    yield
    # Shutdown
    print("Shutting down Artizaho Backend...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Artizaho Backend API - Handmade Artisan Marketplace",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.ALLOWED_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["localhost", "127.0.0.1"]
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "message": "Welcome to Artizaho Backend API",
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    ) 