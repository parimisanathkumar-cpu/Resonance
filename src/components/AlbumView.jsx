import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, ArrowLeft } from 'lucide-react';

const AlbumView = ({ context, currentTrack, isPlaying: globalIsPlaying, onPlayTrack, onBack }) => {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to decode HTML entities
  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    if (!context || !context.id) return;

    const fetchPlaylist = async () => {
      setIsLoading(true);
      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        // Fetch up to 50 tracks from the playlist
        const res = await fetch(`https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${context.id}&key=${apiKey}`);
        const data = await res.json();
        
        if (data.items) {
          const formattedTracks = data.items.map((item, index) => ({
            id: item.snippet.resourceId.videoId,
            title: decodeHTML(item.snippet.title),
            artist: decodeHTML(item.snippet.videoOwnerChannelTitle || context.artist || 'Unknown Artist'),
            coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || context.coverArt,
            position: index + 1
          })).filter(t => t.title !== 'Private video' && t.title !== 'Deleted video');
          
          setTracks(formattedTracks);
        }
      } catch (err) {
        console.error("Failed to load album tracks", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, [context]);

  if (!context) return null;

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '100px', overflowY: 'auto' }}>
      
      {/* Massive Spotify-like Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '24px', 
        padding: '32px', 
        paddingTop: '64px',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(18,18,22,1) 100%)',
        position: 'relative'
      }}>
        {/* Back Button */}
        <div 
          onClick={onBack}
          style={{
            position: 'absolute', top: '16px', left: '32px', 
            width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
        >
          <ArrowLeft size={20} color="white" />
        </div>

        <img 
          src={context.coverArt} 
          alt={context.title} 
          style={{ width: '232px', height: '232px', borderRadius: '4px', boxShadow: '0 16px 32px rgba(0,0,0,0.5)', objectFit: 'cover' }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1 }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Playlist</span>
          <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-2px', margin: 0, lineHeight: '1.1' }}>
            {context.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontWeight: '600' }}>{context.artist}</span>
            <span style={{ color: 'var(--text-muted)' }}>• {tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Play Controls Row */}
      <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center' }}>
        <div 
          className="play-btn-circle"
          style={{
            width: '56px', 
            height: '56px', 
            borderRadius: '50%', 
            backgroundColor: '#1ed760',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onClick={() => { if(tracks.length > 0) onPlayTrack(tracks[0]) }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Play fill="black" color="black" size={28} style={{ marginLeft: '4px' }}/>
        </div>
      </div>

      {/* Tracklist Table */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ display: 'flex', color: 'var(--text-muted)', fontSize: '13px', padding: '0 16px 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
          <div style={{ width: '32px', textAlign: 'center' }}>#</div>
          <div style={{ flex: 1 }}>Title</div>
          <div style={{ width: '48px', display: 'flex', justifyContent: 'flex-end' }}>
            <Clock size={16} />
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading tracks...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tracks.map((track) => {
              const isThisTrackActive = currentTrack?.id === track.id;
              const isTrackPlaying = isThisTrackActive && globalIsPlaying;

              return (
                <div 
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer',
                    transition: 'background-color 0.2s ease', backgroundColor: 'transparent'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ width: '32px', textAlign: 'center', color: isThisTrackActive ? '#1ed760' : 'var(--text-muted)', fontSize: '14px' }}>
                    {isTrackPlaying ? (
                      <Pause size={16} color="#1ed760" fill="#1ed760" />
                    ) : (
                      track.position
                    )}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={track.coverArt} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt={track.title} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', color: isThisTrackActive ? '#1ed760' : 'var(--text-main)', fontWeight: isThisTrackActive ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{track.artist}</span>
                    </div>
                  </div>

                  <div style={{ width: '48px', textAlign: 'right', fontSize: '14px', color: 'var(--text-muted)' }}>
                    --:--
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumView;
