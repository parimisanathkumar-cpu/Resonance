import { useState, useRef, useEffect, useCallback } from 'react';
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
import LibraryView from './components/LibraryView';
import PlaylistView from './components/PlaylistView';
import TrackContextMenu from './components/TrackContextMenu';
import Player from './components/Player';
import ExpandedPlayer from './components/ExpandedPlayer';
import YoutubePlayerManager from './components/YoutubePlayerManager';
import AuthModal from './components/AuthModal';

// Helpers
const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
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

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('discover');
  const [activeContext, setActiveContext] = useState(null);
  const [globalQuery, setGlobalQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchCache, setSearchCache] = useState({});
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);

  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [isSidebarWidgetOpen, setIsSidebarWidgetOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Queue State
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState(null);

  // Refs for stable callbacks
  const queueRef = useRef([]);
  const queueIndexRef = useRef(-1);
  const isShuffleRef = useRef(false);
  const isRepeatRef = useRef(false);
  const isAutoplayRef = useRef(true);
  const progressRef = useRef(0);
  const playerRef = useRef(null);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { isRepeatRef.current = isRepeat; }, [isRepeat]);
  useEffect(() => { isAutoplayRef.current = isAutoplay; }, [isAutoplay]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // Backend API Integration
  const API_BASE_URL = 'http://localhost:8000/api';
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  const fetchPlaylists = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/playlists/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
      }
    } catch (e) {
      console.error("Failed to load playlists", e);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/favorites/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
           if (res.status === 401) { setToken(null); localStorage.removeItem('token'); }
           throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        // Map backend TrackResponse format to frontend track format
        const mappedData = data.map(t => ({
          id: t.track_id,
          type: 'song',
          title: t.title,
          artist: t.artist,
          coverArt: t.cover_art
        }));
        setLikedSongs(mappedData);
      })
      .catch(err => console.error("Failed to load favorites", err));
      
    fetchPlaylists();
  }, [token]);

  const toggleLike = useCallback(async (track) => {
    // Optimistic UI update
    setLikedSongs(prev => {
      const exists = prev.find(t => t.id === track.id);
      if (exists) return prev.filter(t => t.id !== track.id);
      return [...prev, track];
    });

    // Backend sync
    try {
      await fetch(`${API_BASE_URL}/favorites/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          track_id: track.id,
          title: track.title,
          artist: track.artist,
          cover_art: track.coverArt
        })
      });
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
  }, []);

  // Player Controls
  const playNext = useCallback(async () => {
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
        const lastTrack = q[queueIndexRef.current];
        if (!lastTrack) return;
        const related = await fetchRelatedTracks(lastTrack.id);
        if (related && related.length > 0) {
          setQueue(prev => [...prev, ...related]);
          targetQ = [...q, ...related];
          nextIdx = q.length;
        } else return;
      } else return;
    }

    const nextTrack = targetQ[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
      setProgress(0);
      if (playerRef.current?.loadVideoById) playerRef.current.loadVideoById(nextTrack.id);
    }
  }, []);

  const playPrev = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;
    if (progressRef.current > 3) {
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(0, true);
        setProgress(0);
      }
      return;
    }
    let prevIdx = queueIndexRef.current - 1;
    if (prevIdx < 0) prevIdx = isRepeatRef.current ? q.length - 1 : 0;

    const prevTrack = q[prevIdx];
    if (prevTrack) {
      setQueueIndex(prevIdx);
      setCurrentTrack(prevTrack);
      setIsPlaying(true);
      setProgress(0);
      if (playerRef.current?.loadVideoById) playerRef.current.loadVideoById(prevTrack.id);
    }
  }, []);

  const handlePlayTrack = useCallback((track, contextQueue = null) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        if (playerRef.current) playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        if (playerRef.current) playerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    if (contextQueue && contextQueue.length > 0) {
      setQueue(contextQueue);
      const idx = contextQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx !== -1 ? idx : 0);
    } else {
      setQueue([track]);
      setQueueIndex(0);
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    if (playerRef.current?.loadVideoById) playerRef.current.loadVideoById(track.id);
  }, [currentTrack, isPlaying]);

  const handleYoutubeReady = useCallback((event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
  }, [volume]);

  const handleYoutubeStateChange = useCallback((event) => {
    if (event.data === 1) { // PLAYING
      setIsPlaying(true);
      if (playerRef.current?.getDuration) {
        playerRef.current.getDuration().then(setDuration);
      }
    } else if (event.data === 2) { // PAUSED
      setIsPlaying(false);
    } else if (event.data === 0) { // ENDED
      setIsPlaying(false);
      setProgress(0);
      playNext();
    }
  }, [playNext]);

  const handleYoutubeError = useCallback((event) => {
    console.error('YouTube Player Error:', event.data);
    playNext();
  }, [playNext]);

  // Sync Progress
  useEffect(() => {
    let interval;
    if (isPlaying && playerRef.current) {
      interval = setInterval(async () => {
        try {
          if (playerRef.current?.getCurrentTime) {
            const currentTime = await playerRef.current.getCurrentTime();
            setProgress(currentTime);
          }
        } catch(e) {}
      }, 50); // 50ms for buttery smooth lyrics sync
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Hash Routing
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      if (!hash || hash === '' || hash === '#discover') setActiveTab('discover');
      else if (hash.startsWith('#search')) {
        setActiveTab('search');
        const q = new URLSearchParams(hash.split('?')[1]).get('q') || '';
        setGlobalQuery(q);
        setInputText(q);
      } else if (hash.startsWith('#artist')) {
        setActiveTab('artist');
        const params = new URLSearchParams(hash.split('?')[1]);
        if (params.get('id')) setActiveContext({ id: params.get('id'), title: decodeURIComponent(params.get('title') || ''), coverArt: decodeURIComponent(params.get('cover') || '') });
      } else if (hash.startsWith('#album')) {
        setActiveTab('album');
        const params = new URLSearchParams(hash.split('?')[1]);
        if (params.get('id')) setActiveContext({ id: params.get('id'), title: decodeURIComponent(params.get('title') || ''), artist: decodeURIComponent(params.get('artist') || ''), coverArt: decodeURIComponent(params.get('cover') || '') });
      } else if (hash === '#favorites') setActiveTab('favorites');
      else if (hash === '#library') setActiveTab('library');
      else if (hash.startsWith('#playlist')) {
        setActiveTab('playlist');
        const params = new URLSearchParams(hash.split('?')[1]);
        if (params.get('id')) setActiveContext({ id: params.get('id'), title: decodeURIComponent(params.get('title') || '') });
      }
    };
    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Suggestions
  useEffect(() => {
    if (!inputText.trim()) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        const res = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(inputText + ' official audio')}&type=video&videoCategoryId=10&key=${apiKey}`);
        const data = await res.json();
        if (data.items) {
          setSuggestions(data.items.map(item => ({
            id: item.id.videoId,
            title: decodeHTML(item.snippet.title),
            artist: decodeHTML(item.snippet.channelTitle),
            coverArt: item.snippet.thumbnails?.default?.url
          })));
        }
      } catch (e) {}
    }, 400);
    return () => clearTimeout(timer);
  }, [inputText]);

  // MediaSession
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || 'Unknown Artist',
        artwork: [{ src: currentTrack.coverArt, sizes: '512x512', type: 'image/jpeg' }]
      });
      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        playerRef.current?.playVideo();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        playerRef.current?.pauseVideo();
      });
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }, [currentTrack, playNext, playPrev]);

  return (
    <div className="app-container">
      <aside className="app-sidebar">
        <Sidebar 
          activeTab={activeTab} 
          playlists={playlists}
          currentTrack={currentTrack}
          isWidgetOpen={isSidebarWidgetOpen}
          onTabChange={(tab, data) => {
            if (tab === 'search') {
              if (activeTab === 'search') { setGlobalQuery(''); setInputText(''); }
              window.history.pushState(null, '', '#search');
            } else if (data && data.id) {
              window.history.pushState(null, '', `#${tab}?id=${data.id}`);
            } else {
              window.history.pushState(null, '', `#${tab}`);
            }
            if (data) setActiveContext(data);
            setActiveTab(tab);
          }}
        onSignOut={() => {
          setToken(null);
          localStorage.removeItem('token');
        }}
        />
      </aside>

      <main className="app-main">
        <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid var(--border-glass)', position: 'sticky', top: 0, backgroundColor: 'rgba(18, 18, 22, 0.8)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
          <div className="search-input-container" style={{ position: 'relative', width: '420px' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input type="text" placeholder="Search artists, songs, or podcasts..." value={inputText} onChange={(e) => { setInputText(e.target.value); setShowSuggestions(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { setShowSuggestions(false); if (inputText.trim()) { window.history.pushState(null, '', `#search?q=${encodeURIComponent(inputText)}`); setGlobalQuery(inputText); setActiveTab('search'); } } }}
              className="search-input" style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)'; if (inputText.trim()) setShowSuggestions(true); }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; setTimeout(() => setShowSuggestions(false), 200); }}
            />
            {inputText && <X size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} onClick={() => { setGlobalQuery(''); setInputText(''); window.history.replaceState(null, '', '#search'); }} />}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, backgroundColor: 'rgba(30, 30, 35, 0.95)', backdropFilter: 'blur(16px)', borderRadius: '12px', border: '1px solid var(--border-glass)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 100 }}>
                {suggestions.map((sugg, index) => (
                  <div key={sugg.id + index} onClick={() => { setShowSuggestions(false); setInputText(sugg.title); setGlobalQuery(sugg.title); window.history.pushState(null, '', `#search?q=${encodeURIComponent(sugg.title)}`); setActiveTab('search'); handlePlayTrack(sugg, suggestions); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
          <div style={{ padding: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}><Bell size={20} /></div>
        </header>

        {activeTab === 'discover' && <MainView currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} onOpenPlaylistModal={(e, t) => setContextMenu({ x: e.clientX, y: e.clientY, track: t })} likedSongs={likedSongs} toggleLike={toggleLike} onNavigate={(tab, data) => { setActiveContext(data); setActiveTab(tab); window.history.pushState(null, '', `#${tab}?id=${data.id}`); }} />}
        {activeTab === 'search' && <SearchView currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} globalQuery={globalQuery} setGlobalQuery={setGlobalQuery} searchCache={searchCache} setSearchCache={setSearchCache} onOpenPlaylistModal={(e, t) => setContextMenu({ x: e.clientX, y: e.clientY, track: t })} likedSongs={likedSongs} toggleLike={toggleLike} onNavigate={(tab, data) => { setActiveContext(data); setActiveTab(tab); window.history.pushState(null, '', `#${tab}?id=${data.id}`); }} />}
        {activeTab === 'album' && <AlbumView context={activeContext} currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} onOpenPlaylistModal={(e, t) => setContextMenu({ x: e.clientX, y: e.clientY, track: t })} likedSongs={likedSongs} toggleLike={toggleLike} onBack={() => window.history.back()} />}
        {activeTab === 'artist' && <ArtistView context={activeContext} currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} onOpenPlaylistModal={(e, t) => setContextMenu({ x: e.clientX, y: e.clientY, track: t })} likedSongs={likedSongs} toggleLike={toggleLike} onNavigate={(tab, data) => { setActiveContext(data); setActiveTab(tab); }} onBack={() => window.history.back()} />}
        {activeTab === 'favorites' && <FavoritesView likedSongs={likedSongs} currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} toggleLike={toggleLike} />}
        {activeTab === 'library' && <LibraryView playlists={playlists} refreshPlaylists={fetchPlaylists} onPlayTrack={handlePlayTrack} onNavigate={(tab, data) => { setActiveContext(data); setActiveTab(tab); window.history.pushState(null, '', `#${tab}?id=${data.id}`); }} />}
        {activeTab === 'playlist' && <PlaylistView context={activeContext} playlists={playlists} currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} onOpenPlaylistModal={(e, t) => setContextMenu({ x: e.clientX, y: e.clientY, track: t })} likedSongs={likedSongs} toggleLike={toggleLike} onBack={() => window.history.back()} />}
      </main>

      {contextMenu && (
        <TrackContextMenu 
          x={contextMenu.x}
          y={contextMenu.y}
          track={contextMenu.track}
          playlists={playlists}
          onClose={() => setContextMenu(null)}
          onAddToQueue={(t) => {
            if (!currentTrack) handlePlayTrack(t);
            else {
              setQueue(q => {
                const newQ = [...q];
                // Find the last index of a user-added track that is after the current playing index
                let insertIdx = queueIndex + 1;
                while (insertIdx < newQ.length && newQ[insertIdx].isUserAdded) {
                  insertIdx++;
                }
                newQ.splice(insertIdx, 0, { ...t, isUserAdded: true });
                return newQ;
              });
            }
          }}
          onPlayNext={(t) => {
            if (!currentTrack) handlePlayTrack(t);
            else {
              setQueue(q => {
                const newQ = [...q];
                newQ.splice(queueIndex + 1, 0, { ...t, isUserAdded: true });
                return newQ;
              });
            }
          }}
          onAddToPlaylist={async (playlistId, track) => {
            try {
              const res = await fetch(`${API_BASE_URL}/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ track_id: track.id, title: track.title, artist: track.artist, cover_art: track.coverArt })
              });
              if (res.ok) {
                // Toast notification could go here
              }
            } catch (e) { console.error(e); }
          }}
          onCreatePlaylist={async (name) => {
            try {
              const res = await fetch(`${API_BASE_URL}/playlists/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name })
              });
              if (res.ok) fetchPlaylists();
            } catch (e) { console.error(e); }
          }}
        />
      )}

      <div className="animate-enter floating-player">
        <Player track={currentTrack} isPlaying={isPlaying} onTogglePlay={() => handlePlayTrack(currentTrack)} progress={progress} duration={duration} onSeek={(t) => playerRef.current?.seekTo(t, true)} volume={volume} onVolumeChange={setVolume} onNext={playNext} onPrev={playPrev} onShuffle={() => setIsShuffle(!isShuffle)} onRepeat={() => setIsRepeat(!isRepeat)} isShuffle={isShuffle} isRepeat={isRepeat} onOpenQueue={() => setIsQueueOpen(!isQueueOpen)} onOpenLyrics={() => setIsPlayerExpanded(true)} onExpandPlayer={() => setIsSidebarWidgetOpen(prev => !prev)} />
      </div>

      {isPlayerExpanded && (
        <ExpandedPlayer currentTrack={currentTrack} isPlaying={isPlaying} progress={progress} duration={duration} onTogglePlay={() => handlePlayTrack(currentTrack)} onNext={playNext} onPrev={playPrev} onSeek={(t) => playerRef.current?.seekTo(t, true)} onClose={() => setIsPlayerExpanded(false)} isShuffle={isShuffle} isRepeat={isRepeat} onShuffle={() => setIsShuffle(!isShuffle)} onRepeat={() => setIsRepeat(!isRepeat)} />
      )}

      {isQueueOpen && (
        <>
          <div onClick={() => setIsQueueOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', backgroundColor: 'rgba(30,30,35,0.98)', backdropFilter: 'blur(20px)',
            borderLeft: '1px solid var(--border-glass)', zIndex: 1000, animation: 'slideLeft 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
          }}>
            <style>{`@keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px 0 0' }}>
               <button onClick={() => setIsQueueOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <QueueView queue={queue} queueIndex={queueIndex} currentTrack={currentTrack} isPlaying={isPlaying} onPlayTrack={handlePlayTrack} removeFromQueue={(idx) => setQueue(q => q.filter((_, i) => i !== idx))} reorderQueue={(s, d) => setQueue(q => { const n = [...q]; const [r] = n.splice(s, 1); n.splice(d, 0, r); return n; })} isAutoplay={isAutoplay} setIsAutoplay={setIsAutoplay} />
          </div>
        </>
      )}

      <div className="app-bottom-nav">
        <div onClick={() => { window.history.pushState(null, '', '#discover'); setActiveTab('discover'); }} style={{ color: activeTab === 'discover' ? '#1ed760' : 'var(--text-muted)' }}><Home size={24} /></div>
        <div onClick={() => { window.history.pushState(null, '', '#search'); setActiveTab('search'); }} style={{ color: activeTab === 'search' ? '#1ed760' : 'var(--text-muted)' }}><Search size={24} /></div>
        <div onClick={() => { window.history.pushState(null, '', '#library'); setActiveTab('library'); }} style={{ color: activeTab === 'library' || activeTab === 'favorites' ? '#1ed760' : 'var(--text-muted)' }}><Library size={24} /></div>
      </div>

      <YoutubePlayerManager onReady={handleYoutubeReady} onStateChange={handleYoutubeStateChange} onError={handleYoutubeError} />

      {!token && (
        <AuthModal onLoginSuccess={(newToken) => setToken(newToken)} />
      )}
    </div>
  );
}

export default App;
