from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine
from app.models.base import BaseModel
from app.models.user import User, ArtisanProfile, ArtisanPhoto, UserSession, SocialAccount
from fastapi.staticfiles import StaticFiles
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up Artizaho Backend...")
    
    try:
        from scripts.seed_initial_data import seed_initial_data
        print("Seeding initial data...")
        seed_initial_data()
    except Exception as e:
        print(f"Warning: Could not seed initial data: {e}")

    
    yield

    print("Shutting down Artizaho Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Artizaho Backend API - Handmade Artisan Marketplace",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_dir = os.path.join(base_dir, 'static')
if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

allow_origin_regex = None
if settings.DEBUG:
    allow_origin_regex = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=settings.ALLOWED_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.DEBUG else ["localhost", "127.0.0.1"]
)

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
