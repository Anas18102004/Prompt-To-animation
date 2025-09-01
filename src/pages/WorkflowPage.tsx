import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Play, Download, Wand2, MessageSquare, Eye, EyeOff, Lock, Unlock, GripVertical, ZoomIn, ZoomOut, Layers as LayersIcon, SlidersHorizontal, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkflowPage: React.FC = () => {
  const [leftTab, setLeftTab] = useState<'preview' | 'layers'>('preview');
  const [zoom, setZoom] = useState<number>(100);
  const [activePropTab, setActivePropTab] = useState<'properties' | 'style' | 'effects' | 'export'>('properties');
  const [layers, setLayers] = useState<Array<{ id: string; name: string; visible: boolean; locked: boolean; color: string }>>([
    { id: 'layer-1', name: 'Logo', visible: true, locked: false, color: '#60a5fa' },
    { id: 'layer-2', name: 'Title Text', visible: true, locked: false, color: '#a78bfa' },
    { id: 'layer-3', name: 'Particles', visible: true, locked: false, color: '#34d399' },
    { id: 'layer-4', name: 'Background', visible: true, locked: true, color: '#f59e0b' },
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-1');

  const toggleLayer = (id: string, key: 'visible' | 'locked') => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, [key]: !l[key] } : l));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Futuristic background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_-20%,_hsl(var(--primary)/0.15),_transparent),_radial-gradient(1000px_400px_at_90%_120%,_hsl(var(--accent)/0.18),_transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-border/20 backdrop-blur bg-background/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-1 ring-border/40">
            <Wand2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide">Advanced Editor</h1>
            <p className="text-xs text-muted-foreground">Fine-tune your animation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-xs">Docs</Button>
          <Button className="text-xs">Save</Button>
        </div>
      </header>

      {/* 3-section layout */}
      <div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-64px)]">
        {/* Left Panel - Preview */}
        <motion.div 
          className="col-span-3 rounded-xl border border-border/30 backdrop-blur-lg bg-background/60 shadow-lg overflow-hidden flex flex-col"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="px-4 pt-4 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className={`h-8 px-3 rounded-full ${leftTab==='preview'?'bg-primary/10 text-foreground':'text-muted-foreground hover:text-foreground'}`} onClick={()=>setLeftTab('preview')}>
                <Wand2 className="h-3.5 w-3.5 mr-1" /> Preview
              </Button>
              <Button variant="ghost" size="sm" className={`h-8 px-3 rounded-full ${leftTab==='layers'?'bg-primary/10 text-foreground':'text-muted-foreground hover:text-foreground'}`} onClick={()=>setLeftTab('layers')}>
                <LayersIcon className="h-3.5 w-3.5 mr-1" /> Layers
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform"><Sparkles className="h-4 w-4" /></Button>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {leftTab === 'preview' ? (
              <div className="flex-1 rounded-lg border border-border/30 bg-background/60 flex items-center justify-center shadow-inner h-full">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <Button className="gap-2 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground">
                    <Play className="h-4 w-4" /> Click Play to Preview Animation
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {layers.map(l => (
                  <div key={l.id} className={`flex items-center justify-between rounded-md border border-border/30 bg-background/70 p-2 ${selectedLayerId===l.id?'ring-1 ring-primary/40':''}`} onClick={()=>setSelectedLayerId(l.id)}>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-sm">{l.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e)=>{e.stopPropagation(); toggleLayer(l.id,'visible')}}>
                        {l.visible ? <Eye className="h-4 w-4"/> : <EyeOff className="h-4 w-4"/>}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e)=>{e.stopPropagation(); toggleLayer(l.id,'locked')}}>
                        {l.locked ? <Lock className="h-4 w-4"/> : <Unlock className="h-4 w-4"/>}
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button variant="secondary" className="h-8 px-3 rounded-full text-xs">Add Layer</Button>
                  <Button variant="ghost" className="h-8 px-3 rounded-full text-xs">Group</Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Center Panel - Timeline */}
        <motion.div 
          className="col-span-6 rounded-xl border border-border/30 backdrop-blur-lg bg-background/60 shadow-lg overflow-hidden flex flex-col"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
        >
          <div className="p-3 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
              <span className="text-xs text-muted-foreground">Drag keyframes · Zoom for precision</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={()=>setZoom(z=>Math.max(50, z-10))}><ZoomOut className="h-4 w-4"/></Button>
              <Input type="range" min={50} max={200} value={zoom} onChange={(e)=>setZoom(parseInt(e.target.value))} className="w-40"/>
              <Button variant="ghost" size="icon" onClick={()=>setZoom(z=>Math.min(200, z+10))}><ZoomIn className="h-4 w-4"/></Button>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {/* Tracks */}
            <div className="min-w-[800px]">
              {layers.map((l, row) => (
                <div key={l.id} className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-xs text-muted-foreground">{l.name}</span>
                  </div>
                  <div className="relative h-20 rounded-lg border border-border/30 bg-background/50 overflow-hidden">
                    {/* Grid controlled by zoom */}
                    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: `${Math.round(zoom/2)}px 24px` }} />
                    {/* Keyframes mock */}
                    {[12, 28, 44, 60, 76].map((lft, i) => (
                      <div key={i} className="absolute top-6" style={{ left: `${lft}%` }}>
                        <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/30 shadow-[0_0_12px_rgba(59,130,246,0.6)] cursor-grab active:cursor-grabbing hover:scale-110 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Properties & Export */}
        <motion.div 
          className="col-span-3 rounded-xl border border-border/30 backdrop-blur-lg bg-background/60 shadow-lg overflow-hidden flex flex-col"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <div className="px-4 pt-4 border-b border-border/30 flex items-center gap-2">
            {(['properties','style','effects','export'] as const).map(tab => (
              <Button key={tab} variant="ghost" size="sm" onClick={()=>setActivePropTab(tab)} className={`h-8 px-3 rounded-full ${activePropTab===tab?'bg-primary/10 text-foreground':'text-muted-foreground hover:text-foreground'}`}>
                {tab[0].toUpperCase()+tab.slice(1)}
              </Button>
            ))}
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
            {activePropTab === 'properties' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Position X</label>
                    <Input type="range" min={-500} max={500} defaultValue={0} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Position Y</label>
                    <Input type="range" min={-500} max={500} defaultValue={0} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Position Z</label>
                    <Input type="range" min={-500} max={500} defaultValue={0} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Scale</label>
                    <Input type="range" min={0} max={300} defaultValue={100} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Rotation</label>
                    <Input type="range" min={-180} max={180} defaultValue={0} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Opacity</label>
                    <Input type="range" min={0} max={100} defaultValue={100} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Easing</label>
                  <Select defaultValue="easeInOut">
                    <SelectTrigger className="bg-background/70 hover:bg-background/80 transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">linear</SelectItem>
                      <SelectItem value="easeIn">easeIn</SelectItem>
                      <SelectItem value="easeOut">easeOut</SelectItem>
                      <SelectItem value="easeInOut">easeInOut</SelectItem>
                      <SelectItem value="bounce">bounce</SelectItem>
                      <SelectItem value="elastic">elastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activePropTab === 'style' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fill</label>
                    <Select defaultValue="solid">
                      <SelectTrigger className="bg-background/70 hover:bg-background/80 transition-colors"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="linear">Linear Gradient</SelectItem>
                        <SelectItem value="radial">Radial Gradient</SelectItem>
                        <SelectItem value="animated">Animated Gradient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Primary Color</label>
                    <Input type="color" defaultValue="#6d28d9" className="h-9 p-1" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Palette</label>
                  <div className="flex gap-2">
                    {['#60a5fa','#a78bfa','#34d399','#f59e0b','#f43f5e'].map(c => (
                      <span key={c} className="h-6 w-6 rounded-full border border-border/40" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Text Presets</label>
                  <Select defaultValue="typewriter">
                    <SelectTrigger className="bg-background/70 hover:bg-background/80 transition-colors"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typewriter">Typewriter</SelectItem>
                      <SelectItem value="fade-in">Fade In</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {activePropTab === 'effects' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {['Blur','Glow','Shadow','Reflection','Particles','Confetti','Smoke','Morph'].map(effect => (
                    <label key={effect} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="accent-primary" /> {effect}
                    </label>
                  ))}
                </div>
              </>
            )}

            {activePropTab === 'export' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Format</label>
                    <Select defaultValue="mp4">
                      <SelectTrigger className="bg-background/70 hover:bg-background/80 transition-colors"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4</SelectItem>
                        <SelectItem value="gif">GIF</SelectItem>
                        <SelectItem value="webm">WebM</SelectItem>
                        <SelectItem value="lottie">Lottie JSON</SelectItem>
                        <SelectItem value="svg">SVG Animation</SelectItem>
                        <SelectItem value="manim">Manim Script</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Transparency</label>
                    <Select defaultValue="opaque">
                      <SelectTrigger className="bg-background/70 hover:bg-background/80 transition-colors"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opaque">With Background</SelectItem>
                        <SelectItem value="transparent">Transparent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Resolution</label>
                    <Select defaultValue="1080p">
                      <SelectTrigger className="bg-background/70 hover:bg-background/80 transition-colors"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p</SelectItem>
                        <SelectItem value="1080p">1080p</SelectItem>
                        <SelectItem value="4k">4K</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Frame Rate</label>
                    <Select defaultValue="30">
                      <SelectTrigger className="bg-background/70 hover:bg-background/80 transition-colors"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 fps</SelectItem>
                        <SelectItem value="30">30 fps</SelectItem>
                        <SelectItem value="60">60 fps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="pt-2">
                  <Button className="w-full gap-2 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground hover:scale-[1.01] transition-transform">
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Assistant */}
      <Button className="fixed bottom-5 right-5 rounded-full h-12 w-12 p-0 shadow-lg glass hover:scale-105 transition-transform" variant="secondary">
        <MessageSquare className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default WorkflowPage;


