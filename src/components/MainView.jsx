import { Play, Pause } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// MOCK DATA FOR DISCOVER DASHBOARD
const RECENT_PLAYS = [
  { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio', coverArt: 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg' },
  { id: 'K4DyBUG242c', title: 'On & On (feat. Daniel Levi)', coverArt: 'https://i.ytimg.com/vi/K4DyBUG242c/maxresdefault.jpg' },
  { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', coverArt: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
  { id: '4xDzrUhVKVA', title: 'Synthwave Radio', coverArt: 'https://i.ytimg.com/vi/4xDzrUhVKVA/maxresdefault.jpg' },
  { id: '2Vv-BfVoq4g', title: 'Ed Sheeran - Perfect', coverArt: 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg' },
  { id: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', coverArt: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' }
];

const MADE_FOR_YOU = [
  { id: 'mix1', title: 'Daily Mix 1', desc: 'Ed Sheeran, Coldplay, and more', coverArt: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f468?auto=format&fit=crop&w=400&q=80' },
  { id: 'mix2', title: 'Discover Weekly', desc: 'New music updated every Monday', coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80' },
  { id: 'mix3', title: 'Release Radar', desc: 'Catch up on the latest releases', coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80' },
  { id: 'mix4', title: 'Chill Vibes', desc: 'Kick back and relax', coverArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80' },
  { id: 'mix5', title: 'Focus Flow', desc: 'Deep focus instrumental beats', coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80' }
];

const MainView = ({ currentTrack, isPlaying: globalIsPlaying, onPlayTrack }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

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

        {/* Top 6 Recent Plays (Blocky layout) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '48px'
        }}>
          {RECENT_PLAYS.map(track => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isTrackPlaying = isThisTrackActive && globalIsPlaying;

            return (
              <div 
                key={track.id}
                onClick={() => onPlayTrack(track)}
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
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Made For You</h2>
        <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px', marginBottom: '24px' }}>
          {MADE_FOR_YOU.map(mix => (
            <div 
              key={mix.id}
              className="premium-card"
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
