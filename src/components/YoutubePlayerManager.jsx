import YouTube from 'react-youtube';

const YoutubePlayerManager = ({ onReady, onStateChange, onError }) => {
  const opts = {
    height: '200',
    width: '200',
    playerVars: {
      autoplay: 0, // Do NOT autoplay the placeholder
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      rel: 0,
      origin: window.location.origin,
    },
  };

  return (
    <div style={{ position: 'fixed', bottom: '10px', right: '10px', width: '200px', height: '200px', zIndex: -1000, opacity: 0.01, pointerEvents: 'none' }}>
      <YouTube
        videoId="jfKfPfyJRdk" // Placeholder video
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
      />
    </div>
  );
};

export default YoutubePlayerManager;
