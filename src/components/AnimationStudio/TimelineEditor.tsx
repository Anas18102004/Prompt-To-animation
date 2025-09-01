import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ZoomIn, ZoomOut, MoreVertical, Trash2, Copy, Edit2, Plus, Lock, Volume2, Eye } from 'lucide-react';

const DEFAULT_TRACKS = [
  { id: 'logo', name: 'Logo', color: '#3b82f6', icon: '🌀', mute: false, lock: false, solo: false },
  { id: 'title', name: 'Title Text', color: '#a21caf', icon: '🔤', mute: false, lock: false, solo: false },
  { id: 'particles', name: 'Particles', color: '#f59e42', icon: '✨', mute: false, lock: false, solo: false },
  { id: 'bg', name: 'Background', color: '#64748b', icon: '🖼️', mute: false, lock: false, solo: false },
];

const INITIAL_KEYFRAMES = {
  logo:    [0.1, 1.2, 2.5],
  title:   [0.5, 1.5, 2.2],
  particles: [0.3, 1.0, 2.8],
  bg:      [0.0, 2.0],
};

const TIMELINE_LENGTH = 3; // seconds
const FPS = 60;
const GRID_STEP = 0.1; // seconds
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

function secondsToPx(sec, zoom) {
  return sec * 200 * zoom;
}

