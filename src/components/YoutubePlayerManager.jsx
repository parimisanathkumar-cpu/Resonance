import YouTube from 'react-youtube';
import React, { memo } from 'react';

const YOUTUBE_OPTS = {
  height: '200',
  width: '200',
  playerVars: {
    autoplay: 0,
    controls: 0,
    disablekb: 1,
    fs: 0,
    iv_load_policy: 3,
    rel: 0,
    origin: window.location.origin,
  },
};

const YoutubePlayerManager = memo(({ onReady, onStateChange, onError }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      width: '200px',
      height: '200px',
      zIndex: -1000,
      opacity: 0.1, // Increased from 0.01 to avoid potential WebView video-omission crashes
      pointerEvents: 'none'
    }}>
      <YouTube
        videoId="jfKfPfyJRdk" // Placeholder video
        opts={YOUTUBE_OPTS}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
      />
    </div>
  );
});

export default YoutubePlayerManager;
