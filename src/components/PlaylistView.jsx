import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, ArrowLeft, Heart, Plus } from 'lucide-react';

const PlaylistView = ({ context, currentTrack, isPlaying, onPlayTrack, onAddToQueue, likedSongs, toggleLike, onBack }) => {
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchPlaylist();
  }, [context.id]);

  const fetchPlaylist = async () => {
    try {
      // For now we fetch all playlists and find the one we need.
      // In a real app we'd have a GET /playlists/:id endpoint.
      const res = await fetch(`${API_BASE_URL}/playlists/`);
      const data = await res.json();
      const found = data.find(p => p.id === parseInt(context.id));
      if (found) setPlaylist(found);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const isLiked = (t) => likedSongs.some(l => l.id === t.track_id);

  if (isLoading) return <div style={{ padding: '32px' }}>Loading...</div>;
  if (!playlist) return <div style={{ padding: '32px' }}>Playlist not found</div>;

  return (
    <div className="animate-enter" style={{ paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '32px',
        padding: '32px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(18,18,22,1) 100%)'
      }}>
        <div style={{
          width: '232px',
          height: '232px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {playlist.tracks && playlist.tracks.length > 0 && (
            <img src={playlist.tracks[0].cover_art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Playlist</span>
          <h1 style={{ fontSize: '72px', fontWeight: '800', margin: 0, letterSpacing: '-2px', lineHeight: 1 }}>{playlist.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>You</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div 
          onClick={() => playlist.tracks.length > 0 && onPlayTrack({ id: playlist.tracks[0].track_id, type: 'song', title: playlist.tracks[0].title, artist: playlist.tracks[0].artist, coverArt: playlist.tracks[0].cover_art }, playlist.tracks.map(t => ({ id: t.track_id, type: 'song', title: t.title, artist: t.artist, coverArt: t.cover_art })))}
          style={{
            width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1ed760',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            opacity: playlist.tracks.length === 0 ? 0.5 : 1
          }}>
          <Play fill="black" color="black" size={28} style={{ marginLeft: '4px' }} />
        </div>
      </div>

      {/* Track List */}
      <div style={{ padding: '0 32px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '40px 1fr 40px 40px', padding: '0 16px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px'
        }}>
          <div>#</div>
          <div>Title</div>
          <div></div>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Clock size={16} /></div>
        </div>

        {playlist.tracks.map((track, index) => {
          const formattedTrack = { id: track.track_id, type: 'song', title: track.title, artist: track.artist, coverArt: track.cover_art };
          const isThisTrackActive = currentTrack?.id === track.track_id;
          const isTrackPlaying = isThisTrackActive && isPlaying;

          return (
            <div 
              key={track.id}
              className="list-row"
              style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 40px 40px', alignItems: 'center',
                padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', gap: '16px'
              }}
              onDoubleClick={() => onPlayTrack(formattedTrack, playlist.tracks.map(t => ({ id: t.track_id, type: 'song', title: t.title, artist: t.artist, coverArt: t.cover_art })))}
            >
              <div style={{ color: isThisTrackActive ? '#1ed760' : 'var(--text-muted)' }}>
                {isTrackPlaying ? <div style={{ width: '14px', height: '14px', position: 'relative' }}><div className="eq-bar eq-bar-1"></div><div className="eq-bar eq-bar-2"></div><div className="eq-bar eq-bar-3"></div></div> : index + 1}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                <img src={track.cover_art} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: isThisTrackActive ? '#1ed760' : 'var(--text-main)', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{track.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{track.artist}</div>
                </div>
              </div>

              <div onClick={(e) => { e.stopPropagation(); toggleLike(formattedTrack); }}>
                <Heart size={18} fill={isLiked(formattedTrack) ? '#1ed760' : 'none'} color={isLiked(formattedTrack) ? '#1ed760' : 'var(--text-muted)'} style={{ cursor: 'pointer' }} />
              </div>
              
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>--:--</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlaylistView;
