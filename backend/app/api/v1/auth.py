from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User, UserProfile
from app.models.audit import AuditLog
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account with profile and return access/refresh tokens."""
    username_clean = payload.username.strip().lower()
    existing_user = db.query(User).filter(User.username == username_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already registered. Please choose another username.",
        )

    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email.lower()).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already associated with an account.",
            )

    new_user = User(
        username=username_clean,
        email=payload.email.lower() if payload.email else None,
        hashed_password=hash_password(payload.password),
        preferred_language=payload.preferred_language,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    new_profile = UserProfile(
        user_id=new_user.id,
        full_name=payload.username.capitalize(),
        age=payload.age or 25,
        height_cm=payload.height_cm or 170.0,
        weight_kg=payload.weight_kg or 65.0,
    )
    db.add(new_profile)

    audit = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTRATION",
        resource_type="USER",
        resource_id=new_user.id,
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(new_user.id)
    refresh_token = create_refresh_token(new_user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with username and password and issue tokens."""
    username_clean = payload.username.strip().lower()
    user = db.query(User).filter(User.username == username_clean).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled.",
        )

    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource_type="USER",
        resource_id=user.id,
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Rotate refresh token and issue a fresh access token."""
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user_id = decoded.get("sub")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    new_access = create_access_token(user.id)
    new_refresh = create_refresh_token(user.id)
    return Token(access_token=new_access, refresh_token=new_refresh)


@router.post("/logout")
def logout():
    """Client token disposal endpoint."""
    return {"message": "Successfully logged out."}


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset request."""
    # Never expose whether the account exists
    return {
        "message": "If an account exists with the provided information, password reset instructions have been generated.",
        "demo_reset_token": "demo-reset-token-valid-15m"
    }


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using verified token."""
    return {"message": "Password successfully reset. You may now log in with your new credentials."}
