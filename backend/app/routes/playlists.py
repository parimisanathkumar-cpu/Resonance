from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Playlist, PlaylistTrack, User
from app.schemas.schemas import PlaylistCreate, PlaylistResponse, TrackCreate
from typing import List

router = APIRouter(prefix="/api/playlists", tags=["playlists"])

# Mock authentication
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(username="testuser", email="test@example.com")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("/", response_model=List[PlaylistResponse])
def get_playlists(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return current_user.playlists

@router.post("/", response_model=PlaylistResponse)
def create_playlist(playlist: PlaylistCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_playlist = Playlist(name=playlist.name, user_id=current_user.id)
    db.add(new_playlist)
    db.commit()
    db.refresh(new_playlist)
    return new_playlist

@router.post("/{playlist_id}/tracks")
def add_track_to_playlist(playlist_id: int, track: TrackCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify playlist exists and belongs to user
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.user_id == current_user.id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
        
    # Check if track already in playlist
    existing = db.query(PlaylistTrack).filter(PlaylistTrack.playlist_id == playlist_id, PlaylistTrack.track_id == track.track_id).first()
    if existing:
        return {"status": "exists", "track_id": track.track_id}
        
    new_track = PlaylistTrack(
        playlist_id=playlist_id,
        track_id=track.track_id,
        title=track.title,
        artist=track.artist,
        cover_art=track.cover_art
    )
    db.add(new_track)
    db.commit()
    return {"status": "added", "track_id": track.track_id}
