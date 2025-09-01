import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pb-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cn(
            "flex items-start gap-3 max-w-[85%] group",
            message.sender === 'user' ? 'ml-auto' : ''
          )}
        >
          {message.sender === 'ai' && (
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-medium">
                ✨
              </div>
            </div>
          )}
          
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm",
              message.sender === 'user' ? 
                'bg-primary text-primary-foreground' : 
                'bg-muted/50 border border-border/30'
            )}
          >
            {message.content}
          </div>
          
          {message.sender === 'user' && (
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-medium">
                👤
              </div>
            </div>
          )}
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;