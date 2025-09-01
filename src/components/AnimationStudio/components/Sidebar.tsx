import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Home, Settings, FileText, HelpCircle, MessageSquare } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <motion.div 
      className="fixed left-0 top-0 h-screen w-16 bg-background/80 backdrop-blur-sm border-r border-border/20 flex flex-col items-center py-6 z-10"
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex flex-col items-center gap-2">
        <Button variant="ghost" size="icon" className="text-primary mb-6">
          <Sparkles className="h-6 w-6" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Home className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <MessageSquare className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <FileText className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="mt-auto flex flex-col items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;