import React, { useState } from 'react';
import { Play, Pause, Trash2, GripVertical, Radio } from 'lucide-react';

const QueueView = ({ 
  queue, 
  queueIndex, 
  currentTrack, 
  isPlaying, 
  onPlayTrack, 
  removeFromQueue, 
  reorderQueue,
  isAutoplay,
  setIsAutoplay
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Split queue into Next Up
  const nextUp = queue.slice(queueIndex + 1);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetRelativeIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    // Convert relative indices back to absolute queue indices
    const absoluteSourceIndex = queueIndex + 1 + draggedIndex;
    const absoluteTargetIndex = queueIndex + 1 + targetRelativeIndex;
    
    if (absoluteSourceIndex !== absoluteTargetIndex) {
      reorderQueue(absoluteSourceIndex, absoluteTargetIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px', paddingBottom: '100px', overflowY: 'auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px' }}>Queue</h1>

      {/* Now Playing */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-muted)' }}>Now Playing</h2>
      {currentTrack ? (
        <div style={{
          display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '8px', marginBottom: '32px'
        }}>
          <img src={currentTrack.coverArt} alt="cover" style={{ width: '48px', height: '48px', borderRadius: '4px', marginRight: '16px', objectFit: 'cover' }} />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#1ed760' }}>{currentTrack.title}</span>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{currentTrack.artist}</span>
          </div>
          {isPlaying ? <Pause color="#1ed760" size={20} /> : <Play color="#1ed760" size={20} />}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>No track is currently playing.</div>
      )}

      {/* Autoplay / Radio Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-muted)' }}>Next Up</h2>
        <div 
          onClick={() => setIsAutoplay(!isAutoplay)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            padding: '6px 12px', borderRadius: '16px', backgroundColor: isAutoplay ? 'rgba(30, 215, 96, 0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isAutoplay ? 'rgba(30, 215, 96, 0.3)' : 'transparent'}`,
            transition: 'all 0.2s'
          }}
        >
          <Radio size={16} color={isAutoplay ? '#1ed760' : 'var(--text-muted)'} />
          <span style={{ fontSize: '13px', fontWeight: '600', color: isAutoplay ? '#1ed760' : 'var(--text-muted)' }}>
            Autoplay {isAutoplay ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      {/* Next Up List */}
      {nextUp.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {nextUp.map((track, relativeIdx) => (
            <div
              key={track.id + relativeIdx}
              draggable
              onDragStart={(e) => handleDragStart(e, relativeIdx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, relativeIdx)}
              onDrop={(e) => handleDrop(e, relativeIdx)}
              style={{
                display: 'flex', alignItems: 'center', padding: '8px 16px', borderRadius: '4px',
                backgroundColor: draggedIndex === relativeIdx ? 'rgba(255,255,255,0.1)' : 'transparent',
                cursor: 'grab', transition: 'background-color 0.2s', borderBottom: '1px solid rgba(255,255,255,0.02)'
              }}
              onMouseOver={(e) => {
                if (draggedIndex === null) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onMouseOut={(e) => {
                if (draggedIndex === null) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <GripVertical size={16} color="var(--text-muted)" style={{ marginRight: '16px', cursor: 'grab' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '16px' }}>
                <img src={track.coverArt} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} alt="cover" />
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '15px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</span>
                </div>
              </div>

              <div 
                onClick={(e) => { e.stopPropagation(); removeFromQueue(queueIndex + 1 + relativeIdx); }}
                style={{ cursor: 'pointer', padding: '8px', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#ff4444'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Trash2 size={16} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', padding: '24px 0', fontSize: '14px' }}>
          {isAutoplay ? 'When the queue ends, Resonance will automatically play similar tracks.' : 'The queue is currently empty.'}
        </div>
      )}
    </div>
  );
};

export default QueueView;
