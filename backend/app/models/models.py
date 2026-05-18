from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    liked_songs = relationship("LikedSong", back_populates="user")
    playlists = relationship("Playlist", back_populates="user")

class Playlist(Base):
    __tablename__ = "playlists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="playlists")
    tracks = relationship("PlaylistTrack", back_populates="playlist", cascade="all, delete-orphan")

class PlaylistTrack(Base):
    __tablename__ = "playlist_tracks"
    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id"))
    
    track_id = Column(String(255), index=True)
    title = Column(String(255))
    artist = Column(String(255))
    cover_art = Column(String(1024))
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    playlist = relationship("Playlist", back_populates="tracks")

class LikedSong(Base):
    __tablename__ = "liked_songs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # We store track metadata directly for now so we don't have to query YouTube again
    track_id = Column(String(255), index=True)
    title = Column(String(255))
    artist = Column(String(255))
    cover_art = Column(String(1024))
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="liked_songs")
