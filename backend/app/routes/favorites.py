from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import LikedSong, User
from app.schemas.schemas import TrackCreate, TrackResponse
from typing import List

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

# For now, we hardcode user_id=1 to simulate a logged in user until authentication is built
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(username="testuser", email="test@example.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/", response_model=List[TrackResponse])
def get_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return current_user.liked_songs

@router.post("/")
def toggle_favorite(track: TrackCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_favorite = db.query(LikedSong).filter(
        LikedSong.user_id == current_user.id, 
        LikedSong.track_id == track.track_id
    ).first()
    
    if existing_favorite:
        # If it exists, remove it (unlike)
        db.delete(existing_favorite)
        db.commit()
        return {"status": "removed", "track_id": track.track_id}
    else:
        # If it doesn't exist, add it (like)
        new_favorite = LikedSong(
            user_id=current_user.id,
            track_id=track.track_id,
            title=track.title,
            artist=track.artist,
            cover_art=track.cover_art
        )
        db.add(new_favorite)
        db.commit()
        return {"status": "added", "track_id": track.track_id}
