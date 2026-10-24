import os
import uuid
import shutil
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".txt"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
}


class StorageService:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, file: UploadFile) -> Tuple[str, str]:
        """Validate file size and MIME type."""
        ext = Path(file.filename or "").suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File extension '{ext}' not allowed. Permitted: {', '.join(ALLOWED_EXTENSIONS)}",
            )

        content_type = file.content_type or "application/octet-stream"
        if content_type not in ALLOWED_MIME_TYPES and ext != ".txt":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Content-Type '{content_type}' is not accepted.",
            )

        return ext, content_type

    async def save_file(self, file: UploadFile, user_id: str) -> Tuple[str, str, int]:
        """
        Save file using a secure UUID-based storage key.
        Never trusts user-provided filename on disk.
        Returns (storage_key, original_filename, file_size_bytes).
        """
        ext, _ = self.validate_file(file)
        unique_filename = f"{user_id}_{uuid.uuid4().hex}{ext}"
        destination_path = self.upload_dir / unique_filename

        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        file_size = 0

        try:
            with open(destination_path, "wb") as buffer:
                while chunk := await file.read(1024 * 64):
                    file_size += len(chunk)
                    if file_size > max_bytes:
                        # Clean up oversized file
                        destination_path.unlink(missing_ok=True)
                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
                        )
                    buffer.write(chunk)
        except Exception as e:
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}",
            )

        return unique_filename, file.filename or "uploaded_file", file_size

    def get_file_path(self, storage_key: str) -> Path:
        """Resolve full path and prevent path traversal."""
        safe_path = (self.upload_dir / storage_key).resolve()
        if not str(safe_path).startswith(str(self.upload_dir.resolve())):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        if not safe_path.exists():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")
        return safe_path

    def delete_file(self, storage_key: str) -> bool:
        """Delete file from disk."""
        try:
            path = self.get_file_path(storage_key)
            path.unlink(missing_ok=True)
            return True
        except Exception:
            return False


storage_service = StorageService()
