import { NavigationBar } from '@/components/NavigationBar';
import { HeroSection } from '@/components/HeroSection';
import { AnimationWorkspace } from '@/components/AnimationWorkspace';
import { CodePreviewSection } from '@/components/CodePreviewSection';
import { WorkflowSection } from '@/components/WorkflowSection';
import { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Smooth scroll behavior
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent z-50 origin-left"
        style={{ scaleX }}
      />
      
      <NavigationBar />
      
      <main className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-20" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-20" />
        </div>

        <HeroSection />
        
        <AnimationWorkspace />

        {/* CTA to Studio */}
        <section id="create" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Create animations with AI</h2>
                <p className="text-muted-foreground mb-6">Describe your idea and let the studio help you craft it into motion.</p>
                <a href="/studio" className="inline-block">
                  <button className="relative px-6 py-3 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground hover:scale-[1.02] transition-transform shadow-md">
                    <span className="relative z-10">Open Studio</span>
                    <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/10 to-transparent" />
                  </button>
                </a>
              </div>
              <div className="rounded-xl border border-border/30 bg-background/50 backdrop-blur p-6">
                <p className="text-sm text-muted-foreground">Jump into the Studio to generate, preview, and refine animations with an elegant, responsive workspace.</p>
              </div>
            </div>
          </div>
        </section>
        
        <CodePreviewSection />
        
        <WorkflowSection />
        
        {/* Footer */}
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-lg py-12 mt-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Lumen Anima
                </h3>
                <p className="text-muted-foreground mt-2">
                  Transforming ideas into stunning animations with AI
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>
            <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Lumen Anima. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;