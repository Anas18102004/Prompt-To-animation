import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, FileVideo, Code as CodeIcon, ArrowRight } from 'lucide-react';

interface PreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'code' | 'preview';
  onViewModeChange: (mode: 'code' | 'preview') => void;
  generatedCode: string;
  onContinue: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  generatedCode,
  onContinue
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="w-1/2 h-full bg-background/80 backdrop-blur-sm border-l border-border/20 flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Animation Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => onViewModeChange(v as 'code' | 'preview')} className="mr-4">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="preview" className="text-xs">
                <FileVideo className="h-4 w-4 mr-1" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs">
                <CodeIcon className="h-4 w-4 mr-1" />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'preview' ? (
          <div className="h-full flex items-center justify-center bg-muted/10 p-6">
            <div className="relative w-full max-w-2xl aspect-video bg-background rounded-xl border border-border/30 shadow-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground">✨ Animation Preview</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your magical animation will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full p-6 overflow-auto">
            <div className="bg-muted/30 rounded-lg border border-border/30 p-4 h-full overflow-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {generatedCode}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/20 flex justify-end">
        <Button onClick={onContinue} className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Continue to Studio
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default PreviewPanel;