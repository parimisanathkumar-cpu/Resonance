import { Play, Pause, Heart, Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const MainView = ({ currentTrack, isPlaying: globalIsPlaying, onPlayTrack, onOpenPlaylistModal, likedSongs, toggleLike, onNavigate }) => {
  const [greeting, setGreeting] = useState('');
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [curatedPlaylists, setCuratedPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to decode HTML entities
  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      
      // Fetch Trending Music
      const trendingRes = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&videoCategoryId=10&maxResults=8&regionCode=US&key=${apiKey}`);
      const trendingData = await trendingRes.json();
      
      if (trendingData.items) {
        setTrendingTracks(trendingData.items.map(item => ({
          id: item.id,
          type: 'song',
          title: decodeHTML(item.snippet.title),
          artist: decodeHTML(item.snippet.channelTitle),
          artistId: item.snippet.channelId,
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url
        })));
      }

      // Fetch Curated Playlists
      const playlistsRes = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=top+music+hits+2025&type=playlist&key=${apiKey}`);
      const playlistsData = await playlistsRes.json();
      
      if (playlistsData.items) {
        setCuratedPlaylists(playlistsData.items.map(item => ({
          id: item.id.playlistId,
          type: 'album',
          title: decodeHTML(item.snippet.title),
          desc: decodeHTML(item.snippet.channelTitle),
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url
        })));
      }
    } catch (e) {
      console.error("Failed to fetch home data", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      
      {/* Dynamic Header Background Gradient */}
      <div style={{
        padding: '32px',
        paddingBottom: '60px',
        background: 'linear-gradient(to bottom, rgba(30, 40, 60, 0.8) 0%, rgba(18, 18, 22, 1) 100%)',
        minHeight: '100%'
      }}>
        
        {/* Greeting */}
        <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-1px', marginBottom: '24px' }}>
          {greeting}
        </h1>

        <style>{`
          .recent-card:hover .row-actions { opacity: 1 !important; }
        `}</style>

        {/* Trending Tracks */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '48px'
        }}>
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ height: '80px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : trendingTracks.map(track => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isTrackPlaying = isThisTrackActive && globalIsPlaying;

            return (
              <div 
                key={track.id}
                className="recent-card"
                onClick={() => onPlayTrack(track, trendingTracks)}
                style={{
                  display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '4px', cursor: 'pointer', overflow: 'hidden',
                  transition: 'background-color 0.2s', position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.querySelector('.play-btn-circle').style.opacity = '1';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.querySelector('.play-btn-circle').style.opacity = isThisTrackActive ? '1' : '0';
                }}
              >
                <img src={track.coverArt} alt={track.title} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                <h3 style={{ fontSize: '15px', fontWeight: '600', padding: '0 16px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {track.title}
                </h3>
                
                <div className="row-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '64px', transition: 'opacity 0.2s', opacity: 0 }}>
                  <div onClick={(e) => { e.stopPropagation(); toggleLike(track); }} style={{ cursor: 'pointer', padding: '4px' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
                    <Heart size={16} fill={(likedSongs || []).some(t => t.id === track.id) ? '#1ed760' : 'none'} color={(likedSongs || []).some(t => t.id === track.id) ? '#1ed760' : 'var(--text-muted)'} />
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); onOpenPlaylistModal(track); }} style={{ cursor: 'pointer', padding: '4px' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
                    <Plus size={18} color="var(--text-muted)" />
                  </div>
                </div>
                
                {/* Play Button Overlay */}
                <div 
                  className="play-btn-circle"
                  style={{
                    position: 'absolute', right: '16px',
                    width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1ed760',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    opacity: isThisTrackActive ? '1' : '0',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {isTrackPlaying ? (
                     <Pause fill="black" color="black" size={18} />
                  ) : (
                     <Play fill="black" color="black" size={18} style={{ marginLeft: '2px' }}/>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Made For You Section */}
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Top Playlists & Mixes</h2>
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px', marginBottom: '24px' }}>
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ minWidth: '200px', height: '260px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : curatedPlaylists.map(mix => (
            <div 
              key={mix.id}
              className="premium-card"
              onClick={() => onNavigate('album', mix)}
              style={{
                minWidth: '200px', maxWidth: '200px', padding: '16px', borderRadius: '12px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)', transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
            >
              <img src={mix.coverArt} alt={mix.title} style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mix.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mix.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default MainView;
