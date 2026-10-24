from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User, UserProfile
from app.schemas.user import UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile and preferences of the authenticated user."""
    return current_user


@router.patch("/me", response_model=UserOut)
def update_my_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update profile attributes such as language, ABHA, height, weight, and goals."""
    if payload.preferred_language is not None:
        current_user.preferred_language = payload.preferred_language
    if payload.abha_number is not None:
        current_user.abha_number = payload.abha_number
    if payload.abha_address is not None:
        current_user.abha_address = payload.abha_address

    if payload.profile and current_user.profile:
        p = current_user.profile
        update_data = payload.profile.model_dump(exclude_unset=True)
        for field, val in update_data.items():
            setattr(p, field, val)
    elif payload.profile and not current_user.profile:
        new_p = UserProfile(
            user_id=current_user.id,
            **payload.profile.model_dump(exclude_unset=True),
        )
        db.add(new_p)

    db.commit()
    db.refresh(current_user)
    return current_user
