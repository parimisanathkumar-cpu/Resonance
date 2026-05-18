from pydantic import BaseModel
from typing import List, Optional
import datetime

class TrackBase(BaseModel):
    track_id: str
    title: str
    artist: str
    cover_art: str

class TrackCreate(TrackBase):
    pass

class TrackResponse(TrackBase):
    id: int
    added_at: datetime.datetime

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    email: str

class PlaylistCreate(BaseModel):
    name: str

class PlaylistResponse(BaseModel):
    id: int
    name: str
    created_at: datetime.datetime
    tracks: List[TrackResponse] = []

    class Config:
        orm_mode = True

class UserCreate(UserBase):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_admin: bool = False
    liked_songs: List[TrackResponse] = []
    playlists: List[PlaylistResponse] = []

    class Config:
        orm_mode = True
