import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Shuffle, Repeat } from 'lucide-react';

const ExpandedPlayer = ({ currentTrack, isPlaying, progress, duration, onTogglePlay, onNext, onPrev, onSeek, onClose, isShuffle, isRepeat, onShuffle, onRepeat }) => {
  const [lyricsData, setLyricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  
  // Disable body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // Fetch lyrics with strict 2-second timeout
  useEffect(() => {
    if (!currentTrack) return;
    const fetchLyrics = async () => {
      setIsLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds

      try {
        const cleanTitle = currentTrack.title.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^)]*\] */g, "").trim();
        const cleanArtist = currentTrack.artist.replace(/ - Topic/g, "").trim();
        
        const res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error('Lyrics not found');
        const data = await res.json();
        
        if (data.syncedLyrics) {
          const lines = data.syncedLyrics.split('\n').map(line => {
            const match = line.match(/^\[(\d+):(\d+\.\d+)\](.*)/);
            if (match) return { time: (parseInt(match[1]) * 60) + parseFloat(match[2]), text: match[3].trim() };
            return null;
          }).filter(Boolean);
          setLyricsData({ type: 'synced', lines });
        } else if (data.plainLyrics) {
          setLyricsData({ type: 'plain', text: data.plainLyrics });
        } else setLyricsData({ type: 'not_found' });
      } catch (err) {
        clearTimeout(timeoutId);
        setLyricsData({ type: 'not_found' });
      } finally { setIsLoading(false); }
    };
    fetchLyrics();
  }, [currentTrack]);

  // Active Lyric Syncing
  let activeIndex = -1;
  if (lyricsData?.type === 'synced' && lyricsData.lines) {
    for (let i = 0; i < lyricsData.lines.length; i++) {
      if (progress >= lyricsData.lines[i].time) activeIndex = i;
      else break;
    }
  }

  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeEl = containerRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    return `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    if (!duration) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    onSeek(percent * duration);
  };

  if (!currentTrack) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      display: 'flex', backgroundColor: '#000',
      animation: 'slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
    }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .lyric-line { transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); transform-origin: left center; }
        .lyric-line.active { font-size: 36px; font-weight: 800; color: #fff; transform: scale(1.05); }
        .lyric-line.inactive { font-size: 32px; font-weight: 700; color: rgba(255,255,255,0.4); transform: scale(1); }
      `}</style>
      
      {/* Blurred Background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${currentTrack.coverArt})`, backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(100px) brightness(0.4)', zIndex: 0
      }} />

      {/* Top Bar */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', zIndex: 10 }}>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)'
        }}>
          <ChevronDown size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', width: '100%', height: '100%', zIndex: 1 }}>
        
        {/* Left Side: Artwork & Controls */}
        <div style={{ flex: 1, padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <img src={currentTrack.coverArt} alt="cover" style={{
            width: '100%', maxWidth: '500px', aspectRatio: '1/1', objectFit: 'cover',
            borderRadius: '16px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', marginBottom: '48px', alignSelf: 'center'
          }} />
          
          <div style={{ maxWidth: '600px', width: '100%', alignSelf: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</h2>
            <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)', margin: '0 0 32px 0' }}>{currentTrack.artist}</p>
            
            {/* Scrubber */}
            <div style={{ marginBottom: '32px' }}>
              <div onClick={handleSeek} style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', cursor: 'pointer', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#fff', borderRadius: '3px', width: `${duration ? (progress / duration) * 100 : 0}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
              <button onClick={onShuffle} style={{ background: 'none', border: 'none', color: isShuffle ? '#1ed760' : 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><Shuffle size={24} /></button>
              <button onClick={onPrev} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><SkipBack size={36} fill="currentColor" /></button>
              <button onClick={onTogglePlay} style={{
                background: '#fff', border: 'none', borderRadius: '50%', width: '72px', height: '72px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', cursor: 'pointer',
                transition: 'transform 0.1s', transform: 'scale(1)'
              }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
              </button>
              <button onClick={onNext} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><SkipForward size={36} fill="currentColor" /></button>
              <button onClick={onRepeat} style={{ background: 'none', border: 'none', color: isRepeat ? '#1ed760' : 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><Repeat size={24} /></button>
            </div>
          </div>
        </div>

        {/* Right Side: Lyrics */}
        <div ref={containerRef} style={{
          flex: 1, padding: '120px 80px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '24px',
          maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
        }}>
          {isLoading && <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)' }}>Loading lyrics...</div>}
          {!isLoading && lyricsData?.type === 'not_found' && <div style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)' }}>Lyrics not available</div>}
          {!isLoading && lyricsData?.type === 'plain' && <div style={{ fontSize: '24px', color: '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{lyricsData.text}</div>}
          {!isLoading && lyricsData?.type === 'synced' && lyricsData.lines.map((line, idx) => (
            <div key={idx} data-index={idx} className={`lyric-line ${idx === activeIndex ? 'active' : 'inactive'}`}>
              {line.text || '♪'}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ExpandedPlayer;
