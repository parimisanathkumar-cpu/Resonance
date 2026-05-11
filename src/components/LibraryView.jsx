import React, { useState, useEffect } from 'react';
import { Music, Play, Plus } from 'lucide-react';

const LibraryView = ({ onPlayTrack, onNavigate }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/playlists/`);
      const data = await res.json();
      setPlaylists(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-enter" style={{ padding: '32px', paddingBottom: '120px', minHeight: '100%' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Your Library</h1>
      
      {isLoading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading playlists...</div>
      ) : playlists.length === 0 ? (
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          justifyContent: 'center', padding: '64px 0', color: 'var(--text-muted)' 
        }}>
          <Music size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h2>No playlists yet</h2>
          <p>Click the + icon on any track to create your first playlist.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
          {playlists.map(playlist => (
            <div 
              key={playlist.id}
              onClick={() => onNavigate('playlist', { id: playlist.id, title: playlist.name })}
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                padding: '16px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
            >
              <div style={{ 
                aspectRatio: '1', backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
              }}>
                {playlist.tracks && playlist.tracks.length > 0 ? (
                  <img src={playlist.tracks[0].cover_art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                  <Music size={48} color="var(--text-muted)" />
                )}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{playlist.name}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {playlist.tracks ? playlist.tracks.length : 0} tracks
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryView;
