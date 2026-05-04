import { useState, useEffect } from 'react';
import { Search, Play, Pause, Loader2, Heart, Plus } from 'lucide-react';

const MOCK_CATEGORIES = ['All', 'Songs', 'Artists', 'Albums', 'Playlists', 'Podcasts'];

const MOCK_RESULTS = [
  {
    id: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    artist: 'Lofi Girl',
    coverArt: 'https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg'
  },
  {
    id: 'K4DyBUG242c',
    title: 'Cartoon - On & On (feat. Daniel Levi) [NCS Release]',
    artist: 'NoCopyrightSounds',
    coverArt: 'https://i.ytimg.com/vi/K4DyBUG242c/maxresdefault.jpg'
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
    artist: 'Rick Astley',
    coverArt: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  },
  {
    id: '4xDzrUhVKVA',
    title: 'Synthwave Radio - Beats to chill/game to',
    artist: 'Lofi Girl',
    coverArt: 'https://i.ytimg.com/vi/4xDzrUhVKVA/maxresdefault.jpg'
  }
];

const SearchView = ({ currentTrack, isPlaying: globalIsPlaying, onPlayTrack, globalQuery, setGlobalQuery, onNavigate, searchCache, setSearchCache, onAddToQueue, likedSongs, toggleLike }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [songResults, setSongResults] = useState(MOCK_RESULTS);
  const [artistResults, setArtistResults] = useState([]);
  const [albumResults, setAlbumResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Helper to decode HTML entities from YouTube API
  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  useEffect(() => {
    if (!globalQuery.trim()) {
      setSongResults(MOCK_RESULTS);
      setArtistResults([]);
      setAlbumResults([]);
      return;
    }

    const cacheKey = `${globalQuery}-${activeCategory}`;

    // Check unbounded dictionary cache
    if (searchCache[cacheKey] && searchCache[cacheKey].songResults.length > 0) {
      setSongResults(searchCache[cacheKey].songResults);
      setArtistResults(searchCache[cacheKey].artistResults);
      setAlbumResults(searchCache[cacheKey].albumResults);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      
      // Update browser history for deep linking/back button IF not already there
      const newHash = `#search?q=${encodeURIComponent(globalQuery)}`;
      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', newHash);
      }

      try {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        const q = encodeURIComponent(globalQuery);

        let albumPromise = Promise.resolve([]);
        let finalAlbums = [];

        // 3. Albums Fetch
        if (activeCategory === 'All' || activeCategory === 'Albums' || activeCategory === 'Playlists') {
          const albumQ = encodeURIComponent(globalQuery + " album");
          albumPromise = fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${albumQ}&type=playlist&key=${apiKey}`)
            .then(res => res.json())
            .then(data => data.items ? data.items.map(item => ({
              id: item.id.playlistId, type: 'album',
              title: decodeHTML(item.snippet.title),
              artist: decodeHTML(item.snippet.channelTitle),
              coverArt: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url
            })) : [])
            .then(res => { setAlbumResults(res); finalAlbums = res; return res; });
        } else { setAlbumResults([]); }

        // 1. Songs Fetch
        let songItems = [];
        let finalSongs = [];
        if (activeCategory === 'All' || activeCategory === 'Songs' || activeCategory === 'Artists' || activeCategory === 'Profiles') {
          const isSpecific = /live|cover|karaoke|instrumental|audio|official/i.test(globalQuery);
          const searchQ = encodeURIComponent(globalQuery + (isSpecific ? '' : ' official audio'));
          const res = await fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${searchQ}&type=video&videoCategoryId=10&key=${apiKey}`);
          const data = await res.json();
          songItems = data.items || [];
          
          if (activeCategory === 'All' || activeCategory === 'Songs') {
            const rawSongs = songItems.map(item => ({
              id: item.id.videoId, type: 'song',
              title: decodeHTML(item.snippet.title),
              artist: decodeHTML(item.snippet.channelTitle),
              artistId: item.snippet.channelId,
              coverArt: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url
            }));

            // Deduplicate based on cleaned title to prevent multiple identical versions
            const seenTitles = new Set();
            finalSongs = [];
            for (const track of rawSongs) {
              const cleanTitle = track.title.toLowerCase()
                .replace(/\(.*?\)/g, '')
                .replace(/\[.*?\]/g, '')
                .replace(/official|video|lyrics|audio|music|live/gi, '')
                .replace(/[^a-z0-9]/g, '');
              
              if (!seenTitles.has(cleanTitle) && cleanTitle.length > 0) {
                seenTitles.add(cleanTitle);
                finalSongs.push(track);
              }
            }
            if (finalSongs.length === 0) finalSongs = rawSongs;

            setSongResults(finalSongs);
          } else { setSongResults([]); }
        } else { setSongResults([]); }

        // 2. Artists Fetch
        let finalArtists = [];
        if (activeCategory === 'All' || activeCategory === 'Artists' || activeCategory === 'Profiles') {
           const uniqueChannelIds = [...new Set(songItems.slice(0, 12).map(item => item.snippet.channelId))].slice(0, 6);
           
           if (uniqueChannelIds.length > 0) {
             const channelRes = await fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${uniqueChannelIds.join(',')}&key=${apiKey}`);
             const channelData = await channelRes.json();
             
             if (channelData.items) {
               finalArtists = channelData.items.map(item => ({
                 id: item.id, type: 'artist',
                 title: decodeHTML(item.snippet.title),
                 coverArt: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url
               }));
               setArtistResults(finalArtists);
             } else { setArtistResults([]); }
           } else { setArtistResults([]); }
        } else { setArtistResults([]); }

        await albumPromise;

        // Save to unbounded dictionary cache
        setSearchCache(prev => ({
          ...prev,
          [cacheKey]: {
            songResults: finalSongs,
            artistResults: finalArtists,
            albumResults: finalAlbums
          }
        }));

      } catch (err) {
        console.error("YouTube Search failed", err);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [globalQuery, activeCategory]);

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px', paddingBottom: '60px' }}>
      
      {/* Category Pills */}
      <div className="category-pills" style={{ 
        display: 'flex', 
        gap: '12px', 
        overflowX: 'auto', 
        paddingTop: '16px',
        paddingBottom: '16px', 
        marginBottom: '24px',
        position: 'sticky',
        top: '88px', // Clearance for the App.jsx header
        zIndex: 9,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid rgba(255,255,255,0.02)'
      }}>
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
          {globalQuery.trim() ? `Search results for "${globalQuery}"` : 'Browse all'}
        </h2>
        {isSearching && <Loader2 className="animate-spin" size={20} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />}
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .list-row:hover { background-color: rgba(255,255,255,0.1); }
        .list-row:hover .row-play-btn { opacity: 1 !important; }
      `}</style>

      {songResults.length > 0 ? (
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Top Result Column */}
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Top result</h2>
            <div 
              onClick={() => onPlayTrack(songResults[0], [songResults[0]])}
              onMouseEnter={(e) => {
                e.currentTarget.querySelector('.play-btn-circle').style.opacity = '1';
                e.currentTarget.querySelector('.play-btn-circle').style.transform = 'translateY(0)';
              }}
              onMouseLeave={(e) => {
                const isTopActive = currentTrack?.id === songResults[0].id;
                e.currentTarget.querySelector('.play-btn-circle').style.opacity = isTopActive ? '1' : '0';
                e.currentTarget.querySelector('.play-btn-circle').style.transform = isTopActive ? 'translateY(0)' : 'translateY(8px)';
              }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
            >
              <img 
                src={songResults[0].coverArt} 
                alt={songResults[0].title}
                style={{ width: '92px', height: '92px', borderRadius: '4px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
              />
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', display: '-webkit-box', letterSpacing: '-1px' }}>
                  {songResults[0].title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '700' }}>Song</span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (songResults[0].artistId) {
                        onNavigate('artist', { id: songResults[0].artistId, title: songResults[0].artist, coverArt: songResults[0].coverArt });
                      }
                    }}
                    style={{ fontSize: '14px', color: 'var(--text-main)', cursor: songResults[0].artistId ? 'pointer' : 'default' }}
                    onMouseOver={(e) => songResults[0].artistId && (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {songResults[0].artist}
                  </span>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div 
                className="play-btn-circle"
                style={{
                  position: 'absolute',
                  right: '20px',
                  bottom: '20px',
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  backgroundColor: '#1ed760',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                  opacity: currentTrack?.id === songResults[0].id ? '1' : '0',
                  transform: currentTrack?.id === songResults[0].id ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
              >
                {(currentTrack?.id === songResults[0].id && globalIsPlaying) ? (
                   <Pause fill="black" color="black" size={24} />
                ) : (
                   <Play fill="black" color="black" size={24} style={{ marginLeft: '2px' }}/>
                )}
              </div>
            </div>
          </div>

          {/* List Results Column */}
          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>Songs</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {songResults.slice(1, 5).map(track => {
                const isThisTrackActive = currentTrack?.id === track.id;
                const isTrackPlaying = isThisTrackActive && globalIsPlaying;

                return (
                  <div 
                    key={track.id}
                    className="list-row"
                    onClick={() => onPlayTrack(track, [track])}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      gap: '16px'
                    }}
                  >
                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                      <img 
                        src={track.coverArt} 
                        alt={track.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div 
                        className="row-play-btn"
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0, bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: isThisTrackActive ? 1 : 0,
                          transition: 'opacity 0.2s ease'
                        }}
                      >
                        {isTrackPlaying ? (
                          <Pause fill="white" color="white" size={16} />
                        ) : (
                          <Play fill="white" color="white" size={16} style={{ marginLeft: '2px' }}/>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                      <span title={track.title} style={{ fontSize: '15px', fontWeight: isThisTrackActive ? '600' : '500', color: isThisTrackActive ? '#1ed760' : 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {track.title}
                      </span>
                      <span 
                        title={track.artist} 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (track.artistId) {
                            onNavigate('artist', { id: track.artistId, title: track.artist, coverArt: track.coverArt });
                          }
                        }}
                        style={{ fontSize: '14px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: track.artistId ? 'pointer' : 'default' }}
                        onMouseOver={(e) => track.artistId && (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {track.artist}
                      </span>
                    </div>
                    <div className="row-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div onClick={(e) => { e.stopPropagation(); toggleLike(track); }} style={{ cursor: 'pointer', padding: '4px', opacity: 0.7 }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7}>
                        <Heart size={16} fill={(likedSongs || []).some(t => t.id === track.id) ? '#1ed760' : 'none'} color={(likedSongs || []).some(t => t.id === track.id) ? '#1ed760' : 'var(--text-muted)'} />
                      </div>
                      <div onClick={(e) => { e.stopPropagation(); onAddToQueue(track); }} style={{ cursor: 'pointer', padding: '4px', opacity: 0.7 }} onMouseOver={e=>e.currentTarget.style.opacity=1} onMouseOut={e=>e.currentTarget.style.opacity=0.7}>
                        <Plus size={18} color="var(--text-muted)" />
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>3:45</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        activeCategory === 'Songs' && !isSearching && <div style={{ color: 'var(--text-muted)' }}>No songs found</div>
      )}

      {/* More Results Grid */}
      {songResults.length > 5 && (
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>More songs</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            {songResults.slice(5).map(track => {
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
                  onClick={() => onPlayTrack(track, [track])}
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
                        backgroundColor: '#1ed760',
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
                    <h3 title={track.title} style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {track.title}
                    </h3>
                    <p 
                      title={track.artist} 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (track.artistId) {
                          onNavigate('artist', { id: track.artistId, title: track.artist, coverArt: track.coverArt });
                        }
                      }}
                      style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: track.artistId ? 'pointer' : 'default', margin: 0 }}
                      onMouseOver={(e) => track.artistId && (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {track.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Artists Row */}
      {artistResults.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Artists</h2>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px' }}>
            {artistResults.map(artist => (
              <div 
                key={artist.id}
                className="premium-card"
                onClick={() => onNavigate('artist', artist)}
                style={{
                  minWidth: '200px', maxWidth: '200px', padding: '16px', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)', transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
              >
                <img src={artist.coverArt} alt={artist.title} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artist.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Artist</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Albums Row */}
      {albumResults.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Albums & Playlists</h2>
          <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '24px' }}>
            {albumResults.map(album => (
              <div 
                key={album.id}
                className="premium-card"
                onClick={() => onNavigate('album', album)}
                style={{
                  minWidth: '200px', maxWidth: '200px', padding: '16px', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)', transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
              >
                <img src={album.coverArt} alt={album.title} style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', objectFit: 'cover', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{album.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default SearchView;
