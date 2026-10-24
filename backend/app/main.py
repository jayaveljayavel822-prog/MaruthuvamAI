from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.db.session import engine
from app.db.base import Base
# Import all models to ensure metadata registration
import app.models  # noqa

# API Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.health_logs import router as health_logs_router
from app.api.v1.medical_records import router as medical_records_router
from app.api.v1.medications import router as medications_router
from app.api.v1.appointments import router as appointments_router
from app.api.v1.chat import router as chat_router
from app.api.v1.triage import router as triage_router
from app.api.v1.fhir import router as fhir_router
from app.api.v1.healthcare_finder import router as healthcare_router
from app.api.v1.vitals import router as vitals_router

from contextlib import asynccontextmanager

setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Maruthuvam.AI database schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema initialized.")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI Health Copilot API supporting lifestyle tracking, medical OCR, symptom triage, and ABDM/FHIR interoperability.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER,
        "ocr_provider": settings.OCR_PROVIDER,
    }


# Include V1 Routers
prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=prefix)
app.include_router(users_router, prefix=prefix)
app.include_router(dashboard_router, prefix=prefix)
app.include_router(health_logs_router, prefix=prefix)
app.include_router(medical_records_router, prefix=prefix)
app.include_router(medications_router, prefix=prefix)
app.include_router(appointments_router, prefix=prefix)
app.include_router(chat_router, prefix=prefix)
app.include_router(triage_router, prefix=prefix)
app.include_router(fhir_router, prefix=prefix)
app.include_router(healthcare_router, prefix=prefix)
app.include_router(vitals_router, prefix=prefix)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."},
    )
