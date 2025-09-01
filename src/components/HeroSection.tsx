import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Zap } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';
import aiAssistant from '@/assets/ai-assistant.png';

export const HeroSection = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = "World's #1 AI Animation Creator";
  
  useEffect(() => {
    const typeText = () => {
      let i = 0;
      const timer = setInterval(() => {
        setTypedText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) {
          clearInterval(timer);
        }
      }, 80);
    };
    
    const timeout = setTimeout(typeText, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden particles">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
      </div>
      
      {/* Main Hero Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
        {/* Main Headline */}
        <h1 className="font-space text-6xl md:text-8xl font-bold mb-8 animate-fade-in-up">
          <span className="text-holographic">
            {typedText}
            <span className="typing opacity-70"></span>
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in-up delay-200">
          Transform your ideas into stunning animations with the power of AI. 
          <span className="text-secondary font-medium"> No coding required.</span>
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-300">
          <Button 
            size="lg" 
            className="group glass hover-glow bg-primary/20 border-primary/30 text-primary-foreground hover:bg-primary/30 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
            Generate Animation
          </Button>
          
          <Button 
            size="lg" 
            variant="outline"
            className="group glass border-secondary/30 text-secondary hover:bg-secondary/10 hover:border-secondary/50 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Try Demo
          </Button>
        </div>
        
        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mt-16 animate-fade-in-up delay-400">
          {[
            { icon: Zap, text: "AI-Powered", color: "primary" },
            { icon: Play, text: "Real-time Preview", color: "secondary" },
            { icon: Sparkles, text: "Studio Quality", color: "accent" }
          ].map((feature, index) => (
            <div 
              key={feature.text}
              className={`glass-light px-6 py-3 rounded-full flex items-center gap-2 hover-glass cursor-pointer animate-scale-in`}
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <feature.icon className={`w-4 h-4 text-${feature.color}`} />
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};