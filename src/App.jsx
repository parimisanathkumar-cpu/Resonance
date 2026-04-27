import { useState, useRef, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import SearchView from './components/SearchView';
import Player from './components/Player';
import YoutubePlayerManager from './components/YoutubePlayerManager';

function App() {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'search'
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
      setIsPlaying(!isPlaying); // Toggle
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleYoutubeReady = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
    if (isPlaying) {
      event.target.playVideo();
    }
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

  const togglePlayPause = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
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
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </aside>

      <main style={mainSectionStyle}>
        {activeTab === 'search' ? (
          <SearchView currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} />
        ) : (
          <MainView currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} />
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
        track={currentTrack}
        onReady={handleYoutubeReady}
        onStateChange={handleYoutubeStateChange}
      />
    </div>
  );
}

export default App;
