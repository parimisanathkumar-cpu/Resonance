import React, { useState, useEffect, useRef } from 'react';

const LyricsView = ({ currentTrack, progress }) => {
  const [lyricsData, setLyricsData] = useState(null); // { lines: [{ time, text }], plain: "..." }
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!currentTrack) return;
    
    const fetchLyrics = async () => {
      setIsLoading(true);
      setLyricsData(null);
      try {
        // Strip out brackets/remix tags from title to improve search accuracy
        const cleanTitle = currentTrack.title.replace(/ *\([^)]*\) */g, "").replace(/ *\[[^)]*\] */g, "").trim();
        const cleanArtist = currentTrack.artist.replace(/ - Topic/g, "").trim();
        
        const res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`);
        if (!res.ok) throw new Error('Lyrics not found');
        const data = await res.json();
        
        if (data.syncedLyrics) {
          const lines = data.syncedLyrics.split('\n').map(line => {
            const match = line.match(/^\[(\d+):(\d+\.\d+)\](.*)/);
            if (match) {
              const minutes = parseInt(match[1]);
              const seconds = parseFloat(match[2]);
              const time = (minutes * 60) + seconds;
              return { time, text: match[3].trim() };
            }
            return null;
          }).filter(Boolean);
          setLyricsData({ type: 'synced', lines });
        } else if (data.plainLyrics) {
          setLyricsData({ type: 'plain', text: data.plainLyrics });
        } else {
          setLyricsData({ type: 'not_found' });
        }
      } catch (err) {
        console.error("Lyrics fetch failed", err);
        setLyricsData({ type: 'not_found' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLyrics();
  }, [currentTrack]);

  // Find active line
  let activeIndex = -1;
  if (lyricsData?.type === 'synced' && lyricsData.lines) {
    for (let i = 0; i < lyricsData.lines.length; i++) {
      if (progress >= lyricsData.lines[i].time) {
        activeIndex = i;
      } else {
        break; // since it's ordered chronologically
      }
    }
  }

  // Auto-scroll
  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.querySelector(`[data-index="${activeIndex}"]`);
      if (activeElement) {
        // Only scroll if we are actively tracking
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (!currentTrack) {
    return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>Play a song to see lyrics.</div>;
  }

  return (
    <div 
      className="animate-enter"
      style={{ 
        display: 'flex', flexDirection: 'column', height: '100%', 
        backgroundColor: '#000',
        position: 'relative'
      }}
    >
      {/* Background Blur of Cover Art */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${currentTrack.coverArt})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(80px) brightness(0.4)', zIndex: 0, opacity: 0.8
      }} />

      <div style={{ zIndex: 1, padding: '32px', paddingBottom: '0' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Lyrics</h1>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          zIndex: 1, flex: 1, overflowY: 'auto', padding: '32px', paddingBottom: '200px',
          display: 'flex', flexDirection: 'column', gap: '24px',
        }}
      >
        {isLoading && <div style={{ fontSize: '32px', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>Loading lyrics...</div>}
        
        {!isLoading && lyricsData?.type === 'not_found' && (
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>
            Looks like we don't have lyrics for this song.
          </div>
        )}

        {!isLoading && lyricsData?.type === 'plain' && (
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'white', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
            {lyricsData.text}
          </div>
        )}

        {!isLoading && lyricsData?.type === 'synced' && lyricsData.lines.map((line, idx) => {
          const isActive = idx === activeIndex;
          
          return (
            <div 
              key={idx} 
              data-index={idx}
              style={{
                fontSize: isActive ? '48px' : '40px',
                fontWeight: '800',
                lineHeight: '1.2',
                letterSpacing: '-1px',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.3)',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                transformOrigin: 'left center',
                transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              {line.text || '♪'}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LyricsView;
