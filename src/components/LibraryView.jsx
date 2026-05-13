import React, { useState, useEffect } from 'react';
import { Music, Play, Plus } from 'lucide-react';

const LibraryView = ({ playlists = [], refreshPlaylists, onPlayTrack, onNavigate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = 'http://localhost:8000/api';

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/playlists/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newPlaylistName })
      });
      if (res.ok) {
        setNewPlaylistName('');
        setIsCreating(false);
        if (refreshPlaylists) refreshPlaylists();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-enter" style={{ padding: '32px', paddingBottom: '120px', minHeight: '100%' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Your Library</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
        
        {/* Create Playlist Card */}
        <div 
          style={{
            backgroundColor: isCreating ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
            padding: '16px',
            borderRadius: '8px',
            cursor: isCreating ? 'default' : 'pointer',
            border: '1px dashed rgba(255,255,255,0.2)',
            transition: 'background 0.2s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            minHeight: '260px'
          }}
          onClick={() => !isCreating && setIsCreating(true)}
          onMouseOver={(e) => !isCreating && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
          onMouseOut={(e) => !isCreating && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
        >
          {isCreating ? (
            <form onSubmit={handleCreate} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Playlist Name" 
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" disabled={isSubmitting || !newPlaylistName.trim()} style={{ flex: 1, padding: '8px', backgroundColor: '#1ed760', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Create
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsCreating(false); }} style={{ flex: 1, padding: '8px', backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Create Playlist</h3>
            </>
          )}
        </div>

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
    </div>
  );
};

export default LibraryView;
