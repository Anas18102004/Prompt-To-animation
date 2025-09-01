import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Home, 
  Wand2, 
  Library, 
  Settings, 
  User, 
  HelpCircle,
  Sparkles 
} from 'lucide-react';

export const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', href: '#home' },
    { icon: Wand2, label: 'Studio', href: '/studio' },
    { icon: Library, label: 'Gallery', href: '#gallery' },
    { icon: HelpCircle, label: 'Help', href: '#help' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glass-light rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
            </div>
            <div>
              <h1 className="font-space text-xl font-bold text-holographic">
                AI Animator
              </h1>
              <p className="text-xs text-muted-foreground">Next-Gen Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors duration-300 group"
              >
                <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* User Profile */}
            <Button 
              variant="outline" 
              size="sm"
              className="hidden sm:flex glass border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>

            {/* Settings */}
            <Button 
              variant="outline" 
              size="sm"
              className="glass border-secondary/30 text-secondary hover:bg-secondary/10 hover:border-secondary/50"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden glass border-accent/30 text-accent hover:bg-accent/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pt-6 border-t border-border/20 animate-fade-in-up">
            <div className="space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 p-3 glass-light rounded-lg hover-glass transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{item.label}</span>
                </a>
              ))}
              
              {/* Mobile Profile */}
              <div className="pt-4 border-t border-border/20">
                <Button 
                  variant="outline" 
                  className="w-full glass border-primary/30 text-primary hover:bg-primary/10"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};