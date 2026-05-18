import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, ArrowLeft, Heart, Plus, MoreVertical } from 'lucide-react';

const ArtistView = ({ context, currentTrack, isPlaying: globalIsPlaying, onPlayTrack, onBack, onOpenPlaylistModal, likedSongs, toggleLike, onNavigate }) => {
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Helper to decode HTML entities
  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    if (!context || !context.id) return;
    
    // Reset state on new artist
    setTracks([]);
    setAlbums([]);
    setNextPageToken(null);
    fetchTopTracks(null);
    fetchAlbums();
  }, [context]);

  const fetchTopTracks = async (pageToken = null) => {
    if (pageToken) setIsLoadingMore(true);
    else setIsLoadingTracks(true);

    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : '';
      const res = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&channelId=${context.id}&type=video&videoCategoryId=10&order=viewCount&key=${apiKey}${pageTokenParam}`);
      const data = await res.json();
      
      if (data.items) {
        const formattedTracks = data.items.map((item, index) => ({
          id: item.id.videoId,
          type: 'song',
          title: decodeHTML(item.snippet.title),
          artist: decodeHTML(item.snippet.channelTitle),
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
          // If appending, position needs to account for existing tracks length
          position: (pageToken ? tracks.length : 0) + index + 1
        }));
        
        if (pageToken) {
          setTracks(prev => [...prev, ...formattedTracks]);
        } else {
          setTracks(formattedTracks);
        }
        
        setNextPageToken(data.nextPageToken || null);
      }
    } catch (err) {
      console.error("Failed to load artist tracks", err);
    } finally {
      setIsLoadingTracks(false);
      setIsLoadingMore(false);
    }
  };

  const fetchAlbums = async () => {
    setIsLoadingAlbums(true);
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const res = await fetch(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=20&channelId=${context.id}&key=${apiKey}`);
      const data = await res.json();
      
      if (data.items) {
        setAlbums(data.items.map(item => ({
          id: item.id,
          type: 'album',
          title: decodeHTML(item.snippet.title),
          artist: decodeHTML(item.snippet.channelTitle),
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url
        })));
      }
    } catch (err) {
      console.error("Failed to load artist albums", err);
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  if (!context) return null;

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '100px', overflowY: 'auto' }}>
      
      {/* Massive Spotify-like Artist Banner */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '32px', 
        padding: '48px 32px 32px 32px', 
        paddingTop: '64px',
        background: `linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(18,18,22,1) 100%)`,
        position: 'relative',
        minHeight: '280px'
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
          style={{ width: '232px', height: '232px', borderRadius: '50%', boxShadow: '0 16px 32px rgba(0,0,0,0.5)', objectFit: 'cover' }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1 }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Verified Artist</span>
          <h1 style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-2px', margin: 0, lineHeight: '1.1' }}>
            {context.title}
          </h1>
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
          onClick={() => { if(tracks.length > 0) onPlayTrack(tracks[0], tracks) }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Play fill="black" color="black" size={28} style={{ marginLeft: '4px' }}/>
        </div>
      </div>

      {/* Popular Tracks Table */}
      <div style={{ padding: '0 32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Popular</h2>
        
        {isLoadingTracks ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>Loading popular tracks...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tracks.map((track) => {
              const isThisTrackActive = currentTrack?.id === track.id;
              const isTrackPlaying = isThisTrackActive && globalIsPlaying;

              return (
                <div 
                  key={track.id + track.position}
                  onClick={() => onPlayTrack(track, tracks)}
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
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '15px', color: isThisTrackActive ? '#1ed760' : 'var(--text-main)', fontWeight: isThisTrackActive ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                    </div>
                  </div>

                  <div className="row-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div onClick={(e) => { e.stopPropagation(); toggleLike(track); }} style={{ cursor: 'pointer', padding: '4px', opacity: 0.7 }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7}>
                      <Heart size={16} fill={(likedSongs || []).some(t => t.id === track.id) ? '#1ed760' : 'none'} color={(likedSongs || []).some(t => t.id === track.id) ? '#1ed760' : 'var(--text-muted)'} />
                    </div>
                    <div onClick={(e) => { e.stopPropagation(); onOpenPlaylistModal(e, track); }} style={{ cursor: 'pointer', padding: '4px', opacity: 0.7 }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7}>
                      <MoreVertical size={18} color="var(--text-muted)" />
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>--:--</span>
                  </div>
                </div>
              );
            })}
            
            {nextPageToken && (
              <div 
                onClick={() => !isLoadingMore && fetchTopTracks(nextPageToken)}
                style={{
                  marginTop: '16px', padding: '12px 24px', borderRadius: '24px',
                  border: '1px solid var(--border-glass)', width: 'fit-content',
                  color: 'var(--text-main)', fontSize: '14px', fontWeight: '600',
                  cursor: 'pointer', transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {isLoadingMore ? 'Loading...' : 'Show More'}
              </div>
            )}
          </div>
        )}

        {/* Albums & Playlists Section */}
        {albums.length > 0 && (
          <div style={{ marginTop: '48px', paddingBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Albums & Playlists</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
              {albums.map(album => (
                <div 
                  key={album.id}
                  className="premium-card"
                  onClick={() => onNavigate('album', album)}
                  style={{
                    padding: '16px', borderRadius: '12px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)', transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
                >
                  <img src={album.coverArt} alt={album.title} style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Playlist</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistView;
