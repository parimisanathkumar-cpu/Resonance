import { useState, useRef, useEffect } from 'react';
import { Search, Bell, X } from 'lucide-react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import SearchView from './components/SearchView';
import AlbumView from './components/AlbumView';
import ArtistView from './components/ArtistView';
import Player from './components/Player';
import YoutubePlayerManager from './components/YoutubePlayerManager';

function App() {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'search' | 'artist' | 'album'
  const [activeContext, setActiveContext] = useState(null); // holds { id, title, coverArt, artist } for albums/artists
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchCache, setSearchCache] = useState({
    query: '',
    category: 'All',
    songResults: [],
    artistResults: [],
    albumResults: []
  });
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  
  const playerRef = useRef(null);

  // Sync Progress with YouTube API
  useEffect(() => {
    let interval;
    if (isPlaying && playerRef.current) {
      interval = setInterval(async () => {
        try {
          if (playerRef.current.getCurrentTime && playerRef.current.getDuration) {
            const currentTime = await playerRef.current.getCurrentTime();
            const dur = await playerRef.current.getDuration();
            setProgress(currentTime);
            setDuration(dur);
          }
        } catch(e) { } // Ignore iframe communication errors
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync Volume
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Play/Pause override
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        if (playerRef.current.playVideo) playerRef.current.playVideo();
      } else {
        if (playerRef.current.pauseVideo) playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  const handlePlayTrack = (track) => {
    if (currentTrack?.id === track.id) {
      const newIsPlaying = !isPlaying;
      setIsPlaying(newIsPlaying);
      // Force sync with player
      if (playerRef.current) {
        if (newIsPlaying) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
      
      // Load and play the video synchronously during the user click event
      // This guarantees the browser allows autoplay!
      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(track.id);
      }
    }
  };

  const handleYoutubeReady = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    // Note: Do NOT play anything on ready. Wait for user to click a track.
  };

  const handleYoutubeStateChange = (event) => {
    // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
    if (event.data === 1) {
      setIsPlaying(true);
      if (playerRef.current.getDuration) {
        playerRef.current.getDuration().then(setDuration);
      }
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handleYoutubeError = (event) => {
    console.error('YouTube Player Error:', event.data);
    if (event.data === 101 || event.data === 150) {
      alert('Playback blocked! Official music videos (like VEVO) often disable embedding. Try playing a lyric video or audio-only upload instead!');
      setIsPlaying(false);
    } else {
      alert(`YouTube Error ${event.data}: This video cannot be played. Try another one!`);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    if (playerRef.current) {
      if (newIsPlaying) playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
    }
  };

  const handleSeek = (newTime) => {
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(newTime, true);
      setProgress(newTime);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  /* ----- Styling below remains the same minimal aesthetic ----- */
  const containerStyle = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    padding: '16px',
    gap: '16px',
    boxSizing: 'border-box',
    position: 'relative',
  };

  const navSectionStyle = {
    width: '240px',
    height: 'calc(100% - 90px)',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-glass)'
  };

  const mainSectionStyle = {
    flex: 1,
    height: 'calc(100% - 90px)',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-glass)'
  };

  const floatingPlayerStyle = {
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    right: '16px',
    height: '80px',
    borderRadius: '16px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    backgroundColor: 'var(--bg-glass)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid var(--border-glass)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
  };

  return (
    <div style={containerStyle}>
      <aside style={navSectionStyle}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === 'search' && activeTab === 'search') {
              setGlobalQuery(''); // Reset search if clicking Search icon while already there
            }
            setActiveTab(tab);
          }} 
        />
      </aside>

      <main style={mainSectionStyle}>
        {/* Persistent Top Header */}
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
          {/* Omni Search Bar */}
          <div style={{ position: 'relative', width: '420px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search artists, songs, or podcasts..."
              value={globalQuery}
              onChange={(e) => {
                setGlobalQuery(e.target.value);
                if (e.target.value.trim() && activeTab !== 'search') {
                  setActiveTab('search');
                }
              }}
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
            {globalQuery && (
              <X 
                size={16} 
                color="var(--text-muted)" 
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                onClick={() => setGlobalQuery('')}
              />
            )}
          </div>

          <div style={{ padding: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <Bell size={20} strokeWidth={1.5} />
          </div>
        </header>

        {activeTab === 'search' && (
          <SearchView 
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onPlayTrack={handlePlayTrack}
            globalQuery={globalQuery}
            setGlobalQuery={setGlobalQuery}
            searchCache={searchCache}
            setSearchCache={setSearchCache}
            onNavigate={(tab, contextData) => {
              setActiveContext(contextData);
              setActiveTab(tab);
            }}
          />
        )}
        {activeTab === 'discover' && (
          <MainView 
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onPlayTrack={handlePlayTrack}
          />
        )}
        {activeTab === 'album' && (
          <AlbumView 
            context={activeContext}
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onPlayTrack={handlePlayTrack}
            onBack={() => setActiveTab('search')}
          />
        )}
        {activeTab === 'artist' && (
          <ArtistView 
            context={activeContext}
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onPlayTrack={handlePlayTrack}
            onNavigate={(tab, contextData) => {
              setActiveContext(contextData);
              setActiveTab(tab);
            }}
            onBack={() => setActiveTab('search')}
          />
        )}
      </main>

      <div className="animate-enter" style={floatingPlayerStyle}>
        <Player 
          track={currentTrack} 
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
          progress={progress}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />
      </div>

      <YoutubePlayerManager 
        onReady={handleYoutubeReady}
        onStateChange={handleYoutubeStateChange}
        onError={handleYoutubeError}
      />
    </div>
  );
}

export default App;
