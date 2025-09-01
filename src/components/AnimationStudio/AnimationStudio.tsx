import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { PanelRight, Download, Send, LayoutDashboard, FileVideo, Code as CodeIcon, Settings, X, ChevronRight, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MessageList, { Message } from './components/MessageList';
import ChatInput from './components/ChatInput';
import PreviewPanel from './components/PreviewPanel';
import FileTree from './FileTree';
import { ChatbotProvider, useChatbot } from './ChatbotProvider';

type ViewMode = 'code' | 'preview';
type StudioPhase = 'generation' | 'editing';

// Wrapper component that provides the chatbot context
const AnimationStudioWithProvider: React.FC = () => {
  return (
    <ChatbotProvider>
      <AnimationStudio />
    </ChatbotProvider>
  );
};

// Main component that uses the chatbot context
const AnimationStudio: React.FC = () => {
  // Get chatbot context
  const { messages, isTyping, sendMessage, welcomeComplete } = useChatbot();
  // State management
  const [userPrompt, setUserPrompt] = useState('');
  const [welcomeText, setWelcomeText] = useState('');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [phase, setPhase] = useState<StudioPhase>('generation');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [generatedCode, setGeneratedCode] = useState('// Your generated code will appear here');
  const [agentFiles, setAgentFiles] = useState<string[]>(["animation.js"]); // Placeholder, should be updated by agent actions
  const [selectedFile, setSelectedFile] = useState<string | null>(agentFiles[0] || null);

  // Animation ideas for suggestions
  const animationIdeas = [
    'A bouncing ball with a trail',
    'A rotating cube with changing colors',
    'A particle system explosion',
    'A smooth loading spinner',
    'A typing animation effect'
  ];

  // Typing effect for welcome message
  useEffect(() => {
    setWelcomeText('');
    
    let currentIndex = 0;
    const typingSpeed = 100; // ms per character
    
    const typeWriter = () => {
      if (currentIndex < "Lumen Anima Studio".length) {
        setWelcomeText("Lumen Anima Studio".substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeWriter, typingSpeed);
      }
    };
    
    const timer = setTimeout(typeWriter, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Handle sending a new message
  const handleSendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    
    // Use the sendMessage function from the chatbot context
    sendMessage(message);
    
    // Auto-scroll to bottom of messages
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    // Generate some sample code
    setGeneratedCode(`// Animation code for: ${message}\nconst animation = () => {\n  // Your animation logic here\n  console.log("Playing animation: ${message}");\n};\n\n// Start the animation\nanimation();`);

    // Open the preview panel if not already open
    setTimeout(() => {
      setRightPanelOpen(true);
    }, 3000);
  }, [sendMessage]);

  // Handle continuing to studio
  const handleContinueToStudio = useCallback(() => {
    setPhase('editing');
    setRightPanelOpen(false);
  }, []);

  // Handle going back to generation phase
  const handleBackToGeneration = useCallback(() => {
    setPhase('generation');
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 -z-10" />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="ml-16 min-h-screen fade-in">
        {phase === 'generation' ? (
          <div className="h-screen flex overflow-hidden">
            {/* Left Panel - Chat Interface */}
            <div className={`transition-all duration-300 ease-in-out ${rightPanelOpen ? 'w-1/2' : 'w-full'} h-full flex flex-col bg-background/80 backdrop-blur-sm border-r border-border/20`}>
              <div className="flex-1 overflow-y-auto p-6">
                {/* Welcome Message */}
                <div className="text-center mb-8 fade-in">
                  <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {welcomeText}
                    <span className={`inline-block w-1 h-12 bg-primary ml-1 ${welcomeText.length === "Lumen Anima Studio".length ? 'opacity-0' : 'animate-pulse'}`}></span>
                  </h1>
                  {welcomeText.length === "Lumen Anima Studio".length && (
                    <p className="text-lg text-muted-foreground">
                      ✨ Describe your animation idea and I'll bring it to life!
                    </p>
                  )}
                </div>
                
                {/* Chat Messages */}
                <div className="relative">
                  <MessageList 
                    messages={messages} 
                    messagesEndRef={messagesEndRef} 
                  />
                  {isTyping && (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4 ml-12">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>Creating your animation...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Input Area */}
              <div className="p-6 pt-0 border-t border-border/20">
                <div className="max-w-2xl mx-auto">
                  <ChatInput 
                    onSend={handleSendMessage}
                    disabled={!welcomeComplete}
                    placeholder="Describe your animation idea..."
                  />
                  
                  {/* Suggestion Chips */}
                  {welcomeComplete && messages.length === 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {animationIdeas.map((idea, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="rounded-full text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            setUserPrompt(idea);
                            handleSendMessage(idea);
                          }}
                        >
                          {idea}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Panel - Preview/Code */}
            <PreviewPanel
              isOpen={rightPanelOpen}
              onClose={() => setRightPanelOpen(false)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              generatedCode={generatedCode}
              onContinue={handleContinueToStudio}
            />
            
            {/* Toggle Right Panel Button */}
            {!rightPanelOpen && messages.length > 0 && (
              <button 
                onClick={() => setRightPanelOpen(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-background border border-border/30 rounded-l-lg p-3 shadow-md hover:bg-muted transition-colors"
              >
                <PanelRight className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        ) : (
          // Editing Phase
          <div className="h-screen flex flex-col bg-background">
            {/* Top Bar */}
            <div className="h-16 border-b border-border/20 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleBackToGeneration}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <PanelRight className="h-5 w-5 rotate-180" />
                </Button>
                <h2 className="text-lg font-semibold">Editing Mode</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* FileTree Panel */}
              <div className="w-56 border-r border-border/20 bg-background/90">
                <FileTree files={agentFiles} selectedFile={selectedFile} onSelect={setSelectedFile} />
              </div>
              {/* Timeline Panel */}
              <div className="w-1/4 border-r border-border/20 p-4 overflow-y-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">TIMELINE</h3>
                <div className="space-y-2">
                  <div className="h-16 bg-muted/30 rounded-lg border border-border/30 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Timeline will appear here</span>
                  </div>
                </div>
              </div>
              
              {/* Center Panel - Video Canvas */}
              <div className="flex-1 flex items-center justify-center bg-muted/10">
                <div className="relative w-3/4 aspect-video bg-background rounded-xl border border-border/30 shadow-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-muted-foreground">Video Canvas</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your animation will be displayed here
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Panel - Parameters & File Preview */}
              <div className="w-80 border-l border-border/20 p-4 overflow-y-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">PROPERTIES</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">ANIMATION</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Duration</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="0.1" 
                            max="5" 
                            step="0.1" 
                            defaultValue="1"
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-xs w-8 text-right">1.0s</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Easing</label>
                        <select className="w-full text-sm bg-background border border-border/30 rounded-md px-3 py-1.5">
                          <option>easeInOut</option>
                          <option>easeIn</option>
                          <option>easeOut</option>
                          <option>linear</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">STYLE</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Background</label>
                        <div className="flex gap-2">
                          <button className="h-8 w-8 rounded border border-border/30 bg-background"></button>
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value="#ffffff" 
                              className="w-full text-xs bg-background border border-border/30 rounded-md px-2 py-1.5"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">EXPORT</h4>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">MP4</Button>
                        <Button variant="outline" size="sm" className="flex-1">GIF</Button>
                        <Button variant="outline" size="sm" className="flex-1">WebM</Button>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        Export Animation
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">FILE PREVIEW</h4>
                    <div className="rounded bg-muted/20 p-2 text-xs font-mono whitespace-pre overflow-x-auto min-h-[80px]">
                      {selectedFile ? generatedCode : 'Select a file to preview its content.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimationStudioWithProvider;
