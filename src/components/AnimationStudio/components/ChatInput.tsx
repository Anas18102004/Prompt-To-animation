import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  disabled = false,
  placeholder = 'Type your message...'
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Creative suggestions that appear when the user clicks the sparkle button
  const creativeSuggestions = [
    '✨ Make a logo animation with glowing particles',
    '🎭 Create a morphing shape animation',
    '🌈 Design a colorful text reveal',
    '🔄 Animate a smooth loading spinner',
    '🎬 Show a cinematic title sequence'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleSuggestionClick = () => {
    // Select a random suggestion
    const randomSuggestion = creativeSuggestions[
      Math.floor(Math.random() * creativeSuggestions.length)
    ];
    setMessage(randomSuggestion);
    // Focus the input after setting the suggestion
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Focus input on component mount
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleSuggestionClick}
          disabled={disabled}
        >
          <Sparkles className="h-5 w-5" />
        </Button>
        
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10 py-6 bg-background border-border/30 focus-visible:ring-primary/20"
        />
        
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          disabled={disabled || !message.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;