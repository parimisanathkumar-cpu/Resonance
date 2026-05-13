import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, ArrowLeft, Heart, Plus } from 'lucide-react';

const PlaylistView = ({ context, playlists = [], currentTrack, isPlaying, onPlayTrack, onAddToQueue, likedSongs, toggleLike, onBack }) => {
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!context?.id) return;
    
    // First try to find it in the provided playlists prop (fastest)
    const found = playlists.find(p => p.id === parseInt(context.id));
    if (found) {
      setPlaylist(found);
      setIsLoading(false);
    } else {
      // Fallback fetch if not found
      fetchPlaylist();
    }
  }, [context?.id, playlists]);

  const fetchPlaylist = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/playlists/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
      {/* Dynamic Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '32px',
        padding: '32px',
        minHeight: '340px',
        background: 'linear-gradient(180deg, rgba(83, 83, 83, 0.8) 0%, rgba(18,18,22,1) 100%)',
        position: 'relative'
      }}>
        <div 
          onClick={onBack}
          style={{ position: 'absolute', top: '32px', left: '32px', cursor: 'pointer', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '50%' }}
        >
          <ArrowLeft size={24} color="#fff" />
        </div>

        <div style={{
          width: '232px',
          height: '232px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {playlist.tracks && playlist.tracks.length > 0 ? (
            <img src={playlist.tracks[0].cover_art} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Music size={64} color="var(--text-muted)" opacity={0.3} />
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Playlist</span>
          <h1 style={{ fontSize: 'clamp(48px, 6vw, 96px)', fontWeight: '900', margin: '0', letterSpacing: '-2px', lineHeight: 1.1, paddingBottom: '8px' }}>
            {playlist.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>Your Library</span>
            <span>•</span>
            <span>{playlist.tracks?.length || 0} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ 
        padding: '24px 32px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '32px',
        background: 'linear-gradient(180deg, rgba(18,18,22,1) 0%, rgba(18,18,22,0.5) 100%)',
        position: 'sticky',
        top: '80px',
        zIndex: 10
      }}>
        <div 
          onClick={() => playlist.tracks?.length > 0 && onPlayTrack({ id: playlist.tracks[0].track_id, type: 'song', title: playlist.tracks[0].title, artist: playlist.tracks[0].artist, coverArt: playlist.tracks[0].cover_art }, playlist.tracks.map(t => ({ id: t.track_id, type: 'song', title: t.title, artist: t.artist, coverArt: t.cover_art })))}
          style={{
            width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1ed760',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            opacity: playlist.tracks?.length === 0 ? 0.5 : 1,
            transform: 'scale(1)',
            transition: 'all 0.2s ease',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
          }}
          onMouseOver={(e) => playlist.tracks?.length > 0 && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => playlist.tracks?.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Play fill="black" color="black" size={28} style={{ marginLeft: '4px' }} />
        </div>
      </div>

      <style>{`
        .track-row:hover { background-color: rgba(255,255,255,0.1); }
        .track-row:hover .track-index { display: none; }
        .track-row:hover .track-play { display: block !important; }
      `}</style>

      {/* Track List */}
      <div style={{ padding: '0 32px' }}>
        {playlist.tracks?.length > 0 ? (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 40px 40px', padding: '0 16px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>#</div>
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
                  key={track.id || track.track_id + index}
                  className="track-row"
                  style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 40px 40px', alignItems: 'center',
                    padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s', gap: '16px'
                  }}
                  onDoubleClick={() => onPlayTrack(formattedTrack, playlist.tracks.map(t => ({ id: t.track_id, type: 'song', title: t.title, artist: t.artist, coverArt: t.cover_art })))}
                >
                  <div style={{ color: isThisTrackActive ? '#1ed760' : 'var(--text-muted)', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <div className="track-index">
                      {isTrackPlaying ? (
                        <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f5eb96f2.gif" alt="playing" style={{ width: '14px', height: '14px' }} />
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{index + 1}</span>
                      )}
                    </div>
                    <div className="track-play" style={{ display: 'none', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} onClick={(e) => { e.stopPropagation(); onPlayTrack(formattedTrack, playlist.tracks.map(t => ({ id: t.track_id, type: 'song', title: t.title, artist: t.artist, coverArt: t.cover_art }))); }}>
                      {isTrackPlaying ? <Pause fill="#fff" color="#fff" size={16} /> : <Play fill="#fff" color="#fff" size={16} />}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflow: 'hidden' }}>
                    <img src={track.cover_art} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                    <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: isThisTrackActive ? '#1ed760' : 'var(--text-main)', fontSize: '15px', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{track.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{track.artist}</div>
                    </div>
                  </div>

                  <div onClick={(e) => { e.stopPropagation(); toggleLike(formattedTrack); }} style={{ display: 'flex', justifyContent: 'center' }}>
                    <Heart size={18} fill={isLiked(formattedTrack) ? '#1ed760' : 'none'} color={isLiked(formattedTrack) ? '#1ed760' : 'var(--text-muted)'} style={{ cursor: 'pointer' }} />
                  </div>
                  
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>--:--</div>
                </div>
              );
            })}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Let's find something for your playlist</h2>
            <p style={{ color: 'var(--text-muted)' }}>Use the search bar to find songs and add them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistView;
