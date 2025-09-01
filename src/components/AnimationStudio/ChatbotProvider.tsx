import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message } from './components/MessageList';

interface ChatbotContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  welcomeComplete: boolean;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
  apiEndpoint?: string;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ 
  children,
  apiEndpoint = '/api/chat'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(true);
  const [messageCounter, setMessageCounter] = useState(0);

  // Function to transform technical messages into conversational ones
  const transformMessage = (message: string): string => {
    // Hide technical details and make responses more conversational
    if (message.includes('Project created:')) {
      return `✨ I'm creating your animation now!`;
    }
    if (message.includes('Code generated')) {
      return `🎨 Your animation is ready! I've created something special based on your description.`;
    }
    if (message.includes('Video ready')) {
      return `🎬 Your animation is ready to preview! What do you think?`;
    }
    if (message.includes('Error:')) {
      return `Hmm, I ran into a small creative block. Could you try describing your animation differently?`;
    }
    if (message.startsWith('Agent:')) {
      return message.replace('Agent:', '').trim();
    }
    
    // Add emojis to enhance personality
    if (message.toLowerCase().includes('starting')) {
      return `🚀 ${message}`;
    }
    
    return message;
  };

  // Send a message to the chatbot
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessageId = `msg-${messageCounter}`;
    setMessageCounter(prev => prev + 1);
    
    const userMessage: Message = {
      id: userMessageId,
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Show typing indicator
      setIsTyping(true);
      
      // In a real implementation, this would call the API
      // For now, we'll simulate a response
      setTimeout(() => {
        const aiMessageId = `msg-${messageCounter + 1}`;
        setMessageCounter(prev => prev + 1);
        
        // Create a friendly, conversational response
        const responseContent = transformMessage(
          `✨ Awesome choice! I'll create an animation based on "${content}". Give me just a moment to work my magic!`
        );
        
        const aiMessage: Message = {
          id: aiMessageId,
          content: responseContent,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
        
        // Simulate animation generation completion after a delay
        setTimeout(() => {
          const completionMessageId = `msg-${messageCounter + 2}`;
          setMessageCounter(prev => prev + 1);
          
          const completionMessage: Message = {
            id: completionMessageId,
            content: `🎉 Your animation is ready! I've created something magical based on your idea. Want to see it?`,
            sender: 'ai',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, completionMessage]);
        }, 3000);
      }, 1500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add a friendly error message
      const errorMessageId = `msg-${messageCounter + 1}`;
      setMessageCounter(prev => prev + 1);
      
      const errorMessage: Message = {
        id: errorMessageId,
        content: 'Oops! I hit a creative block. Could you try describing your animation idea differently?',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  }, [messageCounter]);

  const value = {
    messages,
    isTyping,
    sendMessage,
    welcomeComplete
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

// Custom hook to use the chatbot context
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};