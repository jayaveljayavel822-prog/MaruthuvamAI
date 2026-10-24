from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Maruthuvam.AI – AI Health Copilot"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = "supersecretkey_change_in_production_9876543210abcdef"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "sqlite:///./maruthuvam.db"

    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # External AI Provider
    AI_PROVIDER: str = "mock"  # mock | openai | anthropic | gemini
    AI_API_KEY: str = ""
    AI_MODEL: str = ""

    # OCR Provider
    OCR_PROVIDER: str = "mock"  # mock | vision_api | tesseract

    # Storage
    STORAGE_BACKEND: str = "local"  # local | s3
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 15

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_ORIGIN, "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
        return list(set(origins))


settings = Settings()
