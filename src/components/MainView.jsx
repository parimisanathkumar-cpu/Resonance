import { Play, Pause, Heart, Plus, MoreVertical } from 'lucide-react';
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ height: '240px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
            ))
          ) : trendingTracks.map(track => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isTrackPlaying = isThisTrackActive && globalIsPlaying;

            return (
              <div 
                key={track.id}
                className="premium-card"
                onClick={() => onPlayTrack(track, trendingTracks)}
                style={{
                  padding: '16px', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)', transition: 'background-color 0.2s', position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.querySelector('.play-btn-circle').style.opacity = '1';
                  e.currentTarget.querySelector('.play-btn-circle').style.transform = 'translateY(0)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                  if (!isThisTrackActive) {
                    e.currentTarget.querySelector('.play-btn-circle').style.opacity = '0';
                    e.currentTarget.querySelector('.play-btn-circle').style.transform = 'translateY(8px)';
                  }
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                  <img src={track.coverArt} alt={track.title} style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
                  
                  {/* Play Button Overlay */}
                  <div 
                    className="play-btn-circle"
                    style={{
                      position: 'absolute', right: '8px', bottom: '8px',
                      width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1ed760',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                      opacity: isThisTrackActive ? '1' : '0',
                      transition: 'all 0.3s cubic-bezier(0.3, 0, 0, 1)',
                      transform: isThisTrackActive ? 'translateY(0)' : 'translateY(8px)'
                    }}
                  >
                    {isTrackPlaying ? (
                       <Pause fill="black" color="black" size={24} />
                    ) : (
                       <Play fill="black" color="black" size={24} style={{ marginLeft: '4px' }}/>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {track.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {track.artist}
                  </p>
                </div>

                <div className="row-actions" style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px', opacity: 0, transition: 'opacity 0.2s', zIndex: 10 }}>
                   <div onClick={(e) => { e.stopPropagation(); toggleLike(track); }} style={{ cursor: 'pointer', padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(0,0,0,0.8)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='rgba(0,0,0,0.5)'}>
                     <Heart size={16} fill={(likedSongs || []).some(t => t.id === track.id) ? '#1ed760' : 'none'} color={(likedSongs || []).some(t => t.id === track.id) ? '#1ed760' : 'white'} />
                   </div>
                   <div onClick={(e) => { e.stopPropagation(); onOpenPlaylistModal(e, track); }} style={{ cursor: 'pointer', padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(0,0,0,0.8)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='rgba(0,0,0,0.5)'}>
                     <MoreVertical size={16} color="white" />
                   </div>
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
