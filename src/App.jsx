import { useState, useRef, useEffect } from 'react';
import { Search, Bell, X, Home, Library, Heart } from 'lucide-react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import SearchView from './components/SearchView';
import AlbumView from './components/AlbumView';
import ArtistView from './components/ArtistView';
import QueueView from './components/QueueView';
import FavoritesView from './components/FavoritesView';
import LyricsView from './components/LyricsView';
import Player from './components/Player';
import YoutubePlayerManager from './components/YoutubePlayerManager';

function App() {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'search' | 'artist' | 'album' | 'queue'
  const [activeContext, setActiveContext] = useState(null); // holds { id, title, coverArt, artist } for albums/artists
  const [globalQuery, setGlobalQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchCache, setSearchCache] = useState({}); // Dictionary cache
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);

  // Queue State
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Refs for callbacks (to avoid stale closures in MediaSession)
  const queueRef = useRef([]);
  const queueIndexRef = useRef(-1);
  const isShuffleRef = useRef(false);
  const isRepeatRef = useRef(false);
  const isAutoplayRef = useRef(true);
  const progressRef = useRef(0);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { isRepeatRef.current = isRepeat; }, [isRepeat]);
  useEffect(() => { isAutoplayRef.current = isAutoplay; }, [isAutoplay]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // Local Storage for Liked Songs
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('resonance_liked');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem('resonance_liked', JSON.stringify(likedSongs));
  }, [likedSongs]);

  const toggleLike = (track) => {
    setLikedSongs(prev => {
      const exists = prev.find(t => t.id === track.id);
      if (exists) return prev.filter(t => t.id !== track.id);
      return [...prev, track];
    });
  };
  
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

  // URL Hash Routing Listener
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (!hash || hash === '' || hash === '#discover') {
        setActiveTab('discover');
      } else if (hash.startsWith('#search')) {
        setActiveTab('search');
        const q = new URLSearchParams(hash.split('?')[1]).get('q') || '';
        setGlobalQuery(q);
        setInputText(q);
      } else if (hash.startsWith('#artist')) {
        setActiveTab('artist');
        const params = new URLSearchParams(hash.split('?')[1]);
        if (params.get('id')) {
          setActiveContext({
            id: params.get('id'),
            title: decodeURIComponent(params.get('title') || ''),
            coverArt: decodeURIComponent(params.get('cover') || '')
          });
        }
      } else if (hash.startsWith('#album')) {
        setActiveTab('album');
        const params = new URLSearchParams(hash.split('?')[1]);
        if (params.get('id')) {
          setActiveContext({
            id: params.get('id'),
            title: decodeURIComponent(params.get('title') || ''),
            artist: decodeURIComponent(params.get('artist') || ''),
            coverArt: decodeURIComponent(params.get('cover') || '')
          });
        }
      } else if (hash === '#queue') {
        setActiveTab('queue');
      } else if (hash === '#favorites') {
        setActiveTab('favorites');
      } else if (hash === '#lyrics') {
        setActiveTab('lyrics');
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState(); // Trigger on initial load
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Suggestions Fetcher
  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    if (!inputText.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        const isSpecific = /live|cover|karaoke|instrumental|audio|official/i.test(inputText);
        const searchQ = encodeURIComponent(inputText + (isSpecific ? '' : ' official audio'));
        const res = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${searchQ}&type=video&videoCategoryId=10&key=${apiKey}`);
        const data = await res.json();
        if (data.items) {
          const rawSuggs = data.items.map(item => ({
            id: item.id.videoId,
            title: decodeHTML(item.snippet.title),
            artist: decodeHTML(item.snippet.channelTitle),
            coverArt: item.snippet.thumbnails?.default?.url
          }));

          const seenTitles = new Set();
          const finalSuggs = [];
          for (const sugg of rawSuggs) {
            const cleanTitle = sugg.title.toLowerCase()
              .replace(/\(.*?\)/g, '')
              .replace(/\[.*?\]/g, '')
              .replace(/official|video|lyrics|audio|music|live/gi, '')
              .replace(/[^a-z0-9]/g, '');
            
            if (!seenTitles.has(cleanTitle) && cleanTitle.length > 0) {
              seenTitles.add(cleanTitle);
              finalSuggs.push(sugg);
            }
          }
          setSuggestions(finalSuggs);
        }
      } catch (e) {
        console.error("Suggestions failed", e);
      }
    }, 400); // 400ms debounce just for suggestions

    return () => clearTimeout(timer);
  }, [inputText]);

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

  // Queue Management
  const addToQueue = (track) => {
    setQueue(prev => {
      if (prev.length === 0) {
        handlePlayTrack(track);
        return [track];
      }
      return [...prev, track];
    });
  };

  const removeFromQueue = (index) => {
    setQueue(prev => {
      const newQ = [...prev];
      newQ.splice(index, 1);
      return newQ;
    });
    if (index < queueIndexRef.current) {
      setQueueIndex(prev => prev - 1);
    } else if (index === queueIndexRef.current) {
      // If we deleted the currently playing song, skip to the next!
      playNext();
    }
  };

  const reorderQueue = (sourceIndex, destinationIndex) => {
    setQueue(prev => {
      const newQ = [...prev];
      const [removed] = newQ.splice(sourceIndex, 1);
      newQ.splice(destinationIndex, 0, removed);
      return newQ;
    });
    
    setQueueIndex(prev => {
      if (sourceIndex === prev) return destinationIndex;
      if (sourceIndex < prev && destinationIndex >= prev) return prev - 1;
      if (sourceIndex > prev && destinationIndex <= prev) return prev + 1;
      return prev;
    });
  };

  const fetchRelatedTracks = async (videoId) => {
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      const res = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&videoCategoryId=10&maxResults=5&key=${apiKey}`);
      const data = await res.json();
      if (data.items) {
        return data.items.map(item => ({
          id: item.id.videoId,
          title: decodeHTML(item.snippet.title),
          artist: decodeHTML(item.snippet.channelTitle),
          coverArt: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url
        }));
      }
    } catch (e) {
      console.error("Autoplay fetch failed", e);
    }
    return [];
  };

  const playNext = async () => {
    const q = queueRef.current;
    if (q.length === 0) return;
    let nextIdx = queueIndexRef.current + 1;
    let targetQ = q;

    if (isShuffleRef.current) {
      nextIdx = Math.floor(Math.random() * q.length);
    } else if (nextIdx >= q.length) {
      if (isRepeatRef.current) {
        nextIdx = 0;
      } else if (isAutoplayRef.current) {
        // Infinite Radio: Fetch related videos
        const currentTrackId = q[queueIndexRef.current].id;
        const related = await fetchRelatedTracks(currentTrackId);
        if (related && related.length > 0) {
          const newQ = [...q, ...related];
          setQueue(newQ);
          queueRef.current = newQ; // Force update ref instantly
          targetQ = newQ;
          nextIdx = q.length;
        } else {
          return; // End of queue
        }
      } else {
        return; // End of queue
      }
    }
    setQueueIndex(nextIdx);
    setCurrentTrack(targetQ[nextIdx]);
    setIsPlaying(true);
    setProgress(0);
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(targetQ[nextIdx].id);
    }
  };

  const playPrev = () => {
    const q = queueRef.current;
    if (q.length === 0) return;
    if (progressRef.current > 3) {
      // If we are more than 3 seconds in, restart song
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(0, true);
        setProgress(0);
      }
      return;
    }
    let prevIdx = queueIndexRef.current - 1;
    if (prevIdx < 0) {
      if (isRepeatRef.current) prevIdx = q.length - 1;
      else prevIdx = 0;
    }
    setQueueIndex(prevIdx);
    setCurrentTrack(q[prevIdx]);
    setIsPlaying(true);
    setProgress(0);
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(q[prevIdx].id);
    }
  };

  const handlePlayTrack = (track, contextQueue = null) => {
    if (currentTrack?.id === track.id) {
      const newIsPlaying = !isPlaying;
      setIsPlaying(newIsPlaying);
      if (playerRef.current) {
        if (newIsPlaying) playerRef.current.playVideo();
        else playerRef.current.pauseVideo();
      }
    } else {
      setCurrentTrack(track);
      if (contextQueue && contextQueue.length > 0) {
        setQueue(contextQueue);
        const idx = contextQueue.findIndex(t => t.id === track.id);
        setQueueIndex(idx !== -1 ? idx : 0);
        
        if (contextQueue.length === 1 && isAutoplayRef.current) {
          fetchRelatedTracks(track.id).then(related => {
            if (related && related.length > 0) {
              setQueue(prev => [...prev, ...related]);
            }
          });
        }
      } else {
        setQueue([track]);
        setQueueIndex(0);
        
        if (isAutoplayRef.current) {
          fetchRelatedTracks(track.id).then(related => {
            if (related && related.length > 0) {
              setQueue(prev => [...prev, ...related]);
            }
          });
        }
      }
      setIsPlaying(true);
      setProgress(0);
      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(track.id);
      }
    }
  };

  const handleYoutubeReady = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
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
      // Auto-Play next track when ended
      playNext();
    }
  };

  const handleYoutubeError = (event) => {
    console.error('YouTube Player Error:', event.data);
    // On error, just skip to next track
    playNext();
  };

  // MediaSession API Integration
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || 'Unknown Artist',
        artwork: [{ src: currentTrack.coverArt, sizes: '512x512', type: 'image/jpeg' }]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        if (playerRef.current) playerRef.current.playVideo();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        if (playerRef.current) playerRef.current.pauseVideo();
      });
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }, [currentTrack]);

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
  // Inline styles removed in favor of index.css classes for responsiveness

  return (
    <div className="app-container">
      <aside className="app-sidebar">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            if (tab === 'search') {
              if (activeTab === 'search') {
                setGlobalQuery('');
                setInputText('');
              }
              window.history.pushState(null, '', '#search');
            } else if (tab === 'discover') {
              window.history.pushState(null, '', '#discover');
            } else if (tab === 'favorites') {
              window.history.pushState(null, '', '#favorites');
            }
            setActiveTab(tab);
          }} 
        />
      </aside>

      <main className="app-main">
        {/* Persistent Top Header */}
        <header className="app-header" style={{ 
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
          <div className="search-input-container" style={{ position: 'relative', width: '420px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search artists, songs, or podcasts..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setShowSuggestions(false);
                  if (inputText.trim()) {
                    window.history.pushState(null, '', `#search?q=${encodeURIComponent(inputText)}`);
                    setGlobalQuery(inputText);
                    setActiveTab('search');
                  }
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
              onFocus={(e) => { 
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; 
                e.currentTarget.style.borderColor = 'var(--border-active)';
                if (inputText.trim()) setShowSuggestions(true);
              }}
              onBlur={(e) => { 
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; 
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            {inputText && (
              <X 
                size={16} 
                color="var(--text-muted)" 
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                onClick={() => {
                  setGlobalQuery('');
                  setInputText('');
                  window.history.replaceState(null, '', '#search');
                }}
              />
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                backgroundColor: 'rgba(30, 30, 35, 0.95)',
                backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '12px', border: '1px solid var(--border-glass)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100
              }}>
                {suggestions.map((sugg, index) => (
                  <div 
                    key={sugg.id + index}
                    onClick={() => {
                      setShowSuggestions(false);
                      setInputText(sugg.title);
                      setGlobalQuery(sugg.title);
                      window.history.pushState(null, '', `#search?q=${encodeURIComponent(sugg.title)}`);
                      setActiveTab('search');
                      handlePlayTrack(sugg, suggestions); // Instantly play and queue the 5 suggestions!
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <img src={sugg.coverArt} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt={sugg.title} />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{sugg.title}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sugg.artist}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <Bell size={20} strokeWidth={1.5} />
          </div>
        </header>

        {activeTab === 'discover' && (
          <MainView 
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onPlayTrack={handlePlayTrack}
            onAddToQueue={addToQueue}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
          />
        )}
        {activeTab === 'search' && (
          <SearchView 
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onPlayTrack={handlePlayTrack}
            globalQuery={globalQuery}
            setGlobalQuery={setGlobalQuery}
            searchCache={searchCache}
            setSearchCache={setSearchCache}
            onAddToQueue={addToQueue}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
            onNavigate={(tab, contextData) => {
              setActiveContext(contextData);
              setActiveTab(tab);
              if (tab === 'artist') {
                window.history.pushState(null, '', `#artist?id=${contextData.id}&title=${encodeURIComponent(contextData.title)}&cover=${encodeURIComponent(contextData.coverArt)}`);
              } else if (tab === 'album') {
                window.history.pushState(null, '', `#album?id=${contextData.id}&title=${encodeURIComponent(contextData.title)}&artist=${encodeURIComponent(contextData.artist || '')}&cover=${encodeURIComponent(contextData.coverArt)}`);
              }
            }}
          />
        )}
        {activeTab === 'album' && (
          <AlbumView 
            context={activeContext}
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onPlayTrack={handlePlayTrack}
            onAddToQueue={addToQueue}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
            onBack={() => {
              window.history.back(); // Use native browser back
            }}
          />
        )}
        {activeTab === 'artist' && (
          <ArtistView 
            context={activeContext}
            currentTrack={currentTrack} 
            isPlaying={isPlaying} 
            onPlayTrack={handlePlayTrack}
            onAddToQueue={addToQueue}
            likedSongs={likedSongs}
            toggleLike={toggleLike}
            onNavigate={(tab, contextData) => {
              setActiveContext(contextData);
              setActiveTab(tab);
            }}
            onBack={() => {
              window.history.back(); // Use native browser back
            }}
          />
        )}
        {activeTab === 'queue' && (
          <QueueView
            queue={queue}
            queueIndex={queueIndex}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            removeFromQueue={removeFromQueue}
            reorderQueue={reorderQueue}
            isAutoplay={isAutoplay}
            setIsAutoplay={setIsAutoplay}
          />
        )}
        {activeTab === 'favorites' && (
          <FavoritesView
            likedSongs={likedSongs}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            toggleLike={toggleLike}
          />
        )}
        {activeTab === 'lyrics' && (
          <LyricsView
            currentTrack={currentTrack}
            progress={progress}
          />
        )}
      </main>

      <div className="animate-enter floating-player">
        <Player 
          track={currentTrack} 
          isPlaying={isPlaying}
          onTogglePlay={togglePlayPause}
          progress={progress}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onNext={playNext}
          onPrev={playPrev}
          onShuffle={() => setIsShuffle(!isShuffle)}
          onRepeat={() => setIsRepeat(!isRepeat)}
          isShuffle={isShuffle}
          isRepeat={isRepeat}
          onOpenQueue={() => {
            window.history.pushState(null, '', '#queue');
            setActiveTab('queue');
          }}
          onOpenLyrics={() => {
            window.history.pushState(null, '', '#lyrics');
            setActiveTab('lyrics');
          }}
        />
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="app-bottom-nav">
        <div 
          onClick={() => { window.history.pushState(null, '', '#discover'); setActiveTab('discover'); }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'discover' ? '#1ed760' : 'var(--text-muted)' }}
        >
          <Home size={24} strokeWidth={activeTab === 'discover' ? 2.5 : 2} />
          <span style={{ fontSize: '10px', fontWeight: '500' }}>Home</span>
        </div>
        <div 
          onClick={() => { window.history.pushState(null, '', '#search'); setActiveTab('search'); }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'search' ? '#1ed760' : 'var(--text-muted)' }}
        >
          <Search size={24} strokeWidth={activeTab === 'search' ? 2.5 : 2} />
          <span style={{ fontSize: '10px', fontWeight: '500' }}>Search</span>
        </div>
        <div 
          onClick={() => { window.history.pushState(null, '', '#favorites'); setActiveTab('favorites'); }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'favorites' ? '#1ed760' : 'var(--text-muted)' }}
        >
          <Library size={24} strokeWidth={activeTab === 'favorites' ? 2.5 : 2} />
          <span style={{ fontSize: '10px', fontWeight: '500' }}>Library</span>
        </div>
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
