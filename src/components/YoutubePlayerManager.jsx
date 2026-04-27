import YouTube from 'react-youtube';

const YoutubePlayerManager = ({ track, onReady, onStateChange }) => {
  if (!track) return null;

  const opts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1, // Automatically play when ID changes
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      rel: 0,
    },
  };

  return (
    <div style={{ position: 'absolute', left: '-9999px', width: '0', height: '0', overflow: 'hidden' }}>
      <YouTube
        videoId={track.id}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
      />
    </div>
  );
};

export default YoutubePlayerManager;
