from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.auth import verify_google_token, create_jwt, get_current_user
from backend.app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class GoogleLoginRequest(BaseModel):
    token: str


class AuthResponse(BaseModel):
    access_token: str
    user: dict


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    picture: str | None


@router.post("/google", response_model=AuthResponse)
def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    idinfo = verify_google_token(body.token)

    google_id = idinfo["sub"]
    email = idinfo["email"]
    name = idinfo.get("name", email)
    picture = idinfo.get("picture")

    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = User(google_id=google_id, email=email, name=name, picture=picture)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.name = name
        user.picture = picture
        db.commit()
        db.refresh(user)

    token = create_jwt(user.id, user.email)
    return {
        "access_token": token,
        "user": {"id": user.id, "email": user.email, "name": user.name, "picture": user.picture},
    }


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "name": user.name, "picture": user.picture}
