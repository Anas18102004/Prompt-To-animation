import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Download, Sparkles, ArrowLeft } from 'lucide-react';

export const AnimationWorkspace = () => {
  const [prompt, setPrompt] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState('5');
  const [fps, setFps] = useState('60');
  const [quality, setQuality] = useState('Ultra HD');
  const [exportFormat, setExportFormat] = useState('MP4 (H.264)');

  const examplePrompts = [
    'A spinning cube with neon edges',
    'Floating particles forming a logo',
    'Morphing geometric shapes',
    'Glowing text animation'
  ];

  return (
    <section className="min-h-screen py-8 px-6 bg-space">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="glass text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Animation Studio
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[85vh]">
          {/* Left Panel - Animation Prompt */}
          <div className="col-span-3 space-y-6">
            <Card className="glass p-6 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-space text-lg font-semibold text-foreground">
                  Animation Prompt
                </h3>
              </div>
              
              <div className="flex-1 mb-6">
                <Textarea
                  placeholder="Describe your animation idea..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="glass-light border-primary/20 focus:border-primary/50 h-48 resize-none text-foreground placeholder:text-muted-foreground/60 text-base"
                />
              </div>
              
              <div className="flex gap-3 mb-6">
                <Button 
                  className="flex-1 bg-primary/80 hover:bg-primary text-primary-foreground font-medium"
                  disabled={!prompt.trim()}
                >
                  Generate
                </Button>
                <Button 
                  variant="outline"
                  className="glass border-accent/30 text-accent hover:bg-accent/10"
                >
                  Enhance
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Try these examples:</p>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="w-full text-left p-3 glass-light rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all duration-200"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Center Panel - Canvas & Timeline */}
          <div className="col-span-6 flex flex-col gap-4">
            {/* Canvas */}
            <Card className="glass-heavy flex-1 relative overflow-hidden">
              {/* Canvas Header */}
              <div className="absolute top-0 left-0 right-0 z-10 glass-light p-4 border-b border-border/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">1920×1080 • 60fps</span>
                </div>
              </div>

              {/* Canvas Content */}
              <div className="h-full flex items-center justify-center relative bg-space-dark">
                {/* Grid Background */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '32px 32px'
                  }}
                />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="w-20 h-20 glass rounded-full flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                  <p className="text-muted-foreground">Click play to preview animation</p>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="glass p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground">Timeline</h4>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0 glass">
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0 glass">
                    <Pause className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0 glass">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Waveform */}
                <div className="h-16 glass-light rounded-lg p-3 flex items-end justify-center gap-1">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary/60 rounded-full transition-all duration-300"
                      style={{
                        height: `${Math.random() * 40 + 10}px`,
                        opacity: i < 25 ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
                
                {/* Timeline Markers */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>0:00</span>
                  <span className="text-primary font-medium">Frame: 0</span>
                  <span className="text-primary font-medium">60 FPS</span>
                  <span>0:05</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Panel - Animation Properties */}
          <div className="col-span-3 space-y-6">
            <Card className="glass p-6">
              <h3 className="font-space text-lg font-semibold mb-6 text-foreground">
                Animation Properties
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="glass-light border-border/20 focus:border-primary/50"
                    />
                    <span className="text-sm text-muted-foreground">s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">FPS</Label>
                  <Input
                    type="number"
                    value={fps}
                    onChange={(e) => setFps(e.target.value)}
                    className="glass-light border-border/20 focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Resolution</Label>
                  <div className="text-sm text-foreground font-medium">1920×1080</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Quality</Label>
                  <div className="text-sm text-foreground font-medium">{quality}</div>
                </div>
              </div>
            </Card>

            <Card className="glass p-6">
              <h3 className="font-medium mb-4 text-foreground">Export Settings</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="glass-light border-border/20 focus:border-primary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-heavy border-border/20">
                      <SelectItem value="MP4 (H.264)">MP4 (H.264)</SelectItem>
                      <SelectItem value="WebM">WebM</SelectItem>
                      <SelectItem value="GIF">GIF</SelectItem>
                      <SelectItem value="MOV">MOV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-primary/80 hover:bg-primary text-primary-foreground font-medium">
                  Generate Animation
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};