const TimelineEditor = ({
  animationData,
  onChange,
  ...props
}) => {
  const [zoom, setZoom] = useState(1);
  const [scroll, setScroll] = useState(0);
  const [tracks, setTracks] = useState(DEFAULT_TRACKS);
  const [keyframes, setKeyframes] = useState(INITIAL_KEYFRAMES);
  const [selected, setSelected] = useState([]); // [{track, idx}]
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [clipboard, setClipboard] = useState(null);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // {type, trackId, idx, x, y}
  const timelineRef = useRef(null);
  const dragging = useRef(null);

  // Multi-select logic
  const isSelected = (trackId, idx) => selected.some(sel => sel.track === trackId && sel.idx === idx);
  const handleKeyframeClick = (trackId, idx, e) => {
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setSelected(sel => {
        if (isSelected(trackId, idx)) {
          return sel.filter(s => !(s.track === trackId && s.idx === idx));
        } else {
          return [...sel, { track: trackId, idx }];
        }
      });
    } else {
      setSelected([{ track: trackId, idx }]);
    }
  };

  // Group drag logic
  const onKeyframeDragStart = (trackId, idx, e) => {
    if (!isSelected(trackId, idx)) setSelected([{ track: trackId, idx }]);
    dragging.current = {
      selected: selected.length ? selected : [{ track: trackId, idx }],
      startX: e.clientX,
      orig: selected.length ? selected.map(s => keyframes[s.track][s.idx]) : [keyframes[trackId][idx]],
    };
    document.body.style.cursor = 'grabbing';
  };
  const onKeyframeDrag = (e) => {
    if (!dragging.current) return;
    const { selected: sel, startX, orig } = dragging.current;
    const deltaPx = e.clientX - startX;
    const deltaSec = deltaPx / (200 * zoom);
    setKeyframes(prev => {
      const next = { ...prev };
      sel.forEach((s, i) => {
        let newTime = Math.max(0, Math.min(TIMELINE_LENGTH, orig[i] + deltaSec));
        newTime = Math.round(newTime / GRID_STEP) * GRID_STEP;
        const arr = [...next[s.track]];
        arr[s.idx] = newTime;
        arr.sort((a, b) => a - b);
        next[s.track] = arr;
      });
      return next;
    });
  };
  const onKeyframeDragEnd = () => {
    dragging.current = null;
    document.body.style.cursor = '';
  };

  // Context menu logic
  const handleKeyframeContextMenu = (trackId, idx, e) => {
    e.preventDefault();
    setContextMenu({ type: 'keyframe', trackId, idx, x: e.clientX, y: e.clientY });
  };
  const handleTrackContextMenu = (trackId, e) => {
    e.preventDefault();
    setContextMenu({ type: 'track', trackId, x: e.clientX, y: e.clientY });
  };
  const closeContextMenu = () => setContextMenu(null);

  // Context menu actions
  const handleContextAction = (action) => {
    if (!contextMenu) return;
    if (contextMenu.type === 'keyframe') {
      const { trackId, idx } = contextMenu;
      if (action === 'delete') {
        setUndoStack(stack => [...stack, { keyframes, tracks }]);
        setKeyframes(prev => ({
          ...prev,
          [trackId]: prev[trackId].filter((_, i) => i !== idx)
        }));
        setSelected(sel => sel.filter(s => !(s.track === trackId && s.idx === idx)));
      } else if (action === 'duplicate') {
        setUndoStack(stack => [...stack, { keyframes, tracks }]);
        setKeyframes(prev => {
          const arr = [...prev[trackId]];
          arr.splice(idx + 1, 0, arr[idx] + 0.05); // duplicate with slight offset
          return { ...prev, [trackId]: arr };
        });
      } else if (action === 'edit') {
        const newValue = parseFloat(prompt('Set keyframe time (seconds):', keyframes[trackId][idx]));
        if (!isNaN(newValue)) {
          setUndoStack(stack => [...stack, { keyframes, tracks }]);
          setKeyframes(prev => {
            const arr = [...prev[trackId]];
            arr[idx] = Math.max(0, Math.min(TIMELINE_LENGTH, newValue));
            arr.sort((a, b) => a - b);
            return { ...prev, [trackId]: arr };
          });
        }
      }
    } else if (contextMenu.type === 'track') {
      const { trackId } = contextMenu;
      if (action === 'add-keyframe') {
        setUndoStack(stack => [...stack, { keyframes, tracks }]);
        setKeyframes(prev => ({
          ...prev,
          [trackId]: [...prev[trackId], TIMELINE_LENGTH / 2]
        }));
      } else if (action === 'delete-track') {
        setUndoStack(stack => [...stack, { keyframes, tracks }]);
        setKeyframes(prev => {
          const next = { ...prev };
          delete next[trackId];
          return next;
        });
        // Remove from TRACKS (scaffold: not dynamic yet)
      } else if (action === 'rename-track') {
        const newName = prompt('Rename track:', tracks.find(t => t.id === trackId)?.name || '');
        if (newName) {
          setUndoStack(stack => [...stack, { keyframes, tracks }]);
          setTracks(tracks => tracks.map(t => t.id === trackId ? { ...t, name: newName } : t));
        }
      }
    }
    closeContextMenu();
  };

  // Zoom logic
  const handleZoom = (dir) => {
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + dir)));
  };

  // Playback logic
  React.useEffect(() => {
    if (!isPlaying) return;
    let raf;
    const start = performance.now() - playhead * 1000;
    const step = (now) => {
      const t = Math.min(TIMELINE_LENGTH, (now - start) / 1000);
      setPlayhead(t);
      if (t < TIMELINE_LENGTH) raf = requestAnimationFrame(step);
      else setIsPlaying(false);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [isPlaying]);

  // --- Keyboard Shortcuts ---
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected.length) {
        setUndoStack(stack => [...stack, { keyframes, tracks }]);
        setKeyframes(prev => {
          const next = { ...prev };
          selected.forEach(sel => {
            next[sel.track] = next[sel.track].filter((_, i) => i !== sel.idx);
          });
          return next;
        });
        setSelected([]);
        e.preventDefault();
      }
      // Copy
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selected.length) {
        setClipboard(selected.map(sel => ({ ...sel, time: keyframes[sel.track][sel.idx] })));
        e.preventDefault();
      }
      // Paste
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && clipboard) {
        setUndoStack(stack => [...stack, { keyframes, tracks }]);
        setKeyframes(prev => {
          const next = { ...prev };
          clipboard.forEach(({ track, time }) => {
            next[track] = [...next[track], Math.min(time + 0.1, TIMELINE_LENGTH)];
          });
          return next;
        });
        e.preventDefault();
      }
      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        setRedoStack(stack => [...stack, { keyframes, tracks }]);
        setUndoStack(stack => {
          if (!stack.length) return stack;
          const last = stack[stack.length - 1];
          setKeyframes(last.keyframes);
          setTracks(last.tracks);
          return stack.slice(0, -1);
        });
        e.preventDefault();
      }
      // Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        setUndoStack(stack => [...stack, { keyframes, tracks }]);
        setRedoStack(stack => {
          if (!stack.length) return stack;
          const last = stack[stack.length - 1];
          setKeyframes(last.keyframes);
          setTracks(last.tracks);
          return stack.slice(0, -1);
        });
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, keyframes, tracks, clipboard]);

  // --- Dynamic Track Controls ---
  const addTrack = () => {
    const newId = `track${Date.now()}`;
    setUndoStack(stack => [...stack, { keyframes, tracks }]);
    setTracks(tracks => [...tracks, { id: newId, name: 'New Track', color: '#38bdf8', icon: '🎬', mute: false, lock: false, solo: false }]);
    setKeyframes(kf => ({ ...kf, [newId]: [] }));
  };
  const removeTrack = (trackId) => {
    setUndoStack(stack => [...stack, { keyframes, tracks }]);
    setTracks(tracks => tracks.filter(t => t.id !== trackId));
    setKeyframes(kf => {
      const next = { ...kf };
      delete next[trackId];
      return next;
    });
    setSelected(sel => sel.filter(s => s.track !== trackId));
  };
  const toggleTrackState = (trackId, key) => {
    setUndoStack(stack => [...stack, { keyframes, tracks }]);
    setTracks(tracks => tracks.map(t => t.id === trackId ? { ...t, [key]: !t[key] } : t));
  };
  // Reorder tracks (scaffold: drag-and-drop UI can be added)

  // Grid lines
  const gridLines = [];
  for (let t = 0; t <= TIMELINE_LENGTH; t += GRID_STEP) {
    gridLines.push(t);
  }

  // Scrollbar logic
  const timelineWidth = secondsToPx(TIMELINE_LENGTH, zoom);
  const viewWidth = 800;
  const maxScroll = Math.max(0, timelineWidth - viewWidth);

  return (
    <div className="w-full h-[340px] bg-[#181c24] rounded-xl shadow-xl border border-[#23283a] flex flex-col relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#23283a] bg-[#181c24]/90">
        <button onClick={() => setIsPlaying((p) => !p)} className="text-white/80 hover:text-primary transition">
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <span className="text-xs text-white/60">{playhead.toFixed(2)}s</span>
        <div className="flex-1" />
        <button onClick={addTrack} className="text-white/60 hover:text-primary mx-1 flex items-center gap-1"><Plus size={16}/>Track</button>
        <button onClick={() => handleZoom(-0.5)} className="text-white/60 hover:text-primary mx-1"><ZoomOut /></button>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.1}
          value={zoom}
          onChange={e => setZoom(Number(e.target.value))}
          className="accent-primary w-32 mx-1"
        />
        <button onClick={() => handleZoom(0.5)} className="text-white/60 hover:text-primary mx-1"><ZoomIn /></button>
      </div>
      {/* Timeline */}
      <div className="flex-1 relative overflow-x-auto" style={{ background: 'linear-gradient(90deg, #23283a 1px, transparent 1px), linear-gradient(#23283a 1px, transparent 1px)', backgroundSize: `${secondsToPx(GRID_STEP, zoom)}px 100%` }}>
        <div
          ref={timelineRef}
          className="relative"
          style={{ width: timelineWidth, height: '100%' }}
          onMouseMove={e => dragging.current && onKeyframeDrag(e)}
          onMouseUp={onKeyframeDragEnd}
          onMouseLeave={onKeyframeDragEnd}
        >
          {/* Grid lines */}
          {gridLines.map((t, i) => (
            <div
              key={i}
              className="absolute top-0 left-0 h-full border-l border-dashed border-[#2c3147]"
              style={{ left: secondsToPx(t, zoom) }}
            >
              {t % 1 === 0 && (
                <span className="absolute -top-5 left-0 text-xs text-white/40">{t.toFixed(0)}s</span>
              )}
            </div>
          ))}
          {/* Playback head */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-primary/80 z-20"
            style={{ left: secondsToPx(playhead, zoom) }}
            initial={false}
            animate={{ boxShadow: '0 0 16px 2px #3b82f6' }}
          />
          {/* Tracks */}
          {tracks.map((track, ti) => (
            <div key={track.id} className="absolute left-0 right-0 flex items-center h-16 group" style={{ top: 40 + ti * 56 }} onContextMenu={e => handleTrackContextMenu(track.id, e)}>
              {/* Track label */}
              <div className="w-44 flex items-center gap-2 px-4 select-none">
                <span className="text-lg" style={{ color: track.color }}>{track.icon}</span>
                <span className="font-semibold text-white/90" style={{ color: track.color }}>{track.name}</span>
                <button className="ml-2 p-1 rounded hover:bg-muted/20 text-white/40 hover:text-primary" onClick={() => toggleTrackState(track.id, 'mute')} title="Mute"><Volume2 size={16} className={track.mute ? 'text-primary' : ''}/></button>
                <button className="ml-1 p-1 rounded hover:bg-muted/20 text-white/40 hover:text-primary" onClick={() => toggleTrackState(track.id, 'lock')} title="Lock"><Lock size={16} className={track.lock ? 'text-primary' : ''}/></button>
                <button className="ml-1 p-1 rounded hover:bg-muted/20 text-white/40 hover:text-primary" onClick={() => toggleTrackState(track.id, 'solo')} title="Solo"><Eye size={16} className={track.solo ? 'text-primary' : ''}/></button>
                <button className="ml-1 p-1 rounded hover:bg-muted/20 text-white/40 hover:text-primary" onClick={addTrack} title="Add Track"><Plus size={16}/></button>
                <button className="ml-1 p-1 rounded hover:bg-muted/20 text-white/40 hover:text-primary" onClick={() => removeTrack(track.id)} title="Delete Track"><Trash2 size={16}/></button>
              </div>
              {/* Keyframes */}
              <div className="flex-1 relative h-16">
                {keyframes[track.id].map((t, ki) => (
                  <motion.div
                    key={ki}
                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 cursor-pointer shadow-lg transition-all duration-100 ${isSelected(track.id, ki) ? 'ring-4 ring-primary/60 shadow-primary/40' : ''}`}
                    style={{
                      left: secondsToPx(t, zoom),
                      background: isSelected(track.id, ki) ? '#fff' : track.color,
                      borderColor: track.color,
                      boxShadow: isSelected(track.id, ki) ? `0 0 16px 4px ${track.color}` : `0 0 8px 2px ${track.color}80`,
                      zIndex: isSelected(track.id, ki) ? 10 : 1,
                    }}
                    onMouseDown={e => onKeyframeDragStart(track.id, ki, e)}
                    onClick={e => handleKeyframeClick(track.id, ki, e)}
                    onContextMenu={e => handleKeyframeContextMenu(track.id, ki, e)}
                  />
                ))}
              </div>
            </div>
          ))}
          {/* Context Menu */}
          {contextMenu && (
            <div
              className="fixed z-50 bg-[#23283a] border border-[#3b3f5c] rounded-lg shadow-lg py-1 min-w-[160px] text-sm text-white/90 animate-fade-in"
              style={{ left: contextMenu.x, top: contextMenu.y }}
              onMouseLeave={closeContextMenu}
            >
              {contextMenu.type === 'keyframe' ? (
                <>
                  <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-primary/10" onClick={() => handleContextAction('delete')}><Trash2 size={16}/>Delete</button>
                  <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-primary/10" onClick={() => handleContextAction('duplicate')}><Copy size={16}/>Duplicate</button>
                  <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-primary/10" onClick={() => handleContextAction('edit')}><Edit2 size={16}/>Set Value...</button>
                </>
              ) : contextMenu.type === 'track' ? (
                <>
                  <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-primary/10" onClick={() => handleContextAction('add-keyframe')}><Plus size={16}/>Add Keyframe</button>
                  <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-primary/10" onClick={() => handleContextAction('delete-track')}><Trash2 size={16}/>Delete Track</button>
                  <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-primary/10" onClick={() => handleContextAction('rename-track')}><Edit2 size={16}/>Rename Track</button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {/* Scrollbar */}
      <div className="w-full px-4 py-1 bg-[#181c24]/90 border-t border-[#23283a] flex items-center">
        <input
          type="range"
          min={0}
          max={maxScroll}
          step={1}
          value={scroll}
          onChange={e => setScroll(Number(e.target.value))}
          className="accent-primary w-full"
        />
      </div>
    </div>
  );
};

export default TimelineEditor;
