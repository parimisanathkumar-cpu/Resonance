import React, { useEffect, useRef, useState } from 'react';
import { Play, ListPlus, Music, ChevronRight, Plus } from 'lucide-react';

const TrackContextMenu = ({ x, y, track, playlists, onClose, onAddToQueue, onPlayNext, onAddToPlaylist, onCreatePlaylist }) => {
  const menuRef = useRef(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    // small delay so the initial click to open doesn't close it immediately
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  // Prevent menu from going off-screen
  const [position, setPosition] = useState({ top: y, left: x });
  
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const ww = window.innerWidth;
      const wh = window.innerHeight;
      
      let newLeft = x;
      let newTop = y;

      if (x + rect.width > ww) {
        newLeft = ww - rect.width - 10;
      }
      if (y + rect.height > wh) {
        newTop = wh - rect.height - 10;
      }
      
      setPosition({ top: newTop, left: newLeft });
    }
  }, [x, y, showPlaylists, isCreating]);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName);
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const menuItemStyle = {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
    cursor: 'pointer', transition: 'background 0.2s', fontSize: '14px', color: 'var(--text-main)',
    justifyContent: 'space-between'
  };

  return (
    <div 
      ref={menuRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        backgroundColor: '#282828',
        borderRadius: '8px',
        boxShadow: '0 16px 24px rgba(0,0,0,0.5), 0 0 8px rgba(0,0,0,0.2)',
        width: '220px',
        zIndex: 9999,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        .menu-item:hover { background-color: rgba(255,255,255,0.1); }
      `}</style>
      
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <img src={track.coverArt} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{track.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{track.artist}</div>
        </div>
      </div>

      {!showPlaylists ? (
        <div style={{ padding: '4px 0' }}>
          <div className="menu-item" style={menuItemStyle} onClick={() => { onAddToQueue(track); onClose(); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ListPlus size={18} /> Add to queue
            </div>
          </div>

          <div className="menu-item" style={menuItemStyle} onClick={() => { onPlayNext(track); onClose(); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Play size={18} /> Play next
            </div>
          </div>
          
          <div className="menu-item" style={menuItemStyle} onClick={() => setShowPlaylists(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Plus size={18} /> Add to playlist
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      ) : (
        <div style={{ padding: '4px 0', maxHeight: '300px', overflowY: 'auto' }}>
          <div className="menu-item" style={{...menuItemStyle, color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)'}} onClick={() => setShowPlaylists(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
            </div>
          </div>

          {playlists.map(p => (
            <div key={p.id} className="menu-item" style={menuItemStyle} onClick={() => { onAddToPlaylist(p.id, track); onClose(); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Music size={16} color="var(--text-muted)" />
                <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '140px' }}>{p.name}</span>
              </div>
            </div>
          ))}

          {isCreating ? (
            <form onSubmit={handleCreateSubmit} style={{ padding: '8px 12px' }}>
              <input 
                autoFocus
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '13px' }}
              />
            </form>
          ) : (
            <div className="menu-item" style={{...menuItemStyle, color: '#1ed760'}} onClick={() => setIsCreating(true)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Plus size={16} /> New Playlist
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackContextMenu;
