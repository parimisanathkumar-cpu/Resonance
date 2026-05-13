import { Compass, Library, FolderHeart, Search as SearchIcon, Disc3, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, playlists = [], onTabChange, onSignOut }) => {
  const containerStyle = {
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: 'var(--text-main)',
  };

  const logoStyle = {
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
    fontWeight: '600',
    letterSpacing: '-0.5px'
  };

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--text-muted)',
    fontWeight: '500',
    fontSize: '14px'
  };

  const activeNavItemStyle = {
    ...navItemStyle,
    color: 'var(--text-main)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
  };

  const sectionDivider = {
    height: '1px',
    backgroundColor: 'var(--border-glass)',
    margin: '24px 12px'
  };

  return (
    <div style={containerStyle} className="app-sidebar">
      <div style={logoStyle} className="mobile-hide">
        <Disc3 size={24} color="var(--text-main)" />
        <span>Resonance</span>
      </div>

      <div 
        style={activeTab === 'discover' ? activeNavItemStyle : navItemStyle}
        className="mobile-nav-item"
        onClick={() => onTabChange('discover')}
        onMouseEnter={(e) => activeTab !== 'discover' && (e.currentTarget.style.color = 'var(--text-main)')} 
        onMouseLeave={(e) => activeTab !== 'discover' && (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <Compass size={20} strokeWidth={1.5} />
        <span className="mobile-nav-text">Discover</span>
      </div>
      <div 
        style={activeTab === 'search' ? activeNavItemStyle : navItemStyle}
        className="mobile-nav-item"
        onClick={() => onTabChange('search')}
        onMouseEnter={(e) => activeTab !== 'search' && (e.currentTarget.style.color = 'var(--text-main)')} 
        onMouseLeave={(e) => activeTab !== 'search' && (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <SearchIcon size={20} strokeWidth={1.5} />
        <span className="mobile-nav-text">Search</span>
      </div>

      <div style={sectionDivider} className="mobile-hide" />
      
      <div 
        style={activeTab === 'library' ? activeNavItemStyle : navItemStyle} 
        className="mobile-nav-item"
        onClick={() => onTabChange('library')}
        onMouseEnter={(e) => activeTab !== 'library' && (e.currentTarget.style.color = 'var(--text-main)')} 
        onMouseLeave={(e) => activeTab !== 'library' && (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <Library size={20} strokeWidth={1.5} />
        <span className="mobile-nav-text">Library</span>
      </div>
      <div 
        style={activeTab === 'favorites' ? activeNavItemStyle : navItemStyle} 
        className="mobile-nav-item"
        onClick={() => onTabChange('favorites')}
        onMouseEnter={(e) => activeTab !== 'favorites' && (e.currentTarget.style.color = 'var(--text-main)')} 
        onMouseLeave={(e) => activeTab !== 'favorites' && (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <FolderHeart size={20} strokeWidth={1.5} />
        <span className="mobile-nav-text">Favorites</span>
      </div>

      {playlists && playlists.length > 0 && (
        <div className="mobile-hide" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '24px 12px 8px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
            Your Playlists
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
            {[...playlists].sort((a, b) => (b.tracks?.length || 0) - (a.tracks?.length || 0)).slice(0, 8).map(p => (
              <div 
                key={p.id}
                style={activeTab === `playlist-${p.id}` ? activeNavItemStyle : { ...navItemStyle, padding: '8px 12px' }}
                onClick={() => onTabChange('playlist', { id: p.id, title: p.name })}
                onMouseEnter={(e) => activeTab !== `playlist-${p.id}` && (e.currentTarget.style.color = 'var(--text-main)')} 
                onMouseLeave={(e) => activeTab !== `playlist-${p.id}` && (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div style={{ flexGrow: playlists && playlists.length > 0 ? 0 : 1, marginTop: 'auto' }} className="mobile-hide" />
      <div 
        style={navItemStyle} 
        className="mobile-hide"
        onClick={onSignOut}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#e74c3c')} 
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <LogOut size={20} strokeWidth={1.5} />
        <span>Sign Out</span>
      </div>
    </div>
  );
};

export default Sidebar;
