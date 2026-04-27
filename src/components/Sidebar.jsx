import { Compass, Library, FolderHeart, Search as SearchIcon, Disc3 } from 'lucide-react';

const Sidebar = ({ activeTab, onTabChange }) => {
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
    <div style={containerStyle}>
      <div style={logoStyle}>
        <Disc3 size={24} color="var(--text-main)" />
        <span>Resonance</span>
      </div>

      <div 
        style={activeTab === 'discover' ? activeNavItemStyle : navItemStyle}
        onClick={() => onTabChange('discover')}
        onMouseEnter={(e) => activeTab !== 'discover' && (e.currentTarget.style.color = 'var(--text-main)')} 
        onMouseLeave={(e) => activeTab !== 'discover' && (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <Compass size={20} strokeWidth={1.5} />
        <span>Discover</span>
      </div>
      <div 
        style={activeTab === 'search' ? activeNavItemStyle : navItemStyle}
        onClick={() => onTabChange('search')}
        onMouseEnter={(e) => activeTab !== 'search' && (e.currentTarget.style.color = 'var(--text-main)')} 
        onMouseLeave={(e) => activeTab !== 'search' && (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <SearchIcon size={20} strokeWidth={1.5} />
        <span>Search</span>
      </div>

      <div style={sectionDivider} />
      
      <div style={navItemStyle} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
        <Library size={20} strokeWidth={1.5} />
        <span>Library</span>
      </div>
      <div style={navItemStyle} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
        <FolderHeart size={20} strokeWidth={1.5} />
        <span>Favorites</span>
      </div>
      
    </div>
  );
};

export default Sidebar;
