import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Square, RotateCcw, RotateCw, Download, Share2, Settings,
  ZoomIn, ZoomOut, Scissors, Type, Palette, Volume2, Sparkles, Wand2,
  Layers, Clock, FileVideo, Image, Music, FolderOpen, Search, Filter,
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Grid, List, Eye,
  Trash2, Copy, Edit2, Plus, Lock, VolumeX, EyeOff, GripVertical,
  MessageSquare, Users, Save, Upload, RefreshCw, Target, Zap, Star,
  Heart, Zap as Lightning, Palette as ColorPalette, Sparkles as Magic,
  ChevronDown, Camera, Monitor, Link, Cloud, X
} from 'lucide-react';

// Stunning Purple Color Palette - Ultra Modern & Futuristic
const COLORS = {
  // Primary - Rich Royal Purples
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  // Secondary - Vibrant Electric Purples
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  // Accent - Soft Lavender Purples
  accent: {
    50: '#f8f7ff',
    100: '#f0eeff',
    200: '#e6e3ff',
    300: '#d1ccff',
    400: '#b8a9ff',
    500: '#9f7aff',
    600: '#8b5cf6',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },
  // Success - Purple-tinted Greens
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // Warning - Purple-tinted Oranges
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  // Danger - Purple-tinted Reds
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Neutral - Purple-tinted Grays
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Enhanced gradient colors for ultra-stunning purple effects
  gradients: {
    // Royal Purple - Deep purple to light
    royal: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #a855f7 50%, #c084fc 75%, #e9d5ff 100%)',
    
    // Cosmic Purple - Purple to blue to purple
    cosmic: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #3b82f6 50%, #7c3aed 75%, #a855f7 100%)',
    
    // Aurora Purple - Purple to pink to purple
    aurora: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #ec4899 50%, #d946ef 75%, #a855f7 100%)',
    
    // Sunset Purple - Purple to orange to purple
    sunset: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #f59e0b 50%, #f97316 75%, #a855f7 100%)',
    
    // Electric Purple - Purple to cyan to purple
    storm: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #06b6d4 50%, #22d3ee 75%, #a855f7 100%)',
    
    // Midnight Purple - Deep purple to black
    galaxy: 'linear-gradient(135deg, #581c87 0%, #4c1d95 25%, #3730a3 50%, #1e1b4b 75%, #0f172a 100%)',
    
    // Tropical Purple - Purple to green to purple
    tropical: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #10b981 50%, #34d399 75%, #a855f7 100%)',
    
    // Neon Purple - Pink to purple to blue
    neon: 'linear-gradient(135deg, #ec4899 0%, #d946ef 25%, #a855f7 50%, #7c3aed 75%, #3b82f6 100%)',
    
    // Golden Purple - Purple to yellow to purple
    golden: 'linear-gradient(135deg, #581c87 0%, #7c3aed 25%, #fbbf24 50%, #fde68a 75%, #a855f7 100%)',
    
    // Arctic Purple - White to purple to blue
    arctic: 'linear-gradient(135deg, #f8fafc 0%, #e9d5ff 25%, #a855f7 50%, #7c3aed 75%, #3b82f6 100%)',
    
    // Lavender Dream - Soft purple variations
    lavender: 'linear-gradient(135deg, #f8f7ff 0%, #e6e3ff 25%, #d1ccff 50%, #b8a9ff 75%, #9f7aff 100%)',
    
    // Deep Purple - Rich dark purples
    deep: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #3730a3 50%, #4c1d95 75%, #581c87 100%)'
  }
};

