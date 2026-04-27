import { useState, useEffect } from 'react';
import { Search, Play, Pause, Loader2 } from 'lucide-react';

const MOCK_CATEGORIES = ['All', 'Podcasts', 'Live Events', 'New Releases', 'Pop', 'Hip-Hop'];

const MOCK_RESULTS = [
  {
    id: 'fHI8X4OXluQ',
    title: 'The Weeknd - Blinding Lights (Official Video)',
    artist: 'The Weeknd',
    coverArt: 'https://i.ytimg.com/vi/fHI8X4OXluQ/maxresdefault.jpg'
  },
  {
    id: 'v2AC41dglnM',
    title: 'AC/DC - Thunderstruck (Official Video)',
    artist: 'AC/DC',
    coverArt: 'https://i.ytimg.com/vi/v2AC41dglnM/maxresdefault.jpg'
  },
  {
    id: '09R8_2nJtjg',
    title: 'Maroon 5 - Sugar (Official Music Video)',
    artist: 'Maroon 5',
    coverArt: 'https://i.ytimg.com/vi/09R8_2nJtjg/maxresdefault.jpg'
  },
  {
    id: 'JGwWNGJdvx8',
    title: 'Ed Sheeran - Shape of You (Official Music Video)',
    artist: 'Ed Sheeran',
    coverArt: 'https://i.ytimg.com/vi/JGwWNGJdvx8/maxresdefault.jpg'
  }
];

const SearchView = ({ currentTrack, isPlaying: globalIsPlaying, onPlayTrack }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [results, setResults] = useState(MOCK_RESULTS);
  const [isSearching, setIsSearching] = useState(false);

  // Helper to decode HTML entities from YouTube API
  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults(MOCK_RESULTS);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        // fetch search results (type=video avoids channels/playlists)
        const res = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`);
        const data = await res.json();
        
        if (data.items) {
          const formattedResults = data.items.map(item => ({
            id: item.id.videoId,
            title: decodeHTML(item.snippet.title),
            artist: decodeHTML(item.snippet.channelTitle),
            coverArt: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url
          }));
          setResults(formattedResults);
        }
      } catch (err) {
        console.error("YouTube Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px', paddingBottom: '60px' }}>
      
      {/* Big Search Header */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '600px', marginBottom: '32px' }}>
        <Search size={24} color="var(--text-main)" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="search-input"
          style={{
            width: '100%',
            padding: '16px 20px 16px 56px',
            borderRadius: '12px',
            border: '1px solid var(--border-active)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'var(--text-main)',
            fontSize: '16px',
            fontWeight: '500',
            outline: 'none',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)' }}
          onBlur={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
        />
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
        {MOCK_CATEGORIES.map(cat => (
          <div 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              backgroundColor: activeCategory === cat ? 'var(--text-main)' : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat ? '#000' : 'var(--text-main)',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
          {query.trim() ? `Search results for "${query}"` : 'Browse all'}
        </h2>
        {isSearching && <Loader2 className="animate-spin" size={20} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />}
      </div>

      {/* Results Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '24px'
      }}>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        {results.map(track => {
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
  );
};

export default SearchView;
