import { Play, Pause, Search, Bell } from 'lucide-react';

const TRACKS = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    coverArt: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  },
  {
    id: 'L_jWHffIx5E',
    title: 'All Star',
    artist: 'Smash Mouth',
    coverArt: 'https://i.ytimg.com/vi/L_jWHffIx5E/maxresdefault.jpg'
  },
  {
    id: 'fJ9rUzIMcZQ',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    coverArt: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Despacito',
    artist: 'Luis Fonsi',
    coverArt: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg'
  }
];

const MainView = ({ currentTrack, isPlaying: globalIsPlaying, onPlayTrack }) => {
  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header & Search Integration */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '24px 32px',
        borderBottom: '1px solid var(--border-glass)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(18, 18, 22, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 10
      }}>
        {/* Sleek Search Bar */}
        <div style={{ position: 'relative', width: '380px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search artists, songs, or podcasts..."
            className="search-input"
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              color: 'var(--text-main)',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border-active)' }}
            onBlur={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
          />
        </div>

        <div style={{ padding: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Bell size={20} strokeWidth={1.5} />
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ padding: '32px', paddingBottom: '60px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', letterSpacing: '-0.5px', marginBottom: '32px' }}>Trending Tracks</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {TRACKS.map(track => {
            const isThisTrackActive = currentTrack?.id === track.id;
            const isTrackPlaying = isThisTrackActive && globalIsPlaying;

            return (
              <div 
                key={track.id} 
                className="premium-card"
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  backgroundColor: 'transparent'
                }}
                onClick={() => onPlayTrack(track)}
                  onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.play-btn-circle').style.opacity = '1';
                  e.currentTarget.querySelector('.play-btn-circle').style.transform = 'translateY(0)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.play-btn-circle').style.opacity = isThisTrackActive ? '1' : '0';
                  e.currentTarget.querySelector('.play-btn-circle').style.transform = isThisTrackActive ? 'translateY(0)' : 'translateY(8px)';
                }}
              >
                <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                  <img 
                    src={track.coverArt} 
                    alt={track.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Play Button Overlay */}
                  <div 
                    className="play-btn-circle"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      bottom: '12px',
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      opacity: isThisTrackActive ? '1' : '0',
                      transform: isThisTrackActive ? 'translateY(0)' : 'translateY(8px)',
                      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                  >
                    {isTrackPlaying ? (
                       <Pause fill="black" color="black" size={18} />
                    ) : (
                       <Play fill="black" color="black" size={18} style={{ marginLeft: '2px' }}/>
                    )}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {track.artist}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainView;
