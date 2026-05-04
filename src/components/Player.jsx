import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, List, Mic2 } from 'lucide-react';

const Player = ({ track, isPlaying, onTogglePlay, progress, duration, onSeek, volume, onVolumeChange, onNext, onPrev, onShuffle, onRepeat, isShuffle, isRepeat, onOpenQueue, onOpenLyrics }) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  };

  const trackInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '30%',
  };

  const controlsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
  };

  const buttonsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '8px',
  };

  const iconBtnStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const playBtnStyle = {
    background: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: track ? 'pointer' : 'default',
    color: '#000',
    transition: 'transform 0.2s ease',
    opacity: track ? 1 : 0.5,
  };

  const progressBarStyle = {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '500',
  };

  const sliderTrackStyle = {
    flexGrow: 1,
    height: '3px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    position: 'relative',
    cursor: track ? 'pointer' : 'default',
    padding: '4px 0' // makes click area larger
  };

  const extraControlsStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '30%',
    gap: '16px',
    color: 'var(--text-muted)',
  };

  // Helper functions
  const formatTime = (timeInSecs) => {
    if (!timeInSecs || isNaN(timeInSecs)) return '0:00';
    const m = Math.floor(timeInSecs / 60);
    const s = Math.floor(timeInSecs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeekClick = (e) => {
    if (!track || duration === 0) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    onSeek(percent * duration);
  };

  const handleVolumeClick = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    onVolumeChange(Math.round(percent * 100));
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="player-container" style={containerStyle}>
      {/* Track Info */}
      <div className="player-track-info" style={trackInfoStyle}>
        {track ? (
          <>
            <img 
              src={track.coverArt} 
              alt="cover" 
              style={{ width: '44px', height: '44px', borderRadius: '4px', objectFit: 'cover' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>{track.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{track.artist}</div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ready to play</div>
        )}
      </div>

      {/* Controls */}
      <div className="player-controls" style={controlsContainerStyle}>
        <div style={buttonsStyle}>
          <button style={{...iconBtnStyle, color: isShuffle ? '#1ed760' : 'var(--text-muted)'}} onClick={onShuffle} onMouseEnter={(e) => !isShuffle && (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => !isShuffle && (e.currentTarget.style.color = 'var(--text-muted)')}><Shuffle size={16} /></button>
          <button style={iconBtnStyle} onClick={onPrev} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}><SkipBack size={20} fill="currentColor" /></button>
          
          <button 
            style={playBtnStyle} 
            onClick={track ? onTogglePlay : undefined}
            onMouseEnter={(e) => track && (e.currentTarget.style.transform = 'scale(1.05)')} 
            onMouseLeave={(e) => track && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isPlaying ? (
              <Pause size={16} fill="black" />
            ) : (
              <Play size={16} fill="black" style={{ marginLeft: '2px' }} />
            )}
          </button>
          
          <button style={iconBtnStyle} onClick={onNext} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}><SkipForward size={20} fill="currentColor" /></button>
          <button style={{...iconBtnStyle, color: isRepeat ? '#1ed760' : 'var(--text-muted)'}} onClick={onRepeat} onMouseEnter={(e) => !isRepeat && (e.currentTarget.style.color = 'var(--text-main)')} onMouseLeave={(e) => !isRepeat && (e.currentTarget.style.color = 'var(--text-muted)')}><Repeat size={16} /></button>
        </div>
        <div className="player-progress" style={progressBarStyle}>
          <span>{formatTime(progress)}</span>
          
          <div style={sliderTrackStyle} onClick={handleSeekClick}>
             {/* Actual visual bar */}
             <div style={{ position: 'absolute', top: '4px', left: 0, width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
             {/* Filled bar */}
            <div style={{ position: 'absolute', top: '4px', left: 0, width: `${progressPercent}%`, background: 'var(--text-main)', height: '3px', borderRadius: '2px' }}>
            </div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Extra */}
      <div className="player-extra" style={extraControlsStyle}>
        <button style={iconBtnStyle} onClick={onOpenLyrics} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          <Mic2 size={16} />
        </button>
        <button style={iconBtnStyle} onClick={onOpenQueue} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          <List size={16} />
        </button>
        
        {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        
        <div style={{ width: '80px', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', cursor: 'pointer', padding: '4px 0', position: 'relative' }} onClick={handleVolumeClick}>
           <div style={{ position: 'absolute', top: '4px', left: 0, width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
          <div style={{ position: 'absolute', top: '4px', left: 0, width: `${volume}%`, background: 'var(--text-main)', height: '3px', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );
};

export default Player;
