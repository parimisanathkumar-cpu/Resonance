import React, { useState, useEffect } from 'react';
import { Plus, X, ListPlus, Music } from 'lucide-react';

const PlaylistModal = ({ isOpen, onClose, track, onAddToQueue }) => {
  const [playlists, setPlaylists] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/playlists/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPlaylists(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
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
      const newPlaylist = await res.json();
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
      setIsCreating(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          track_id: track.id,
          title: track.title,
          artist: track.artist,
          cover_art: track.coverArt
        })
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen || !track) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>Add to...</h3>
          <X size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={onClose} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
          <img src={track.coverArt} alt="" style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{track.title}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{track.artist}</div>
          </div>
        </div>

        <div 
          onClick={() => { onAddToQueue(track); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ListPlus size={24} color="var(--text-main)" />
          <span style={{ fontSize: '16px', fontWeight: '500' }}>Add to Queue</span>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border-glass)', margin: '16px 0' }} />

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {playlists.map(p => (
            <div 
              key={p.id}
              onClick={() => handleAddToPlaylist(p.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Music size={24} color="var(--text-muted)" />
              <span style={{ fontSize: '16px' }}>{p.name}</span>
            </div>
          ))}
        </div>

        {isCreating ? (
          <form onSubmit={handleCreatePlaylist} style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <input 
              autoFocus
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'var(--text-main)', color: 'black', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
              Create
            </button>
          </form>
        ) : (
          <div 
            onClick={() => setIsCreating(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', cursor: 'pointer', borderRadius: '8px', marginTop: '8px', color: 'var(--text-muted)' }}
          >
            <Plus size={24} />
            <span style={{ fontSize: '16px', fontWeight: '500' }}>New Playlist</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistModal;
