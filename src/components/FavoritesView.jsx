import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';

const FavoritesView = ({ likedSongs, currentTrack, isPlaying, onPlayTrack, toggleLike }) => {
  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px', paddingBottom: '100px', overflowY: 'auto' }}>
      
      {/* Massive Spotify-like Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '24px', 
        padding: '32px', 
        paddingTop: '64px',
        background: 'linear-gradient(to bottom, rgba(80, 50, 180, 0.4) 0%, rgba(18,18,22,1) 100%)',
        position: 'relative'
      }}>
        <div style={{ width: '232px', height: '232px', borderRadius: '4px', background: 'linear-gradient(135deg, #450af5, #c4efd9)', boxShadow: '0 16px 32px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={80} fill="white" color="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1 }}>
          <span style={{ fontSize: '14px', fontWeight: '600' }}>Playlist</span>
          <h1 style={{ fontSize: '72px', fontWeight: '900', letterSpacing: '-2px', margin: 0, lineHeight: '1.1' }}>
            Liked Songs
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontWeight: '600' }}>You</span>
            <span style={{ color: 'var(--text-muted)' }}>• {likedSongs.length} songs</span>
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
            opacity: likedSongs.length > 0 ? 1 : 0.5
          }}
          onClick={() => { if(likedSongs.length > 0) onPlayTrack(likedSongs[0], likedSongs) }}
          onMouseOver={(e) => likedSongs.length > 0 && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => likedSongs.length > 0 && (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Play fill="black" color="black" size={28} style={{ marginLeft: '4px' }}/>
        </div>
      </div>

      {/* Tracklist Table */}
      <div style={{ padding: '0 32px' }}>
        {likedSongs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>You haven't liked any songs yet. Start saving your favorites!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {likedSongs.map((track, index) => {
              const isThisTrackActive = currentTrack?.id === track.id;
              const isTrackPlaying = isThisTrackActive && isPlaying;

              return (
                <div 
                  key={track.id}
                  onClick={() => onPlayTrack(track, likedSongs)}
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
                      index + 1
                    )}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={track.coverArt} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt={track.title} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '15px', color: isThisTrackActive ? '#1ed760' : 'var(--text-main)', fontWeight: isThisTrackActive ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{track.artist}</span>
                    </div>
                  </div>

                  {/* Heart Button */}
                  <div 
                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                    style={{ marginRight: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Heart size={20} fill="#1ed760" color="#1ed760" />
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

export default FavoritesView;