// Enhanced AI Effect Presets with Stunning Purple Colors
const AI_PRESETS = [
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', color: COLORS.primary[500], gradient: COLORS.gradients.royal, description: 'Hollywood-style dramatic lighting' },
  { id: 'anime', name: 'Anime Style', icon: '🌸', color: COLORS.secondary[500], gradient: COLORS.gradients.neon, description: 'Japanese animation aesthetics' },
  { id: 'pixar', name: 'Pixar Style', icon: '🎭', color: COLORS.warning[500], gradient: COLORS.gradients.golden, description: '3D animated film quality' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', color: COLORS.accent[500], gradient: COLORS.gradients.storm, description: 'Futuristic neon aesthetics' },
  { id: 'hyperreal', name: 'Hyper-Realistic', icon: '🔍', color: COLORS.secondary[600], gradient: COLORS.gradients.cosmic, description: 'Photorealistic rendering' },
  { id: 'watercolor', name: 'Watercolor', icon: '🎨', color: COLORS.danger[500], gradient: COLORS.gradients.sunset, description: 'Artistic paint effects' },
  { id: 'cosmic', name: 'Cosmic', icon: '🌌', color: COLORS.primary[400], gradient: COLORS.gradients.galaxy, description: 'Space and galaxy themes' },
  { id: 'aurora', name: 'Aurora', icon: '✨', color: COLORS.accent[400], gradient: COLORS.gradients.aurora, description: 'Northern lights effect' },
  { id: 'tropical', name: 'Tropical', icon: '🌴', color: COLORS.success[500], gradient: COLORS.gradients.tropical, description: 'Vibrant island vibes' },
  { id: 'arctic', name: 'Arctic', icon: '❄️', color: COLORS.accent[300], gradient: COLORS.gradients.arctic, description: 'Cool ice and snow' },
  { id: 'lavender', name: 'Lavender', icon: '💜', color: COLORS.accent[500], gradient: COLORS.gradients.lavender, description: 'Soft dreamy vibes' },
  { id: 'deep', name: 'Deep Purple', icon: '🟣', color: COLORS.primary[800], gradient: COLORS.gradients.deep, description: 'Rich dark aesthetics' }
];

// Enhanced Timeline Tracks with Stunning Purple Colors
const TIMELINE_TRACKS = [
  { id: 'video', name: 'Video', type: 'video', color: COLORS.primary[500], icon: '🎬', gradient: COLORS.gradients.royal },
  { id: 'audio', name: 'Audio', type: 'audio', color: COLORS.success[500], icon: '🎵', gradient: COLORS.gradients.aurora },
  { id: 'effects', name: 'Effects', type: 'effects', color: COLORS.warning[500], icon: '✨', gradient: COLORS.gradients.golden },
  { id: 'subtitles', name: 'Subtitles', type: 'text', color: COLORS.secondary[500], icon: '💬', gradient: COLORS.gradients.neon },
];

// Enhanced Particle system with purple color scheme
const ParticleSystem = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Floating orbs with enhanced animations and purple colors */}
    <motion.div 
      className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl"
      style={{ background: COLORS.gradients.royal }}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.25, 0.1],
        x: [0, 30, 0],
        y: [0, -30, 0],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    <motion.div 
      className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
      style={{ background: COLORS.gradients.cosmic }}
      animate={{ 
        scale: [1, 1.4, 1],
        opacity: [0.1, 0.3, 0.1],
        x: [0, -40, 0],
        y: [0, 40, 0],
        rotate: [0, -180, -360]
      }}
      transition={{ 
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 3
      }}
    />
    <motion.div 
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
      style={{ background: COLORS.gradients.galaxy }}
      animate={{ 
        scale: [1, 1.15, 1],
        opacity: [0.05, 0.2, 0.05],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    
    {/* Additional floating particles with purple colors */}
    {Array.from({ length: 20 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: i % 4 === 0 ? COLORS.gradients.neon : 
                     i % 4 === 1 ? COLORS.gradients.aurora : 
                     i % 4 === 2 ? COLORS.gradients.lavender :
                     COLORS.gradients.storm
        }}
        animate={{
          y: [0, -120, 0],
          opacity: [0, 0.8, 0],
          scale: [0, 1.5, 0],
          x: [0, Math.random() * 40 - 20, 0]
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut"
        }}
      />
    ))}
    
    {/* Enhanced light rays with purple theme */}
    {Array.from({ length: 8 }, (_, i) => (
      <motion.div
        key={`ray-${i}`}
        className="absolute w-1 h-32 rounded-full opacity-20"
        style={{
          left: `${(i * 12.5) + 6.25}%`,
          top: '-10%',
          background: COLORS.gradients.arctic,
          transform: `rotate(${i * 45}deg)`
        }}
        animate={{
          opacity: [0.2, 0.6, 0.2],
          scaleY: [1, 1.5, 1]
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
    
    {/* Purple floating orbs */}
    {Array.from({ length: 6 }, (_, i) => (
      <motion.div
        key={`orb-${i}`}
        className="absolute w-4 h-4 rounded-full opacity-40"
        style={{
          left: `${20 + (i * 15)}%`,
          top: `${30 + (i * 10)}%`,
          background: COLORS.gradients.lavender
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.4, 0.8, 0.4],
          scale: [1, 1.3, 1]
        }}
        transition={{
          duration: 4 + i,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.5
        }}
      />
    ))}
  </div>
);

const AdvancedEditor = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(29);
  const [zoom, setZoom] = useState(1);
  const [selectedTool, setSelectedTool] = useState('select');
  const [activePreset, setActivePreset] = useState(null);
  const [showAI, setShowAI] = useState(true);
  const [showLibrary, setShowLibrary] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState('single');
  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [exportQuality, setExportQuality] = useState('4k');
  const [showExportModal, setShowExportModal] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const timelineRef = useRef(null);

  // Enhanced mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Playback controls with enhanced functionality
  const togglePlayback = () => setIsPlaying(!isPlaying);
  const seekTo = (time) => setCurrentTime(Math.max(0, Math.min(duration, time)));
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced AI Generation with better feedback
  const generateScene = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setUndoStack(prev => [...prev, { type: 'ai_generate', prompt: aiPrompt }]);
  };

  // Export functionality
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
        case 'Delete':
          // Handle delete functionality
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Handle undo
          }
          break;
        case 'y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Handle redo
          }
          break;
        case 'Escape':
          setShowExportModal(false);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden relative">
      {/* Enhanced Animated Background Elements */}
      <ParticleSystem />

      {/* Enhanced Top Toolbar - Glassmorphism Design */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-20 bg-white/5 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-8 relative z-10"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        {/* Left - Enhanced Logo & Project Info */}
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="relative">
              <motion.div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ background: COLORS.gradients.cosmic }}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: '0 25px 50px rgba(124, 58, 237, 0.4)'
                }}
                animate={{
                  boxShadow: [
                    '0 20px 40px rgba(124, 58, 237, 0.3)',
                    '0 25px 50px rgba(124, 58, 237, 0.4)',
                    '0 20px 40px rgba(124, 58, 237, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <motion.div 
                className="absolute -inset-1 rounded-2xl blur opacity-30"
                style={{ background: COLORS.gradients.cosmic }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div>
              <motion.h1 
                className="text-white font-bold text-2xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                whileHover={{ 
                  background: 'linear-gradient(90deg, #ffffff 0%, #22d3ee 50%, #ffffff 100%)',
                  backgroundClip: 'text'
                }}
              >
                Lumen Anima
              </motion.h1>
              <motion.p 
                className="text-white/60 text-sm"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI-Powered Animation Studio
              </motion.p>
            </div>
          </motion.div>
          
          <div className="h-12 w-px bg-gradient-to-b from-white/20 to-transparent" />
          
          <div className="flex items-center gap-3">
            <motion.div 
              className="px-4 py-2 bg-white/10 rounded-xl border border-white/20 cursor-pointer"
              whileHover={{ 
                background: 'rgba(255,255,255,0.15)',
                borderColor: 'rgba(255,255,255,0.4)',
                scale: 1.02
              }}
            >
              <span className="text-white/80 text-sm">Untitled Project</span>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 15 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200"
            >
              <Star className="w-4 h-4 text-warning-400" />
            </motion.button>
          </div>
        </div>

        {/* Center - Enhanced Playback Controls */}
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5 text-white/80" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          >
            <RotateCw className="w-5 h-5 text-white/80" />
          </motion.button>
          
          <motion.button 
            onClick={togglePlayback}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-primary-500/25 relative overflow-hidden"
            style={{ background: COLORS.gradients.royal }}
          >
            {/* Enhanced button glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            {isPlaying ? <Pause className="w-8 h-8 text-white relative z-10" /> : <Play className="w-8 h-8 text-white relative z-10" />}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          >
            <Square className="w-5 h-5 text-white/80" />
          </motion.button>
        </div>

        {/* Right - Enhanced Export & Settings */}
        <div className="flex items-center gap-4">
          <motion.button 
            onClick={handleExport}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-2xl hover:shadow-success-500/25 flex items-center gap-3 relative overflow-hidden"
            style={{ background: COLORS.gradients.aurora }}
          >
            {/* Enhanced button glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <Download className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Export</span>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200"
          >
            <Share2 className="w-5 h-5 text-white/80" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200"
          >
            <Settings className="w-5 h-5 text-white/80" />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Left Sidebar - Media Library */}
        {showLibrary && (
          <motion.div
            initial={{ x: -360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-80 flex flex-col relative z-10 border-r border-white/10 backdrop-blur-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              boxShadow: '4px 0 32px 0 rgba(0, 0, 0, 0.37)'
            }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Media Library</h3>
              <motion.button
                onClick={() => setShowLibrary(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-red-500/25 group"
              >
                <X className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors duration-200" />
              </motion.button>
            </div>

            {/* Search Bar */}
            <div className="relative px-6 py-4 border-b border-white/10 bg-white/5">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search media..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-200"
              />
            </div>

            {/* Import & Drag-and-Drop */}
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <motion.button
                onClick={() => document.getElementById('file-upload')?.click()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 mb-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-semibold rounded-xl shadow-lg border border-primary-500/40 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Import Media
              </motion.button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  console.log('Files imported:', files);
                }}
              />
              <div
                className="mt-2 border-2 border-dashed border-primary-500/30 rounded-xl p-4 text-center bg-primary-500/5 hover:bg-primary-500/10 transition-colors duration-200 cursor-pointer"
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-secondary-500', 'bg-secondary-500/10'); }}
                onDragLeave={e => { e.currentTarget.classList.remove('border-secondary-500', 'bg-secondary-500/10'); }}
                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-secondary-500', 'bg-secondary-500/10');
                  const files = Array.from(e.dataTransfer.files);
                  console.log('Files dropped:', files);
                }}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                <p className="text-white/70 text-sm mb-1">Drag & drop files here</p>
                <p className="text-white/40 text-xs">or click to browse</p>
                <p className="text-white/30 text-xs mt-2">Supports: MP4, MOV, MP3, WAV, JPG, PNG, SVG</p>
              </div>
            </div>

            {/* Media Categories */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 bg-white/5">
              {/* Video Clips */}
              <div>
                <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2"><FileVideo className="w-4 h-4 text-primary-400" /> Video Clips</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[{ name: 'Sample Video 1', type: 'video', info: 'MP4 • 15s' }, { name: 'Sample Video 2', type: 'video', info: 'MP4 • 30s' }].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.03, boxShadow: '0 0 16px #a855f7' }}
                      className="p-3 bg-white/10 rounded-xl border border-white/10 hover:border-primary-500 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col gap-1"
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => e.dataTransfer.setData('text/plain', JSON.stringify(item))}
                    >
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-white/50 text-xs">{item.info}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Audio & Music */}
              <div>
                <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2"><Music className="w-4 h-4 text-success-400" /> Audio & Music</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[{ name: 'Background Music', type: 'audio', info: 'MP3 • 2:30' }, { name: 'Sound Effect', type: 'audio', info: 'WAV • 5s' }].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.03, boxShadow: '0 0 16px #22c55e' }}
                      className="p-3 bg-white/10 rounded-xl border border-white/10 hover:border-success-500 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col gap-1"
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => e.dataTransfer.setData('text/plain', JSON.stringify(item))}
                    >
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-white/50 text-xs">{item.info}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Images & Graphics */}
              <div>
                <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2"><Image className="w-4 h-4 text-accent-400" /> Images & Graphics</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[{ name: 'Logo.png', type: 'image', info: 'PNG • 512x512' }, { name: 'Background.jpg', type: 'image', info: 'JPG • 1920x1080' }].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.03, boxShadow: '0 0 16px #9f7aff' }}
                      className="p-3 bg-white/10 rounded-xl border border-white/10 hover:border-accent-500 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col gap-1"
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => e.dataTransfer.setData('text/plain', JSON.stringify(item))}
                    >
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-white/50 text-xs">{item.info}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* AI Assets */}
              <div>
                <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-secondary-400" /> AI Assets</h4>
                <div className="grid grid-cols-1 gap-3">
                  {[{ name: 'AI Character', type: 'ai', info: 'Ready-to-use' }, { name: 'AI Background', type: 'ai', info: 'Generated' }].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.03, boxShadow: '0 0 16px #d946ef' }}
                      className="p-3 bg-white/10 rounded-xl border border-white/10 hover:border-secondary-500 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col gap-1"
                      draggable
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => e.dataTransfer.setData('text/plain', JSON.stringify(item))}
                    >
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-white/50 text-xs">{item.info}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Left Sidebar Toggle Button - Shows when Media Library is hidden */}
        {!showLibrary && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed left-0 top-1/2 transform -translate-y-1/2 z-20"
          >
            <motion.button
              onClick={() => setShowLibrary(true)}
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-r-xl border border-white/20 border-l-0 backdrop-blur-sm transition-all duration-200 shadow-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.2) 0%, rgba(255,255,255,0.1) 100%)'
              }}
            >
              <ChevronRight className="w-5 h-5 text-white/80" />
            </motion.button>
          </motion.div>
        )}

        {/* Center - Canvas & Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Canvas Area */}
          <div className="flex-1 relative bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden">
            {/* Canvas Controls */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
              <motion.button 
                onClick={() => setViewMode('single')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all duration-200 ${viewMode === 'single' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40' : 'bg-white/10 text-white/60 hover:text-white border border-white/20'}`}
              >
                <Maximize2 className="w-5 h-5" />
              </motion.button>
              <motion.button 
                onClick={() => setViewMode('split')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all duration-200 ${viewMode === 'split' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40' : 'bg-white/10 text-white/60 hover:text-white border border-white/20'}`}
              >
                <Grid className="w-5 h-5" />
              </motion.button>
              <div className="h-8 w-px bg-white/20" />
              <motion.button 
                onClick={() => setShowGrid(!showGrid)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all duration-200 ${showGrid ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40' : 'bg-white/10 text-white/60 hover:text-white border border-white/20'}`}
              >
                <Grid className="w-5 h-5" />
              </motion.button>
              <motion.button 
                onClick={() => setShowGuides(!showGuides)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl transition-all duration-200 ${showGuides ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40' : 'bg-white/10 text-white/60 hover:text-white border border-white/20'}`}
              >
                <Target className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Canvas */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                {/* Grid Overlay */}
                {showGrid && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                )}
                
                {/* Enhanced Preview Window */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative w-[500px] h-[320px] bg-black rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden"
                  style={{
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {/* Enhanced background with new gradients */}
                  <div className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${COLORS.gradients.cosmic} 0%, transparent 50%), radial-gradient(circle at 70% 70%, ${COLORS.gradients.royal} 0%, transparent 50%)`
                    }}
                  >
                    <div className="text-center relative z-10">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                          <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{ background: COLORS.gradients.lavender }}
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </motion.div>
                      <p className="text-white/80 text-lg font-medium mb-2">AI Animation Preview</p>
                      <p className="text-white/60 text-sm">Your creation will appear here</p>
                      
                      {/* Enhanced floating elements */}
                      <motion.div
                        className="absolute top-4 left-4 w-3 h-3 rounded-full"
                        style={{ background: COLORS.gradients.sunset }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute top-8 right-8 w-2 h-2 rounded-full"
                        style={{ background: COLORS.gradients.aurora }}
                        animate={{
                          y: [0, 15, 0],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Enhanced Time Display */}
                  <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                    <span className="text-white text-sm font-mono font-medium">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>
                  
                  {/* Enhanced corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-white/30 rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-white/30 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-white/30 rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-white/30 rounded-br-2xl" />
                </motion.div>

                {/* Enhanced Split View */}
                {viewMode === 'split' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-0 right-0 w-80 h-64 bg-black rounded-2xl border border-white/20 ml-6 shadow-2xl overflow-hidden"
                    style={{
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: `radial-gradient(circle at 20% 80%, ${COLORS.gradients.tropical} 0%, transparent 70%)`
                      }}
                    >
                      <div className="text-center relative z-10">
                        <div className="w-12 h-12 mx-auto mb-3 relative">
                          <motion.div
                            className="absolute inset-0 rounded-xl"
                            style={{ background: COLORS.gradients.tropical }}
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.6, 1, 0.6]
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <p className="text-white/80 text-sm font-medium">Before AI</p>
                        <p className="text-white/60 text-xs mt-1">Original content</p>
                      </div>
                    </div>
                    
                    {/* Enhanced corner accents */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-white/30 rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-white/30 rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-white/30 rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-white/30 rounded-br-2xl" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-72 bg-white/5 backdrop-blur-2xl border-t border-white/10 relative z-10"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              boxShadow: '0 -8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
          >
            {/* Timeline Header with Playback Controls */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
              {/* Left - Timeline Title */}
              <div className="flex items-center gap-4">
                <h3 className="text-white font-semibold text-lg">Timeline</h3>
              </div>

              {/* Center - Playback Controls */}
              <div className="flex items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5 text-white/80" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                >
                  <RotateCcw className="w-5 h-5 text-white/80" />
                </motion.button>
                <motion.button 
                  onClick={togglePlayback}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 rounded-2xl bg-white hover:bg-white/90 transition-all duration-200 shadow-2xl"
                  style={{
                    boxShadow: '0 20px 40px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {isPlaying ? <Pause className="w-7 h-7 text-black" /> : <Play className="w-7 h-7 text-black" />}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                >
                  <RotateCw className="w-5 h-5 text-white/80" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5 text-white/80" />
                </motion.button>
              </div>

              {/* Right - Time Display */}
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                  <span className="text-white/80 text-sm font-mono font-medium">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 flex">
              {/* Timeline Ruler & Tracks */}
              <div className="flex-1 relative overflow-x-auto">
                {/* Time Ruler - 0s to 29s */}
                <div className="h-16 bg-black/30 border-b border-white/10 relative">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-r border-white/10 flex items-end pb-2"
                      style={{ left: `${(i / 29) * 100}%` }}
                    >
                      <span className="text-white/40 text-xs px-1 font-mono">{i}s</span>
                    </div>
                  ))}
                </div>

                {/* Tracks */}
                <div className="flex-1">
                  {/* Text Track - 4 sequential text elements */}
                  <div className="h-16 border-b border-white/5 relative">
                    <div className="absolute inset-0 flex items-center px-2">
                      {[
                        { start: 0, end: 3, label: 'Text 1' },
                        { start: 4, end: 7, label: 'Text 2' },
                        { start: 8, end: 11, label: 'Text 3' },
                        { start: 12, end: 15, label: 'Text 4' }
                      ].map((text, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="h-10 rounded-xl border flex items-center justify-center relative overflow-hidden absolute"
                          style={{ 
                            left: `${(text.start / 29) * 100}%`,
                            width: `${((text.end - text.start) / 29) * 100}%`,
                            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                            border: `1px solid ${COLORS.secondary[500]}40`
                          }}
                        >
                          {/* Enhanced glow effect */}
                          <motion.div
                            className="absolute inset-0 opacity-20"
                            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' }}
                            animate={{
                              opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <span className="text-white text-xs font-medium relative z-10">{text.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Audio/Video Track - Long gradient element with waveform */}
                  <div className="h-16 border-b border-white/5 relative">
                    <div className="absolute inset-0 flex items-center px-2">
                      <div className="h-10 rounded-xl border flex items-center justify-center w-full relative overflow-hidden"
                        style={{ 
                          background: 'linear-gradient(135deg, #581c87 0%, #ec4899 100%)',
                          border: `1px solid ${COLORS.primary[500]}40`
                        }}
                      >
                        {/* Enhanced glow effect */}
                        <motion.div
                          className="absolute inset-0 opacity-20"
                          style={{ background: 'linear-gradient(135deg, #581c87 0%, #ec4899 100%)' }}
                          animate={{
                            opacity: [0.2, 0.4, 0.2]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Waveform bars - concentrated from 10s to 20s */}
                        <div className="flex items-center gap-1 relative z-10 w-full justify-center">
                          {Array.from({ length: 40 }, (_, i) => {
                            // Position bars from 10s to 20s mark
                            const position = (i / 40) * 10 + 10; // 10s to 20s
                            const left = `${(position / 29) * 100}%`;
                            const height = Math.random() * 20 + 10;
                            const opacity = 0.6 + Math.random() * 0.4;
                            
                            return (
                              <div
                                key={i}
                                className="w-1 rounded-full absolute"
                                style={{ 
                                  height: `${height}px`,
                                  opacity: opacity,
                                  background: COLORS.success[400],
                                  left: left,
                                  transform: 'translateX(-50%)'
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Playhead - White line at 0s */}
                <motion.div
                  className="absolute top-0 bottom-0 w-1 z-10"
                  style={{ 
                    left: '0%',
                    background: 'white'
                  }}
                  initial={false}
                  animate={{ 
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full shadow-2xl"
                    style={{ background: 'white' }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Bottom Timeline Controls */}
            <div className="h-12 flex items-center justify-between px-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200"
                >
                  <ZoomOut className="w-4 h-4 text-white/60" />
                </motion.button>
                <span className="text-white/60 text-sm font-medium px-3">{Math.round(zoom * 100)}%</span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200"
                >
                  <ZoomIn className="w-4 h-4 text-white/60" />
                </motion.button>
              </div>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200"
                >
                  <Maximize2 className="w-4 h-4 text-white/60" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - AI Controls */}
        {showAI && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-96 bg-white/5 backdrop-blur-2xl border-l border-white/10 flex flex-col relative z-10"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              boxShadow: '-4px 0 32px 0 rgba(0, 0, 0, 0.37)'
            }}
          >
            {/* AI Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  className="text-white font-semibold text-lg flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  AI Controls
                </motion.h3>
                <motion.button 
                  onClick={() => setShowAI(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </motion.button>
              </div>
            </div>

            {/* AI Prompt */}
            <div className="p-6 border-b border-white/10">
              <label className="block text-white/80 text-sm font-medium mb-3">Text-to-Animation Prompt</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your animation scene..."
                className="w-full h-24 p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-none transition-all duration-200"
              />
              <motion.button
                onClick={generateScene}
                disabled={isGenerating || !aiPrompt.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl"
                style={{
                  boxShadow: '0 20px 40px rgba(14, 165, 233, 0.3)'
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightning className="w-5 h-5" />
                    Generate Scene
                  </>
                )}
              </motion.button>
            </div>

            {/* Enhanced AI Presets */}
            <div className="p-6 border-b border-white/10">
              <h4 className="text-white/80 text-sm font-medium mb-4">AI Style Presets</h4>
              <div className="grid grid-cols-2 gap-3">
                {AI_PRESETS.map((preset) => (
                  <motion.button
                    key={preset.id}
                    onClick={() => setActivePreset(preset.id)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden ${
                      activePreset === preset.id
                        ? 'border-primary-500 bg-primary-500/20 text-primary-400 shadow-lg'
                        : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:text-white hover:bg-white/10'
                    }`}
                    style={{
                      boxShadow: activePreset === preset.id ? '0 10px 30px rgba(14, 165, 233, 0.3)' : 'none'
                    }}
                  >
                    {/* Enhanced preset glow effect */}
                    {activePreset === preset.id && (
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        style={{ background: preset.gradient }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    
                    <span className="text-2xl relative z-10">{preset.icon}</span>
                    <div className="text-center relative z-10">
                      <span className="text-sm font-medium block">{preset.name}</span>
                      <span className="text-xs opacity-70 block mt-1">{preset.description}</span>
                    </div>
                    
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0"
                      style={{ background: preset.gradient }}
                      whileHover={{ opacity: 0.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Enhanced AI Tools */}
            <div className="p-6 border-b border-white/10">
              <h4 className="text-white/80 text-sm font-medium mb-4">AI Tools</h4>
              <div className="space-y-3">
                {[
                  { icon: MessageSquare, name: 'Auto Subtitles', desc: 'Generate subtitles from audio', color: COLORS.primary[500], gradient: COLORS.gradients.royal },
                  { icon: Users, name: 'Voice Generation', desc: 'AI voice-over with emotions', color: COLORS.secondary[500], gradient: COLORS.gradients.neon },
                  { icon: Music, name: 'Background Music', desc: 'AI-generated mood music', color: COLORS.success[500], gradient: COLORS.gradients.aurora },
                  { icon: Wand2, name: 'Smart Effects', desc: 'Auto-apply cinematic effects', color: COLORS.warning[500], gradient: COLORS.gradients.golden },
                ].map((tool) => (
                  <motion.button
                    key={tool.name}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 text-left relative overflow-hidden group"
                  >
                    {/* Enhanced tool glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0"
                      style={{ background: tool.gradient }}
                      whileHover={{ opacity: 0.05 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <motion.div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                        style={{ background: tool.color + '20', border: `1px solid ${tool.color}40` }}
                      >
                        <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                      </motion.div>
                      <div>
                        <p className="text-white text-sm font-medium">{tool.name}</p>
                        <p className="text-white/40 text-xs">{tool.desc}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="p-6">
              <h4 className="text-white/80 text-sm font-medium mb-4">Quick Actions</h4>
              <div className="space-y-3">
                {[
                  { icon: Save, name: 'Save Preset', color: COLORS.success[500], gradient: COLORS.gradients.aurora },
                  { icon: Upload, name: 'Export Settings', color: COLORS.primary[500], gradient: COLORS.gradients.royal },
                  { icon: Share2, name: 'Share Project', color: COLORS.secondary[500], gradient: COLORS.gradients.neon },
                ].map((action) => (
                  <motion.button
                    key={action.name}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/80 hover:text-white text-sm transition-all duration-200 flex items-center gap-3 relative overflow-hidden group"
                  >
                    {/* Enhanced action glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0"
                      style={{ background: action.gradient }}
                      whileHover={{ opacity: 0.05 }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    <motion.div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 relative z-10"
                      style={{ background: action.color + '20', border: `1px solid ${action.color}40` }}
                    >
                      <action.icon className="w-4 h-4" style={{ color: action.color }} />
                    </motion.div>
                    <span className="relative z-10">{action.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Right Sidebar Toggle Button - Shows when AI Controls are hidden */}
        {!showAI && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed right-0 top-1/2 transform -translate-y-1/2 z-20"
          >
            <motion.button
              onClick={() => setShowAI(true)}
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-l-xl border border-white/20 border-r-0 backdrop-blur-sm transition-all duration-200 shadow-lg"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(168, 85, 247, 0.2) 100%)'
              }}
            >
              <ChevronLeft className="w-5 h-5 text-white/80" />
            </motion.button>
          </motion.div>
        )}

        {/* Help Panel - Shows when both sidebars are hidden */}
        {!showLibrary && !showAI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-center max-w-md"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(255,255,255,0.05) 100%)'
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: COLORS.gradients.cosmic }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Welcome to Advanced Editor!</h3>
              <p className="text-white/70 text-sm mb-4">
                Use the toggle buttons on the left and right edges to access the Media Library and AI Controls panels.
              </p>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Left edge: Media Library with draggable assets</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Right edge: AI Controls and effects</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span>Drag media from Library to Timeline tracks</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Bottom Toolbar with Purple Theme */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="h-16 bg-white/5 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-8 relative z-10"
        style={{
          background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.08) 0%, rgba(255,255,255,0.05) 50%, rgba(168, 85, 247, 0.08) 100%)',
          boxShadow: '0 -8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        <div className="flex items-center gap-6">
          <motion.button 
            onClick={() => setShowLibrary(!showLibrary)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              showLibrary ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/10 text-white/60 hover:text-white border border-white/20'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-sm font-medium">Library</span>
          </motion.button>
          <motion.button 
            onClick={() => setShowAI(!showAI)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
              showAI ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/10 text-white/60 hover:text-white border border-white/20'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">AI Tools</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-white/60 text-sm font-medium">Ctrl+S to save</span>
          <span className="text-white/60 text-sm font-medium">Space to play/pause</span>
          <span className="text-white/60 text-sm font-medium">Del to delete</span>
        </div>
      </motion.div>

      {/* Enhanced Export Modal with Purple Theme */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-neutral-800 rounded-3xl border border-white/20 p-8 w-[480px] shadow-2xl relative overflow-hidden"
              style={{
                boxShadow: '0 50px 100px rgba(0, 0, 0, 0.8)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced background with purple gradient */}
              <div className="absolute inset-0 opacity-10"
                style={{ background: COLORS.gradients.cosmic }}
              />
              
              <div className="text-center mb-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: COLORS.gradients.aurora }}
                >
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-2">Export Video</h3>
                <p className="text-white/60">Choose your export quality and format</p>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-3">Quality</label>
                  <select
                    value={exportQuality}
                    onChange={(e) => setExportQuality(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  >
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="4k">4K Ultra HD</option>
                    <option value="8k">8K Ultra HD</option>
                  </select>
                </div>
                
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setShowExportModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all duration-200 border border-white/20"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => setShowExportModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-2xl"
                    style={{ background: COLORS.gradients.aurora }}
                  >
                    Export Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedEditor;