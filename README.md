# 🎵 Resonance - Music Player Application

A modern, feature-rich music player application built with React and Vite, powered by YouTube's vast music library. Stream your favorite music with a beautiful, intuitive interface designed for seamless music discovery and playback.

---

## 📋 Table of Contents

- [Features Implemented](#-features-implemented)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Integration](#-api-integration)
- [Future Roadmap](#-future-roadmap)
- [Development](#-development)

---

## ✨ Features Implemented

### Core Player Functionality

- **🎬 YouTube Video Integration** - Seamless playback of music videos from YouTube
- **▶️ Playback Controls** - Play, pause, skip forward/backward, seek to any position
- **🔊 Volume Control** - Adjustable volume with visual feedback
- **⏱️ Progress Tracking** - Real-time progress bar with current time and duration display
- **🎚️ Shuffle & Repeat Modes** - Shuffle entire queue or repeat single track/playlist
- **📱 Media Session API** - Hardware media controls support (play/pause/skip on device buttons)

### Queue Management

- **📝 Dynamic Queue System** - Add, remove, and reorder tracks in queue
- **🎯 Autoplay** - Automatically fetch and play related videos when queue ends
- **🔄 Smart Shuffle** - Random track selection with proper queue management
- **📊 Queue View** - Visual queue display with drag-and-drop reordering (ready for implementation)

### Discovery & Search

- **🔍 Real-time Search** - Live search suggestions powered by YouTube API
- **💡 Smart Search Suggestions** - Auto-complete suggestions as you type with thumbnail previews
- **🎯 Trending Tracks** - Discover popular music from YouTube Charts
- **📚 Curated Playlists** - Browse curated music playlists
- **⏱️ Search Caching** - Optimized search performance with result caching

### Artist & Album Views

- **👤 Artist Profile** - View artist information with their top tracks
- **💿 Album Details** - Browse albums with track listings
- **🖼️ Visual Metadata** - Cover art and album artwork display
- **📑 Context Navigation** - Easy navigation between related artists and albums

### User Library & Personalization

- **❤️ Favorites/Liked Songs** - Save and manage your favorite tracks
- **📋 Playlist Management** - Create, view, and manage custom playlists
- **📚 Library View** - Centralized view of all your saved content
- **🔐 User Authentication** - Secure login and session management via JWT
- **💾 Persistent Storage** - Backend sync for all saved content

### Lyrics Display

- **📝 Real-time Lyrics** - Display song lyrics synchronized with playback
- **⏱️ Progress Sync** - Lyrics update as song progresses

### User Interface

- **🎨 Modern Dark Theme** - Sleek, eye-friendly dark interface with glassmorphism effects
- **📱 Responsive Design** - Optimized for desktop and mobile devices
- **⌨️ Hash-based Routing** - Client-side navigation with browser history support
- **🎯 Intuitive Layout** - Sidebar navigation with bottom player bar
- **✨ Smooth Animations** - Elegant transitions and hover effects

### Mobile Support

- **📱 Capacitor Integration** - Native Android app wrapper
- **🔄 Cross-platform Ready** - Foundation for iOS and web platforms
- **🎯 Touch Optimized** - Touch-friendly interface for mobile devices

---

## 🛠️ Tech Stack

### Frontend

- **React 18.3.1** - UI library for building interactive components
- **Vite 5.4.10** - Lightning-fast build tool and dev server
- **Lucide React 1.11.0** - Beautiful, consistent icon library
- **React YouTube 10.1.0** - React wrapper for YouTube IFrame Player API

### Backend Integration

- **Django REST API** - Custom backend for user authentication and data persistence
- **JWT Authentication** - Secure token-based authentication
- **Firebase/Database** - User data and playlist storage (backend managed)

### Mobile

- **Capacitor 6.2.1** - Cross-platform native runtime for web apps
- **Android Support** - Native Android application wrapper

### Development Tools

- **ESLint 9.13.0** - Code quality and style enforcement
- **React Refresh** - Fast refresh for development
- **TypeScript Ready** - Type-safe development configuration

### APIs

- **YouTube Data API v3** - Music search, recommendations, trending videos
- **Media Session API** - Hardware media controls integration

---

## 📁 Project Structure

```
resonance/
├── src/
│   ├── components/
│   │   ├── Player.jsx              # Main playback controls component
│   │   ├── MainView.jsx            # Home/discovery view
│   │   ├── SearchView.jsx          # Search and results display
│   │   ├── ArtistView.jsx          # Artist profile view
│   │   ├── AlbumView.jsx           # Album details view
│   │   ├── QueueView.jsx           # Queue management view
│   │   ├── FavoritesView.jsx       # Liked songs view
│   │   ├── LyricsView.jsx          # Song lyrics display
│   │   ├── LibraryView.jsx         # User library overview
│   │   ├── PlaylistView.jsx        # Individual playlist view
│   │   ├── PlaylistModal.jsx       # Add to playlist dialog
│   │   ├── AuthModal.jsx           # Login/authentication modal
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── MainView.jsx            # Main content area
│   │   └── YoutubePlayerManager.jsx # YouTube player wrapper
│   ├── App.jsx                     # Root component with state management
│   ├── main.jsx                    # React DOM entry point
│   ├── App.css                     # Global styles
│   ├── index.css                   # Base styles
│   └── assets/                     # Static assets
├── android/                        # Capacitor Android project
├── public/                         # Static files
├── vite.config.js                  # Vite configuration
├── eslint.config.js                # ESLint rules
├── package.json                    # Dependencies and scripts
├── .env.example                    # Environment variables template
└── README.md                       # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **YouTube API Key** - Get one from [Google Cloud Console](https://console.cloud.google.com/)
- **Backend Server** - Django backend running on `localhost:8000`

### Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd resonance
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Update `.env.local` with your credentials**
   ```env
   VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# YouTube API Configuration
VITE_YOUTUBE_API_KEY=your_youtube_data_api_v3_key

# Backend API
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AUTH_TOKEN_KEY=token

# App Configuration
VITE_APP_NAME=Resonance
VITE_APP_VERSION=1.0.0
```

**Getting YouTube API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create API credentials (API key)
5. Copy the key to your `.env.local`

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

---

## 🔌 API Integration

### Backend Endpoints

#### User Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile

#### Favorites Management

- `GET /api/favorites/` - Get all liked songs
- `POST /api/favorites/` - Add track to favorites
- `DELETE /api/favorites/{track_id}` - Remove from favorites

#### Playlist Management

- `GET /api/playlists/` - Get all user playlists
- `POST /api/playlists/` - Create new playlist
- `GET /api/playlists/{id}/` - Get playlist details
- `POST /api/playlists/{id}/add-track/` - Add track to playlist
- `DELETE /api/playlists/{id}/remove-track/` - Remove track from playlist

#### External APIs

- **YouTube Search** - Real-time search suggestions
- **YouTube Video Details** - Metadata, duration, thumbnails
- **YouTube Related Videos** - Autoplay recommendations

---

## 🗓️ Future Roadmap

### Phase 2: Enhanced Features (Q3 2026)

- [ ] **Social Features**
  - Share playlists with friends
  - Collaborative playlist creation
  - Follow artists and users
  - User activity feed

- **Advanced Playback**
  - Gapless playback between tracks
  - Audio visualization during playback
  - EQ and audio effects
  - Bit-rate selection

- **Content Discovery**
  - Personalized recommendations algorithm
  - Genre-based filtering
  - Mood-based playlists
  - Podcast support integration

### Phase 3: Mobile & Desktop Apps (Q4 2026)

- [ ] **Native Mobile Apps**
  - iOS app via Capacitor
  - Android app refinement and optimization
  - Offline download capability
  - Push notifications

- **Desktop Applications**
  - Electron app for Windows/macOS/Linux
  - System tray controls
  - Desktop notifications
  - Keyboard shortcuts

### Phase 4: Advanced Features (Q1 2027)

- [ ] **Premium Features**
  - Ad-free listening
  - High-quality audio streaming
  - Unlimited downloads
  - Extended library access

- **Analytics & Stats**
  - Listening statistics dashboard
  - Year-end "Wrapped" style reports
  - Playback history timeline
  - Most-played tracks/artists

### Phase 5: Ecosystem Integration (Q2 2027)

- [ ] **Third-party Integrations**
  - Spotify integration (import playlists)
  - Apple Music connectivity
  - Last.fm scrobbling
  - Discord presence

- **Smart Features**
  - Voice command support
  - AI-powered playlist generation
  - Smart shuffle based on mood/energy
  - Time-based contextual recommendations

### Phase 6: Community & Social (Q3 2027)

- [ ] **Community Features**
  - User profiles with public playlists
  - Music recommendation marketplace
  - Community-curated playlists
  - Live listening events

---

## 🔐 Authentication & Security

- **JWT Tokens** - Secure token-based authentication
- **Secure Storage** - Tokens stored in browser localStorage
- **HTTPS** - All API calls use HTTPS in production
- **CORS** - Configured for secure cross-origin requests
- **Session Management** - Automatic logout on token expiration

---

## 🎯 Key Achievements

### ✅ Completed Milestones

- ✓ Core music player with YouTube integration
- ✓ Queue management system with shuffle and repeat
- ✓ Search functionality with suggestions and caching
- ✓ User authentication and authorization
- ✓ Favorites and playlist management
- ✓ Artist and album views
- ✓ Lyrics display component
- ✓ Mobile-first responsive design
- ✓ Hardware media controls support
- ✓ Android app initialization with Capacitor

---

## 💻 Development

### Code Style

- ESLint configuration for React best practices
- Consistent code formatting
- Component-based architecture
- React Hooks for state management

### Performance Optimization

- Search result caching to reduce API calls
- Debounced search input (400ms)
- Lazy loading of playlists and tracks
- Efficient re-rendering with useCallback
- CSS-in-JS for optimized styling

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browser support (iOS Safari, Chrome Mobile)
- Graceful fallbacks for older browsers

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🐛 Known Issues

- None currently reported

---

## 📞 Support & Contact

For issues, feature requests, or questions:

- Open an issue on GitHub
- Check existing issues for similar problems
- Review the documentation

---

## 🎉 Acknowledgments

- YouTube Data API for music search and streaming
- React community for excellent tools and libraries
- Capacitor team for mobile integration
- All contributors and users

---

**Last Updated:** May 12, 2026  
**Version:** 1.0.0 (MVP)  
**Status:** Active Development

```
Made with ❤️ for music lovers
```
