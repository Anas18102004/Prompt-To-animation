import React, { FC ,useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Plus, Play, Pause, Home, Image as ImageIcon, User, Download, Code, Settings, Sparkles, ArrowRight, History, Search, ChevronLeft, ChevronRight, X, Eye, Video, Copy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import holographicIcon from '@/assets/holographic-icon.svg';
import FileTree from './FileTree';
import AdvancedFileTree, { FileNode } from './AdvancedFileTree';

// Remove the Timeline import
// import TimelineEditor from './TimelineEditor';

// === API UTILS FOR BACKEND INTEGRATION ===
let messageCounter = 0;
const API_BASE = 'http://localhost:8000'; // Change if backend runs elsewhere

// Enhanced API functions
export async function sendChatMessage(message: string, userId: string = 'user123') {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_id: userId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Chat API error:', error);
    throw error;
  }
}

export async function generateVideo(message: string, userId: string = 'user123') {
  try {
    const response = await fetch(`${API_BASE}/generate-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_id: userId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Video generation API error:', error);
    throw error;
  }
}

export async function getVideoStatus(generationId: string) {
  try {
    const response = await fetch(`${API_BASE}/video-status/${generationId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Video status API error:', error);
    throw error;
  }
}

export function getVideoUrl(filename: string) {
  return `${API_BASE}/video/${filename}`;
}

export function getDownloadUrl(filename: string) {
  return `${API_BASE}/download-video/${filename}`;
}

export async function saveCode(filename: string, content: string) {
  try {
    const response = await fetch(`${API_BASE}/save-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Save code API error:', error);
    throw error;
  }
}

export async function getCode(filename: string) {
  try {
    const response = await fetch(`${API_BASE}/code/${filename}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get code API error:', error);
    throw error;
  }
}

export async function listVideos() {
  try {
    const response = await fetch(`${API_BASE}/list-videos`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('List videos API error:', error);
    throw error;
  }
}

export async function listFiles() {
  try {
    const response = await fetch(`${API_BASE}/list-files`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('List files API error:', error);
    throw error;
  }
}

// AI Suggestion System
const getFileTypeScaffold = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'py':
      if (fileName.includes('scene') || fileName.includes('animation')) {
        return `from manim import *

class ${fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')}Scene(Scene):
    def construct(self):
        # Create your animation here
        circle = Circle(radius=1, color=BLUE)
        self.play(Create(circle))
        self.wait(1)
        self.play(circle.animate.scale(2))
        self.wait(1)`;
      }
      return `# ${fileName}
def main():
    print("Hello from ${fileName}!")
    
if __name__ == "__main__":
    main()`;
    
    case 'js':
    case 'ts':
      return `// ${fileName}
export const ${fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')} = () => {
  // Your code here
  console.log("Hello from ${fileName}!");
};

export default ${fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')};`;
    
    case 'tsx':
    case 'jsx':
      return `import React from 'react';

export const ${fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')}: React.FC = () => {
  return (
    <div className="${fileName.split('.')[0].toLowerCase()}-container">
      <h1>${fileName.split('.')[0]}</h1>
    </div>
  );
};

export default ${fileName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '')};`;
    
    case 'css':
      return `/* ${fileName} */
.${fileName.split('.')[0].toLowerCase()}-container {
  /* Your styles here */
}`;
    
    default:
      return `// ${fileName}
// Start coding here...`;
  }
};

const getAISuggestion = (content: string, fileName: string): string => {
  const lines = content.split('\n');
  const lastLine = lines[lines.length - 1];
  
  if (lastLine.trim() === '') {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'py' && fileName.includes('scene')) {
      return 'self.play(Transform(circle, Square()))';
    } else if (extension === 'tsx' || extension === 'jsx') {
      return '<Button onClick={() => console.log("clicked")}>Click me</Button>';
    } else if (extension === 'js' || extension === 'ts') {
      return 'const element = document.createElement("div");';
    }
  }
  
  return '';
};

// Custom components
const GlowButton = ({ children, className = '', ...props }) => (
  <Button 
    className={`relative overflow-hidden group ${className}`}
    {...props}
  >
    <span className="relative z-10">{children}</span>
    <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </Button>
);

const Panel = ({ children, className = '' }) => (
  <div className={`bg-background/80 backdrop-blur-lg rounded-xl border border-border/20 shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);



interface AnimationStudioProps {}

const AnimationStudio: React.FC<AnimationStudioProps> = () => {
  const [currentStage, setCurrentStage] = useState<'welcome' | 'studio'>('welcome');
  const [userPrompt, setUserPrompt] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [welcomeText, setWelcomeText] = useState('');
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [codePanelWidthPct, setCodePanelWidthPct] = useState(55);
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'ai'; content: string; timestamp: number }>>([]);
  const fullWelcomeText = "How was your day, Animator?";
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInputValid = userPrompt.trim().length > 0 && welcomeComplete;
  
  // AI Editor States
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [agentFiles, setAgentFiles] = useState<string[]>(["animation.js"]); // Placeholder, should be updated by agent actions
  const [selectedFile, setSelectedFile] = useState<string | null>(agentFiles[0] || null);
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      children: [
        { id: 'app-tsx', name: 'App.tsx', type: 'file' },
        {
          id: 'components',
          name: 'components',
          type: 'folder',
          children: [
            { id: 'ChatPanel-tsx', name: 'ChatPanel.tsx', type: 'file' },
            { id: 'OutputPanel-tsx', name: 'OutputPanel.tsx', type: 'file' },
          ],
        },
      ],
    },
  ]);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [fileTreeWidth, setFileTreeWidth] = useState(256); // Default 256px (w-64)
  const [isResizingTree, setIsResizingTree] = useState(false);
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    'app-tsx': `import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <h1>Welcome to Lumen Anima</h1>
      <p>Your AI-powered animation studio</p>
    </div>
  );
};

export default App;`,
    'ChatPanel-tsx': `import React from 'react';

export const ChatPanel: React.FC = () => {
  return (
    <div className="chat-panel">
      <h2>Chat Panel</h2>
      <p>💡 Tip: Type what you want and I'll generate the code for you.</p>
    </div>
  );
};

export default ChatPanel;`,
    'OutputPanel-tsx': `import React from 'react';

export const OutputPanel: React.FC = () => {
  return (
    <div className="output-panel">
      <h2>Output Panel</h2>
      <p>Your animations will appear here</p>
    </div>
  );
};

export default OutputPanel;`,
    'scenes.py': `from manim import *

class HelloWorldScene(Scene):
    def construct(self):
        # Create a simple animation
        circle = Circle(radius=1, color=BLUE)
        self.play(Create(circle))
        self.wait(1)
        self.play(circle.animate.scale(2))
        self.wait(1)
        
        # Add some text
        text = Text("Hello, Lumen Anima!", color=WHITE)
        self.play(Write(text))
        self.wait(2)
        
        # 💡 Tip: Type what you want and I'll generate the code for you.`,
  });

  // VS Code-like file operations
  function createFile(parentId: string, fileName: string): void {
    console.log('=== CREATE FILE DEBUG ===');
    console.log('Creating file:', fileName, 'in parent:', parentId);
    const newFileId = `${fileName}-${Date.now()}`;
    const newFile: FileNode = { id: newFileId, name: fileName, type: 'file' };
    
    setFileTree(prevTree => {
      console.log('Previous tree:', JSON.stringify(prevTree, null, 2));
      console.log('Looking for parent ID:', parentId);
      
      // Special case: if parentId is 'root', add to root level
      if (parentId === 'root') {
        console.log('Adding to root level');
        return [...prevTree, newFile];
      }
      
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          console.log('Checking node:', node.id, 'name:', node.name, 'type:', node.type, 'against parent:', parentId);
          if (node.id === parentId) {
            console.log('✅ Found parent! Adding file to:', node.name);
            const updatedNode = {
              ...node,
              children: [...(node.children || []), newFile]
            };
            console.log('Updated node:', updatedNode);
            return updatedNode;
          }
          if (node.children) {
            console.log('Recursing into children of:', node.name);
            return {
              ...node,
              children: updateNode(node.children)
            };
          }
          return node;
        });
      };
      
      const updatedTree = updateNode(prevTree);
      console.log('Final updated tree:', JSON.stringify(updatedTree, null, 2));
      return updatedTree;
    });
    
    // Initialize file content with AI-generated scaffold
    const scaffold = getFileTypeScaffold(fileName);
    setFileContents(prev => ({
      ...prev,
      [newFileId]: scaffold
    }));
    
    // Auto-select the new file
    setSelectedNode(newFile);
    
    // Show success message
    setSuccessMessage(`✅ Created ${fileName} with smart scaffold!`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  }

  function createFolder(parentId: string, folderName: string): void {
    console.log('=== CREATE FOLDER DEBUG ===');
    console.log('Creating folder:', folderName, 'in parent:', parentId);
    const newFolderId = `${folderName}-${Date.now()}`;
    const newFolder: FileNode = { id: newFolderId, name: folderName, type: 'folder', children: [] };
    
    setFileTree(prevTree => {
      console.log('Previous tree:', JSON.stringify(prevTree, null, 2));
      console.log('Looking for parent ID:', parentId);
      
      // Special case: if parentId is 'root', add to root level
      if (parentId === 'root') {
        console.log('Adding folder to root level');
        return [...prevTree, newFolder];
      }
      
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          console.log('Checking node:', node.id, 'name:', node.name, 'type:', node.type, 'against parent:', parentId);
          if (node.id === parentId) {
            console.log('✅ Found parent! Adding folder to:', node.name);
            const updatedNode = {
              ...node,
              children: [...(node.children || []), newFolder]
            };
            console.log('Updated node:', updatedNode);
            return updatedNode;
          }
          if (node.children) {
            console.log('Recursing into children of:', node.name);
            return {
              ...node,
              children: updateNode(node.children)
            };
          }
          return node;
        });
      };
      
      const updatedTree = updateNode(prevTree);
      console.log('Final updated tree:', JSON.stringify(updatedTree, null, 2));
      return updatedTree;
    });
  }

  function renameNode(nodeId: string, newName: string): void {
    setFileTree(prevTree => {
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, name: newName };
          }
          if (node.children) {
            return {
              ...node,
              children: updateNode(node.children)
            };
          }
          return node;
        });
      };
      return updateNode(prevTree);
    });
    
    // Update selected node if it's the one being renamed
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, name: newName } : null);
    }
  }

  function deleteNode(nodeId: string): void {
    setFileTree(prevTree => {
      const removeNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(node => node.id !== nodeId).map(node => ({
          ...node,
          children: node.children ? removeNode(node.children) : undefined
        }));
      };
      return removeNode(prevTree);
    });
    
    // Remove file content if it's a file
    setFileContents(prev => {
      const newContents = { ...prev };
      delete newContents[nodeId];
      return newContents;
    });
    
    // Clear selection if deleted node was selected
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }

  function moveNode(nodeId: string, targetParentId: string): void {
    console.log('Moving node:', nodeId, 'to parent:', targetParentId);
    
    setFileTree(prevTree => {
      // First, find and remove the node from its current location
      const removeNode = (nodes: FileNode[]): { nodes: FileNode[], removedNode: FileNode | null } => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === nodeId) {
            const removedNode = nodes[i];
            const newNodes = nodes.filter((_, index) => index !== i);
            return { nodes: newNodes, removedNode };
          }
          if (nodes[i].children) {
            const result = removeNode(nodes[i].children!);
            if (result.removedNode) {
              return {
                nodes: nodes.map((node, index) => 
                  index === i ? { ...node, children: result.nodes } : node
                ),
                removedNode: result.removedNode
              };
            }
          }
        }
        return { nodes, removedNode: null };
      };

      // Remove the node from its current location
      const { nodes: treeAfterRemoval, removedNode } = removeNode(prevTree);
      
      if (!removedNode) {
        console.log('Node not found for removal');
        return prevTree;
      }

      // Special case: if targetParentId is 'root', add to root level
      if (targetParentId === 'root') {
        console.log('Moving to root level');
        return [...treeAfterRemoval, removedNode];
      }

      // Add the node to the target location
      const addNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === targetParentId) {
            console.log('Adding node to:', node.name);
            return {
              ...node,
              children: [...(node.children || []), removedNode]
            };
          }
          if (node.children) {
            return {
              ...node,
              children: addNode(node.children)
            };
          }
          return node;
        });
      };

      const finalTree = addNode(treeAfterRemoval);
      console.log('Final tree after move:', finalTree);
      return finalTree;
    });
  }

  function handleTreeAction(action: 'new-file' | 'new-folder' | 'rename' | 'delete' | 'move', node: FileNode, newName?: string, targetParentId?: string) {
    console.log('=== HANDLE TREE ACTION DEBUG ===');
    console.log('Action:', action);
    console.log('Node:', node);
    console.log('New name:', newName);
    console.log('Target parent ID:', targetParentId);
    
    switch (action) {
      case 'new-file': {
        if (!newName) {
          // Fallback to prompt if no name provided (for backward compatibility)
          const fileName = prompt('New file name (e.g., Component.tsx)')?.trim();
          if (!fileName) return;
          console.log('Creating file with prompt, parent ID:', node.id);
          createFile(node.id, fileName);
        } else {
          console.log('Creating file with inline input, parent ID:', node.id);
          createFile(node.id, newName);
        }
        break;
      }
      
      case 'new-folder': {
        if (!newName) {
          // Fallback to prompt if no name provided (for backward compatibility)
          const folderName = prompt('New folder name')?.trim();
          if (!folderName) return;
          console.log('Creating folder with prompt, parent ID:', node.id);
          createFolder(node.id, folderName);
        } else {
          console.log('Creating folder with inline input, parent ID:', node.id);
          createFolder(node.id, newName);
        }
        break;
      }
      
      case 'rename': {
        if (!newName || !newName.trim() || newName === node.name) return;
        renameNode(node.id, newName);
        break;
      }
      
      case 'delete': {
        const message = node.type === 'folder' && node.children?.length 
          ? `Delete "${node.name}" and ${node.children.length} item(s) inside?`
          : `Delete "${node.name}"?`;
        
        if (!confirm(message)) return;
        deleteNode(node.id);
        break;
      }
      
      case 'move': {
        if (!targetParentId) return;
        moveNode(node.id, targetParentId);
        break;
      }
    }
  }

  // Enhanced file selection handler
  const handleFileSelect = (node: FileNode) => {
    setSelectedNode(node);
    if (node.type === 'file') {
      setCurrentFileName(node.name);
    }
  };
  
  // Animation variants for right panel
  const panelVariants: Variants = {
    hidden: {
      x: '100%',
      opacity: 0,
      transition: {
        type: 'tween',
        duration: 0.5,
        ease: 'easeInOut'
      }
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween',
        duration: 0.5,
        ease: 'easeInOut'
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        type: 'tween',
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  };
  
  // Glass effect styles
  const glassEffect = {
    backdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  };
  
  // Animation variants
  const container: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.03,
        ease: 'easeOut',
        duration: 0.5
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: 'easeOut'
      } 
    }
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const onMouseMove = (evt: MouseEvent) => {
      if (!isResizing) return;
      const container = document.getElementById('studio-container');
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const sidebarWidthPx = 64; // w-16 fixed sidebar
      const xFromRight = rect.right - evt.clientX;
      const totalAvailable = rect.width - sidebarWidthPx;
      let nextPct = Math.round((xFromRight / totalAvailable) * 100);
      nextPct = Math.max(25, Math.min(60, nextPct));
      setCodePanelWidthPct(nextPct);
    };
    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const startTreeResize = (e: React.MouseEvent) => {
    console.log('Resize started!', e.clientX);
    e.preventDefault();
    e.stopPropagation();
    setIsResizingTree(true);
    
    const startX = e.clientX;
    const startWidth = fileTreeWidth;
    
    const onMouseMove = (evt: MouseEvent) => {
      if (!isResizingTree) return;
      evt.preventDefault();
      const deltaX = evt.clientX - startX;
      const newWidth = Math.max(200, Math.min(400, startWidth + deltaX));
      console.log('Resizing to:', newWidth);
      setFileTreeWidth(newWidth);
    };
    
    const onMouseUp = () => {
      console.log('Resize ended!');
      setIsResizingTree(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Typing effect for welcome message
  useEffect(() => {
    if (currentStage !== 'welcome' || isTyping) return;
    
    setIsTyping(true);
    setWelcomeText('');
    setWelcomeComplete(false);
    
    let currentIndex = 0;
    const typingSpeed = 100; // ms per character
    
    const typeWriter = () => {
      if (currentIndex < fullWelcomeText.length) {
        setWelcomeText(fullWelcomeText.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeWriter, typingSpeed);
      } else {
        setWelcomeComplete(true);
        setIsTyping(false);
      }
    };
    
    // Start typing after a short delay
    const timer = setTimeout(typeWriter, 500);
    
    return () => {
      clearTimeout(timer);
      setIsTyping(false);
    };
  }, [currentStage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserPrompt(newValue);
    
    // Hide panel if input is cleared
    if (newValue.trim() === '') {
      setIsPanelVisible(false);
      setCurrentStage('welcome');
    } else if (!isTyping) {
      setIsTyping(true);
    }
  };

  // === Chat/Agent Integration ===
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>("Untitled Project");
  const [currentFileName, setCurrentFileName] = useState<string>("scenes.py");
  const [videoGenerationId, setVideoGenerationId] = useState<string | null>(null);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 AnimationStudio State Update:', {
      currentFileName,
      currentProjectName,
      fileContents: Object.keys(fileContents),
      selectedNode: selectedNode?.id,
      activeTab,
      isPanelVisible,
      currentStage
    });
  }, [currentFileName, currentProjectName, fileContents, selectedNode, activeTab, isPanelVisible, currentStage]);

  // AI Suggestion Logic
  useEffect(() => {
    if (!currentFileName || !fileContents[currentFileName]) return;
    
    const content = fileContents[currentFileName];
    const suggestion = getAISuggestion(content, currentFileName);
    
    if (suggestion && content.trim() !== '') {
      setAiSuggestion(suggestion);
      setShowAISuggestion(true);
    } else {
      setShowAISuggestion(false);
    }
  }, [fileContents, currentFileName]);

  // Auto-hide AI suggestion after typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAISuggestion(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [fileContents[currentFileName]]);

  // Synchronize line numbers with textarea
  useEffect(() => {
    const textarea = document.getElementById('code-textarea') as HTMLTextAreaElement;
    const gutter = document.getElementById('line-numbers-gutter');
    
    if (textarea && gutter) {
      const syncScroll = () => {
        gutter.scrollTop = textarea.scrollTop;
      };
      
      textarea.addEventListener('scroll', syncScroll);
      return () => textarea.removeEventListener('scroll', syncScroll);
    }
  }, [currentFileName, fileContents[currentFileName]]);

  // Copy code handler
  const handleCopyCode = () => {
    const code = fileContents[currentFileName] || '';
    navigator.clipboard.writeText(code).then(() => {
      setSuccessMessage('📋 Code copied to clipboard!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    });
  };

  // Handles chat submission and agent streaming
  const handleAgentSubmit = async (prompt: string) => {
    try {
      // Add user message
      setMessages((prev) => [
        ...prev,
        { id: `msg-${messageCounter++}`, sender: 'user', content: prompt, timestamp: Date.now() },
      ]);
      setIsSubmitting(true);
      setCurrentStage('studio');
      setIsPanelVisible(true);

      // Add initial agent response
      setMessages((prev) => [
        ...prev,
        { id: `msg-${messageCounter++}`, sender: 'ai', content: '🤖 Processing your request...', timestamp: Date.now() },
      ]);
      
      // Send chat message to backend
      const chatResponse = await sendChatMessage(prompt);
      
      if (chatResponse.success) {
        // Update AI message with response
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage && lastMessage.sender === 'ai') {
            lastMessage.content = chatResponse.chat_response || 'I understand your request. Let me help you create that animation.';
          }
          return updated;
        });

        // If code was generated, save it and update the editor
        if (chatResponse.code_content) {
          const filename = 'animation_scene.py';
          
          // Save code to backend
          await saveCode(filename, chatResponse.code_content);
          
          // Update file contents
          setFileContents((prev) => ({
            ...prev,
            [filename]: chatResponse.code_content
          }));
          
          // Update file tree
          const newFileNode: FileNode = {
            id: filename,
            name: filename,
            type: 'file',
            children: []
          };
          setFileTree([newFileNode]);
          setSelectedNode(newFileNode);
          setCurrentFileName(filename);
          setActiveTab('code');
          
          // Add success message
          setMessages((prev) => [
            ...prev,
            { id: `msg-${messageCounter++}`, sender: 'ai', content: '✨ Code generated and saved! Check the editor to see your animation.', timestamp: Date.now() },
          ]);
        }
        
        // Start video generation if requested
        if (prompt.toLowerCase().includes('video') || prompt.toLowerCase().includes('animation')) {
          setMessages((prev) => [
            ...prev,
            { id: `msg-${messageCounter++}`, sender: 'ai', content: '🎬 Starting video generation...', timestamp: Date.now() },
          ]);
          
          const videoResponse = await generateVideo(prompt);
          
          if (videoResponse.success) {
            // Poll for video status
            const pollStatus = async () => {
              const status = await getVideoStatus(videoResponse.generation_id);
              
              if (status.status === 'completed') {
                setMessages((prev) => [
                  ...prev,
                  { id: `msg-${messageCounter++}`, sender: 'ai', content: '✅ Video generated successfully! Check the preview panel.', timestamp: Date.now() },
                ]);
                
                // Prefer backend-provided URL/filename from status
                if (status.url) {
                  const url: string = typeof status.url === 'string' ? status.url : '';
                  // If url is relative like "/media/videos/<id>.mp4", prefix API_BASE for the video tag
                  setVideoUrl(url.startsWith('http') ? url : `${API_BASE}${url}`);
                } else if (status.filename) {
                  setVideoUrl(getVideoUrl(status.filename));
                } else {
                  // Fallback: list videos and pick the latest
                  const videos = await listVideos();
                  if (videos.videos && videos.videos.length > 0) {
                    const latestVideo = videos.videos[videos.videos.length - 1];
                    setVideoUrl(getVideoUrl(latestVideo.filename));
                  }
                }
              } else if (status.status === 'error') {
                setMessages((prev) => [
                  ...prev,
                  { id: `msg-${messageCounter++}`, sender: 'ai', content: `❌ Video generation failed: ${status.message}`, timestamp: Date.now() },
                ]);
              } else {
                // Continue polling
                setTimeout(pollStatus, 2000);
              }
            };
            
            pollStatus();
          }
        }
      }
      
    } catch (error) {
      console.error('Chat submission error:', error);
      setMessages((prev) => [
        ...prev,
        { id: `msg-${messageCounter++}`, sender: 'ai', content: '❌ Sorry, I encountered an error. Please try again.', timestamp: Date.now() },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };


  const animationIdeas = [
    "Floating particles forming a logo",
    "3D text rotation with neon glow",
    "Morphing geometric shapes",
    "Liquid metal transitions",
    "Holographic data visualization",
    "Minimalist line art animation",
    "Isometric cityscape",
    "Neon grid with particle effects"
  ];

  const sidebarIcons = [
    { icon: Home, label: 'Home' },
    { icon: ImageIcon, label: 'Gallery' },
    { icon: History, label: 'History' },
    { icon: Settings, label: 'Settings' }
  ];

  if (currentStage === 'welcome') {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background/80 to-background/90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIgLz4KPC9zdmc+')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-gradient-shift" />
        </div>
        
        {/* Fixed left sidebar */}
        <motion.div 
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-6 z-50"
        >
          <div className="flex-1 flex flex-col items-center">
            {sidebarIcons.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="mb-4 relative group"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative overflow-hidden text-muted-foreground hover:text-foreground transition-colors`}
                >
                  <item.icon className={`h-5 w-5`} />
                </Button>
                <span className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main welcome content */}
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
          {/* Animated holographic icon */}
          <motion.div 
            className="mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { 
                type: 'spring', 
                damping: 10, 
                stiffness: 100 
              } 
            }}
          >
            <div className="relative">
              <motion.div 
                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <img 
                src={holographicIcon} 
                alt="Holographic Icon" 
                className="relative z-10 w-28 h-28 opacity-90 drop-shadow-lg"
              />
            </div>
          </motion.div>

          {/* Main greeting */}
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.h1 
              className="text-7xl font-bold mb-6 min-h-[5.5rem] flex items-center justify-center"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary from-10% via-primary via-50% to-primary/80 to-90% dark:from-primary-300 dark:to-primary-500">
                {Array.from(welcomeText).map((char, i) => (
                  <motion.span key={i} variants={item} className="inline-block">
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
                <motion.span 
                  className={`inline-block w-1 h-14 bg-primary ml-2 ${welcomeComplete ? 'opacity-0' : 'animate-pulse'}`}
                  variants={item}
                />
              </span>
            </motion.h1>
            <motion.p 
              className={`text-xl text-muted-foreground ${welcomeComplete ? 'opacity-100' : 'opacity-0'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: welcomeComplete ? 1 : 0, 
                y: welcomeComplete ? 0 : 10 
              }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Ready to create something amazing?
            </motion.p>
          </motion.div>

          {/* Input field */}
          <div className="w-full max-w-2xl mt-8">
            <motion.div 
              className="relative w-full max-w-2xl mx-auto bg-background/80 backdrop-blur-sm border border-border/50 rounded-full overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ 
                opacity: welcomeComplete ? 1 : 0.8,
                y: welcomeComplete ? 0 : 20,
                scale: welcomeComplete ? 1 : 0.98,
                transition: { 
                  duration: 0.5, 
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.2
                } 
              }}
            >
              <div className="relative flex items-center h-16 px-4 gap-2 w-full">
                {/* Input Field */}
                <div className="flex-1 h-full">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userPrompt.trim()) {
                        handleAgentSubmit(userPrompt);
                        setUserPrompt('');
                      }
                    }}
                    placeholder="Describe your animation..."
                    className={`
                      w-full h-full pl-4 pr-4 py-0 text-base bg-background/80 backdrop-blur-sm border-2
                      ${!welcomeComplete 
                        ? 'border-muted-foreground/30 cursor-not-allowed' 
                        : 'border-primary/30 hover:border-primary/50 focus:border-primary/70'
                      }
                      rounded-full focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2
                      placeholder:text-muted-foreground/60 focus:outline-none focus-visible:outline-none
                      transition-all duration-300 ease-out shadow-sm
                    `}
                    disabled={!welcomeComplete}
                  />
                </div>

                {/* Action Buttons Container */}
                <div className="flex items-center gap-1 pr-1">
                  {/* Add Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      disabled={!welcomeComplete}
                    >
                      <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
                    </Button>
                  </motion.div>

                  {/* Image Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      disabled={!welcomeComplete}
                    >
                      <ImageIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    </Button>
                  </motion.div>

                  {/* Send Button */}
                  <motion.div
                    whileHover={isInputValid ? { scale: 1.05 } : {}}
                    whileTap={isInputValid ? { scale: 0.95 } : {}}
                  >
                    <Button
                      type="submit"
                      disabled={!isInputValid}
                      className={`
                        h-9 w-9 rounded-full transition-all duration-300 relative overflow-hidden
                        ${isInputValid 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/30' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed'}
                      `}
                    >
                      <motion.span
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{
                          scale: isInputValid ? [1, 1.1, 1] : 1,
                          opacity: isInputValid ? 1 : 0.6
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: isInputValid ? Infinity : 0,
                          repeatType: 'reverse',
                          ease: 'easeInOut'
                        }}
                      >
                        <Send className={`h-4 w-4 transition-transform ${isInputValid ? 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5' : ''}`} />
                      </motion.span>
                      {isInputValid && (
                        <motion.span 
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Suggestion Chips */}
            <AnimatePresence>
              {welcomeComplete && (
                <motion.div 
                  className="mt-6 flex flex-wrap justify-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { 
                      staggerChildren: 0.1,
                      delayChildren: 0.4
                    } 
                  }}
                >
                  {animationIdeas.slice(0, 3).map((idea, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-4 rounded-full text-sm text-muted-foreground hover:text-foreground border-border/40 hover:border-primary/60 bg-background/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                        onClick={() => {
                          setUserPrompt(idea);
                          setTimeout(() => {
                            inputRef.current?.focus();
                          }, 0);
                        }}
                      >
                        {idea}
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Main container */}
      <div id="studio-container" className="relative z-10 flex h-screen">
        {/* Enhanced Beautiful Left Sidebar */}
        <motion.div 
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-20 shrink-0 relative overflow-hidden"
        >
          {/* Sidebar Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          
          {/* Decorative Elements */}
          <div className="absolute top-1/4 left-1/2 w-1 h-1 bg-primary/30 rounded-full blur-sm" />
          <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-accent/40 rounded-full blur-sm" />
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-primary/20 rounded-full blur-sm" />
          
          <div className="relative h-full flex flex-col items-center py-6 px-2">
            {/* Logo/Brand Section */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-xl ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            </motion.div>

            {/* Navigation Icons */}
            <div className="flex-1 flex flex-col items-center space-y-2">
          {sidebarIcons.map((item, index) => (
                <motion.div 
              key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.1, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  {/* Hover Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm" />
                  
                  <Button
              variant="ghost"
              size="icon"
                    className="relative w-12 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/20"
            >
                    <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </Button>
                  
                  {/* Tooltip */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    className="absolute left-full ml-3 px-3 py-2 bg-background/95 backdrop-blur-xl border border-border/30 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50"
                  >
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <div className="absolute left-0 top-1/2 w-2 h-2 bg-background/95 border-l border-t border-border/30 transform -translate-x-1 -translate-y-1 rotate-45" />
                  </motion.div>
                </motion.div>
          ))}
        </div>

            {/* Bottom Section */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-auto"
            >
              {/* User Profile */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-lg ring-2 ring-accent/20 ring-offset-2 ring-offset-background">
                  <User className="w-5 h-5 text-accent-foreground" />
              </div>
              
                {/* Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-sm">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                </div>
                
                {/* Tooltip */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-3 px-3 py-2 bg-background/95 backdrop-blur-xl border border-border/30 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-50"
                >
                  <div className="text-sm font-medium text-foreground">Animator Pro</div>
                  <div className="text-xs text-muted-foreground">Premium Plan</div>
                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-background/95 border-l border-t border-border/30 transform -translate-x-1 -translate-y-1 rotate-45" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
        {/* Chat Panel - Enhanced Beautiful Design */}
        <div className={`${currentStage === 'studio' && isSidebarOpen ? '' : ''} min-w-0 flex-1 transition-all duration-700 ease-in-out relative overflow-hidden`}>
          {/* Chat Panel Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="relative h-full flex flex-col">
            {/* Enhanced Chat Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="px-3 py-4 border-b border-border/20 bg-background/80 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* AI Assistant Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                      <Sparkles className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background shadow-sm">
                      <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      AI Animation Assistant
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium">Ready to create magic</p>
                  </div>
                </div>
                
                {/* Enhanced Sidebar Toggle Button */}
              {currentStage === 'studio' && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl group"
                  title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                >
                  {isSidebarOpen ? (
                        <ChevronLeft className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  ) : (
                        <ChevronRight className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  )}
                </Button>
                  </motion.div>
              )}
            </div>
              
              {/* Decorative Line */}
              <div className="relative h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mt-4">
                <div className="absolute left-1/2 top-0 w-16 h-px bg-gradient-to-r from-primary/50 to-secondary/50 transform -translate-x-1/2" />
              </div>
            </motion.div>

            {/* Enhanced Conversation History */}
            <div className="flex-1 overflow-y-auto px-1 py-4">
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="text-center mb-16"
                >
                  {/* Welcome Animation */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="mb-8"
                  >
                    <div className="relative mx-auto w-24 h-24 mb-6">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl animate-pulse" />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-2xl ring-4 ring-primary/20 ring-offset-4 ring-offset-background">
                        <Sparkles className="w-10 h-10 text-primary-foreground" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.h1 
                    className="text-5xl font-bold mb-6 min-h-[4rem] flex items-center justify-center"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-secondary">
                      {Array.from(welcomeText).map((char, i) => (
                        <motion.span key={i} variants={item} className="inline-block">
                          {char === ' ' ? '\u00A0' : char}
                        </motion.span>
                      ))}
                      <motion.span 
                        className={`inline-block w-1 h-12 bg-primary ml-2 ${welcomeComplete ? 'opacity-0' : 'animate-pulse'}`}
                        variants={item}
                      />
                    </span>
                  </motion.h1>
                  
                  <motion.p 
                    className={`text-xl text-muted-foreground transition-opacity duration-500 ${welcomeComplete ? 'opacity-100' : 'opacity-0'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: welcomeComplete ? 1 : 0, 
                      y: welcomeComplete ? 0 : 10 
                    }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Ready to create something amazing?
                  </motion.p>
                  
                  {/* Feature Highlights */}
                  <motion.div 
                    className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {[
                      { icon: Video, title: "AI Animation", desc: "Generate stunning animations" },
                      { icon: Code, title: "Smart Code", desc: "Auto-generate code snippets" },
                      { icon: Sparkles, title: "Real-time", desc: "Instant preview & feedback" }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/20 hover:border-primary/30 transition-all duration-300 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                          <feature.icon className="w-4 h-4 text-primary" />
                </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {messages.map((m, index) => (
                    <motion.div 
                      key={m.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} items-start`}
                    >
                      {m.sender === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg ml-1 mr-2">
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      )}
                      
                      <motion.div 
                        className={`max-w-[75%] px-3 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                          m.sender === 'user' 
                            ? 'bg-gradient-to-tr from-primary/90 via-primary/80 to-primary text-primary-foreground rounded-br-md' 
                            : 'bg-background/80 border border-border/30 text-foreground rounded-bl-md hover:border-border/50 transition-colors'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        style={{ marginLeft: m.sender === 'ai' ? 0 : undefined }}
                      >
                        <p className="leading-relaxed text-sm">{m.content}</p>
                      </motion.div>
                      
                      {m.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center ml-3 flex-shrink-0 shadow-lg">
                          <User className="w-4 h-4 text-accent-foreground" />
                    </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Enhanced Input Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="px-3 py-4 border-t border-border/20 bg-background/80 backdrop-blur-xl"
            >
              {/* Enhanced Input Field */}
              <div className="relative">
              <div className="relative flex items-center">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Describe your animation idea..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userPrompt.trim()) {
                        handleAgentSubmit(userPrompt);
                        setUserPrompt('');
                      }
                    }}
                    disabled={!welcomeComplete}
                    className={`
                        w-full h-14 px-6 pr-20 text-base rounded-2xl border-2
                        ${welcomeComplete ? 'border-primary/30 hover:border-primary/50' : 'border-muted'}
                        bg-background/70 backdrop-blur text-foreground shadow-lg
                      focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                        transition-all duration-300 ease-in-out
                        ${!welcomeComplete ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}
                    `}
                  />
                  
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                    <Button
                      type="button"
                      onClick={() => {
                        if (userPrompt.trim()) {
                          handleAgentSubmit(userPrompt);
                          setUserPrompt('');
                        }
                      }}
                      disabled={!userPrompt.trim() || !welcomeComplete}
                      className={`
                            h-10 w-10 rounded-xl transition-all duration-300 shadow-lg
                        ${userPrompt.trim() && welcomeComplete 
                              ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary ring-2 ring-primary/40 hover:ring-primary/60 hover:shadow-xl' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed'}
                      `}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                      </motion.div>
                  </div>
                </div>
              </div>
              
                {/* Enhanced Suggestion Chips */}
              {welcomeComplete && (
                  <motion.div 
                    className="mt-4 flex flex-wrap gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                  {animationIdeas.slice(0, 3).map((idea, index) => (
                      <motion.div
                      key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-block"
                      >
                        <Button
                      variant="outline"
                      size="sm"
                          className="h-9 px-4 rounded-full text-sm text-muted-foreground hover:text-foreground border-border/40 hover:border-primary/60 bg-background/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 hover:bg-primary/5"
                      onClick={() => setUserPrompt(idea)}
                    >
                      {idea}
                    </Button>
                      </motion.div>
                  ))}
                  </motion.div>
              )}
            </div>
            </motion.div>
          </div>
        </div>

        {/* Studio Sidebar - Only visible in studio mode */}
        {currentStage === 'studio' && (
          <motion.div 
            initial={{ x: -320, opacity: 0 }}
            animate={{ 
              x: isSidebarOpen ? 0 : -320, 
              opacity: isSidebarOpen ? 1 : 0 
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed left-0 top-0 h-full w-80 flex flex-col bg-background/95 backdrop-blur-xl border-r border-border/20 shadow-2xl z-50"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border/20 bg-gradient-to-br from-background via-background/95 to-muted/20 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-lg ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Lumen Anima
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium">AI Animation Studio</p>
                  </div>
                </div>
                
                {/* Close Sidebar Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-xl group"
                  title="Close Sidebar"
                >
                  <X className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                </Button>
              </div>
              
              {/* Decorative Line */}
              <div className="relative h-px bg-gradient-to-r from-transparent via-border/50 to-transparent mb-4">
                <div className="absolute left-1/2 top-0 w-16 h-px bg-gradient-to-r from-primary/50 to-secondary/50 transform -translate-x-1/2"></div>
              </div>
              
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl blur-sm"></div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-3 bg-background/80 backdrop-blur-sm border border-border/30 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-300 shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Quick Actions */}
              <div className="p-4 border-b border-border/20">
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start gap-3 h-10 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20"
                    onClick={() => setCurrentStage('welcome')}
                  >
                    <Plus className="w-4 h-4" />
                    New Animation
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start gap-3 h-10 bg-muted/30 hover:bg-muted/50"
                    onClick={() => window.open('/advanced-editor', '_blank')}
                  >
                    <Code className="w-4 h-4" />
                    Advanced Editor
                  </Button>
                </div>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-foreground">Recent Conversations</h3>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Sample History Items - Replace with real data */}
                    <div className="group cursor-pointer">
                      <div className="p-3 rounded-lg border border-border/20 bg-muted/20 hover:bg-muted/30 hover:border-border/30 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-white">AB</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">Bouncing Ball Animation</h4>
                            <p className="text-xs text-muted-foreground truncate">Create a simple bouncing ball with physics...</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">2 min ago</span>
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="group cursor-pointer">
                      <div className="p-3 rounded-lg border border-border/20 bg-muted/20 hover:bg-muted/30 hover:border-border/30 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-white">NN</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">Neural Network Visualization</h4>
                            <p className="text-xs text-muted-foreground truncate">Show neural network connections and data flow...</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">1 hour ago</span>
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="group cursor-pointer">
                      <div className="p-3 rounded-lg border border-border/20 bg-muted/20 hover:bg-muted/30 hover:border-border/30 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-white">PF</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">Particle System Effects</h4>
                            <p className="text-xs text-muted-foreground truncate">Create dynamic particle animations with...</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">3 hours ago</span>
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/50"></div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-border/20 bg-gradient-to-t from-background to-muted/20">
                <div className="space-y-3">
                  {/* User Profile */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground">Animator Pro</h4>
                      <p className="text-xs text-muted-foreground">Premium Plan</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-muted/20 border border-border/20 text-center">
                      <div className="text-lg font-semibold text-foreground">24</div>
                      <div className="text-xs text-muted-foreground">Animations</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20 border border-border/20 text-center">
                      <div className="text-lg font-semibold text-foreground">12</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Resize Handle + Right Panel */}
        <AnimatePresence mode="wait">
          {currentStage === 'studio' && isPanelVisible && (
            <>
              <AnimatePresence>
                {isPanelVisible && (
                  <motion.div
                    key="resize-handle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onMouseDown={startResize}
                    className="w-1 cursor-col-resize bg-border/40 hover:bg-primary/40 transition-colors relative z-10"
                    title="Drag to resize"
                  >
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col justify-center gap-1">
                      <span className="w-0.5 h-6 bg-border rounded"></span>
                      <span className="w-0.5 h-6 bg-border/80 rounded"></span>
                      <span className="w-0.5 h-6 bg-border rounded"></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                key="panel-content"
                className="h-full shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-border/40"
                initial={{ x: '100%', opacity: 0, width: '0%' }}
                animate={{ x: 0, opacity: 1, width: `${codePanelWidthPct}%` }}
                exit={{ x: '100%', opacity: 0, width: '0%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                style={{
                  ...glassEffect,
                  borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
              <div className="h-full flex flex-col">
              {/* Tabs */}
              <div className="border-b border-border/50 px-4">
                    <div className="flex items-center justify-between gap-3">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('preview')}
                    className={`rounded-none border-b-2 ${activeTab === 'preview' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('code')}
                    className={`rounded-none border-b-2 ${activeTab === 'code' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  >
                    Code
                  </Button>
                </div>
                      {/* Panel width control */}
                      <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="whitespace-nowrap">Panel width</span>
                        <input
                          type="range"
                          min={25}
                          max={75}
                          step={1}
                          value={codePanelWidthPct}
                          onChange={(e) => setCodePanelWidthPct(Number(e.target.value))}
                          className="w-40 accent-primary"
                          aria-label="Right panel width"
                          title={`Right panel width: ${codePanelWidthPct}%`}
                        />
                        <span className="tabular-nums w-8 text-right">{codePanelWidthPct}%</span>
              </div>
                    </div>
                  </div>
              {/* Content Area */}
                  <div className="flex-1 p-0 overflow-hidden">
                {activeTab === 'preview' ? (
                  <div className="h-full p-6 flex flex-col rounded-none">
                    {videoUrl ? (
                      // Video is ready - show the video player
                      <div className="flex-1 flex flex-col">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-foreground mb-2">Animation Preview</h3>
                          <p className="text-sm text-muted-foreground">Your generated animation is ready to preview</p>
                        </div>
                        
                        {/* Debug Info */}
                        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Debug: Video URL = {videoUrl}
                          </p>
                        </div>
                        
                        {/* Video Player */}
                        <div className="flex-1 bg-background border border-border/30 rounded-lg overflow-hidden shadow-lg">
                          <div className="px-4 py-3 bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/20 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-foreground">Generated Animation</h4>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.open(videoUrl, '_blank')}
                                className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded text-xs font-medium transition-colors flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Preview Animation
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const filename = videoUrl ? videoUrl.split('/').pop() : '';
                                  if (filename) {
                                    window.open(getDownloadUrl(filename), '_blank');
                                  }
                                }}
                                className="px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded text-xs font-medium transition-colors flex items-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Save as MP4
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const filename = videoUrl ? videoUrl.split('/').pop() : '';
                                  const url = filename ? `/advanced-editor?video=${encodeURIComponent(filename)}` : '/advanced-editor';
                                  window.open(url, '_blank');
                                }}
                                className="px-3 py-1.5 bg-muted text-foreground hover:bg-muted/80 rounded text-xs font-medium transition-colors flex items-center gap-2"
                              >
                                <Code className="w-4 h-4" />
                                Advanced Editor
                              </motion.button>
                            </div>
                          </div>
                          <div className="p-4">
                            <video 
                              controls 
                              className="w-full rounded-lg border border-border/20"
                              style={{ maxHeight: '400px' }}
                              autoPlay={false}
                              muted
                            >
                              <source src={videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                        
                        {/* Video Info */}
                        <div className="mt-4 p-4 bg-muted/20 rounded-lg border border-border/20">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Project:</span>
                              <span className="ml-2 text-foreground font-medium">{currentProjectName}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">File:</span>
                              <span className="ml-2 text-foreground font-medium">{currentFileName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // No video yet - show placeholder
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-muted-foreground">Animation Preview</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {isSubmitting ? 'Generating your animation...' : 'Your animation will appear here once generated'}
                          </p>
                          
                          {/* Debug Info */}
                          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-xs text-yellow-600 dark:text-yellow-400">
                              Debug: No video URL yet | isSubmitting: {isSubmitting.toString()}
                            </p>
                          </div>
                          
                          {isSubmitting && (
                            <div className="mt-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-3 border-t border-border/20">
                      <a href="/advanced-editor">
                        <Button className="relative w-full overflow-hidden rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-medium tracking-wide">
                            Go to Advanced Editor
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                          <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-white/10 to-transparent" />
                          <span className="pointer-events-none absolute -inset-1 rounded-full blur-xl bg-gradient-to-r from-primary/40 via-transparent to-accent/40 opacity-40" />
                        </Button>
                      </a>
                    </div>
                  </div>
                    ) : activeTab === 'code' ? (
                      <div className="h-full flex flex-col bg-background">
                        {/* VS Code-like Top Bar */}
                        <div className="h-8 bg-background/95 backdrop-blur-sm border-b border-border/20 flex items-center justify-between px-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">Lumen Anima Studio</span>
                            <span>•</span>
                            <span>AI-Powered Animation IDE</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"></div>
                          </div>
                        </div>

                        {/* Main IDE Layout */}
                        <div className="flex-1 flex">
                          {/* File Explorer Sidebar */}
                          <div className="w-64 bg-background/95 backdrop-blur-sm border-r border-border/20 flex flex-col">
                            {/* File Explorer Header */}
                            <div className="h-10 bg-muted/20 border-b border-border/20 flex items-center px-3">
                              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                </svg>
                                EXPLORER
                              </div>
                            </div>
                            
                            {/* File Tree */}
                            <div className="flex-1 overflow-y-auto p-2">
                          <AdvancedFileTree
                            tree={fileTree}
                            selectedId={selectedNode?.id ?? null}
                            onSelect={handleFileSelect}
                            onAction={handleTreeAction}
                          />
                        </div>
                          </div>

                          {/* Resize Handle */}
                        <div
                            className="w-1 cursor-col-resize bg-border/40 hover:bg-primary/40 transition-colors relative z-10"
                          onMouseDown={startTreeResize}
                          title="Drag to resize panels"
                          >
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col justify-center gap-1">
                              <span className="w-0.5 h-6 bg-border rounded"></span>
                              <span className="w-0.5 h-6 bg-border/80 rounded"></span>
                              <span className="w-0.5 h-6 bg-border rounded"></span>
                          </div>
                        </div>

                          {/* Main Editor Area */}
                          <div className="flex-1 flex flex-col">
                            {/* Editor Tabs */}
                            <div className="h-10 bg-background/95 backdrop-blur-sm border-b border-border/20 flex items-center">
                              {selectedNode && selectedNode.type === 'file' ? (
                                <div className="flex items-center h-full px-4 bg-background border-r border-border/20 relative">
                                  <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm font-medium text-foreground">{selectedNode.name}</span>
                                  </div>
                                  <div className="absolute top-0 left-0 w-full h-0.5 bg-primary"></div>
                                </div>
                              ) : (
                                <div className="px-4 text-sm text-muted-foreground">No file selected</div>
                              )}
                            </div>

                            {/* Editor Content */}
                            <div className="flex-1 flex flex-col">
                          {/* Success Message */}
                          <AnimatePresence>
                            {showSuccessMessage && (
                              <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mx-4 mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-600 dark:text-green-400"
                              >
                                    {successMessage}
                              </motion.div>
                            )}
                          </AnimatePresence>

                              {/* Code Editor */}
                          {selectedNode && selectedNode.type === 'file' ? (
                                <div className="flex-1 flex flex-col bg-background">
                                  {/* Editor Toolbar */}
                                  <div className="h-8 bg-muted/10 border-b border-border/20 flex items-center justify-between px-4">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Ready to code</span>
                                      <span>•</span>
                                      <span>{fileContents[currentFileName]?.split('\n').length || 1} lines</span>
                                </div>
                                    <div className="flex items-center gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCopyCode}
                                    className="px-2 py-1 bg-muted/20 text-muted-foreground hover:bg-muted/30 rounded text-xs transition-colors flex items-center gap-1"
                                    title="Copy code to clipboard"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                  </motion.button>
                                  {videoUrl && (
                                    <>
                                      <span>•</span>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.open(videoUrl, '_blank')}
                                        className="px-2 py-1 bg-primary/20 text-primary hover:bg-primary/30 rounded text-xs transition-colors flex items-center gap-1"
                                      >
                                        <Eye className="w-3 h-3" />
                                            Preview
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                          const filename = videoUrl ? videoUrl.split('/').pop() : '';
                                          if (filename) {
                                            window.open(getDownloadUrl(filename), '_blank');
                                          }
                                        }}
                                        className="px-2 py-1 bg-secondary/20 text-secondary hover:bg-secondary/30 rounded text-xs transition-colors flex items-center gap-1"
                                      >
                                        <Download className="w-3 h-3" />
                                            Download
                                      </motion.button>
                                    </>
                                  )}
                                </div>
                              </div>

                                                                                                        {/* Professional Code Editor Area */}
                                   <div className="flex-1 flex relative overflow-hidden">
                                     {/* Line Numbers Gutter */}
                                     <div 
                                       id="line-numbers-gutter"
                                       className="w-12 bg-muted/10 border-r border-border/20 text-xs text-muted-foreground select-none overflow-hidden [&::-webkit-scrollbar]:w-0"
                                  style={{
                                         fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                         fontSize: '14px',
                                         lineHeight: '1.5em',
                                       }}
                                     >
                                       <div className="py-1">
                                  {Array.from({ length: Math.max(1, (fileContents[currentFileName] || '').split('\n').length) }, (_, i) => (
                                           <div 
                                             key={i} 
                                             className="px-3 text-right select-none"
                                             style={{ 
                                               height: '1.5em', 
                                               lineHeight: '1.5em',
                                               display: 'flex',
                                               alignItems: 'center',
                                               justifyContent: 'flex-end'
                                             }}
                                           >
                                      {i + 1}
                                    </div>
                                  ))}
                                </div>
                                     </div>
                                     
                                     {/* Code Editor Container */}
                                     <div className="flex-1 relative overflow-hidden">
                                       {/* Hidden textarea for input handling */}
                                  <textarea
                                         id="code-textarea"
                                         className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-foreground resize-none border-0 focus:outline-none focus:ring-0 z-10"
                                    value={fileContents[currentFileName] ?? ''}
                                    onChange={(e) => setFileContents((prev) => ({ ...prev, [currentFileName]: e.target.value }))}
                                    spellCheck={false}
                                    placeholder="💡 Tip: Type what you want and I'll generate the code for you."
                                    style={{
                                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                      fontSize: '14px',
                                           lineHeight: '1.5em',
                                           padding: '0.25rem 0.5rem',
                                           whiteSpace: 'pre',
                                           overflowWrap: 'normal',
                                           wordBreak: 'normal',
                                    }}
                                    onScroll={e => {
                                      const gutter = document.getElementById('line-numbers-gutter');
                                           const codeDisplay = document.getElementById('code-display');
                                           if (gutter) {
                                             gutter.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
                                           }
                                           if (codeDisplay) {
                                             codeDisplay.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
                                           }
                                         }}
                                       />
                                       
                                       {/* Visible code display with syntax highlighting */}
                                       <pre
                                         id="code-display"
                                         className="absolute inset-0 w-full h-full bg-background text-foreground font-mono overflow-auto pointer-events-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-400/30 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-400/50"
                                         style={{
                                           fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                           fontSize: '14px',
                                           lineHeight: '1.5em',
                                           padding: '0.25rem 0.5rem',
                                           whiteSpace: 'pre',
                                           overflowWrap: 'normal',
                                           wordBreak: 'normal',
                                         }}
                                       >
                                         <code>
                                           {(() => {
                                             const content = fileContents[currentFileName] ?? '';
                                             const lines = content.split('\n');
                                             
                                             return lines.map((line, lineIndex) => {
                                               // Basic syntax highlighting for common patterns
                                               const highlightedLine = line
                                                 .replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|super|this|new|async|await|try|catch|finally|throw|default|switch|case|break|continue|true|false|null|undefined)\b/g, 
                                                   '<span class="text-blue-400 font-semibold">$1</span>')
                                                 .replace(/\b(React|useState|useEffect|useRef|motion|AnimatePresence|Button|Input|Select|div|span|className|onClick|onChange|style|key|id)\b/g, 
                                                   '<span class="text-purple-400 font-semibold">$1</span>')
                                                 .replace(/\b(console\.log|console\.error|console\.warn)\b/g, 
                                                   '<span class="text-yellow-400">$1</span>')
                                                 .replace(/(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g, 
                                                   '<span class="text-green-400">$1$2$1</span>')
                                                 .replace(/(\/\/.*)/g, 
                                                   '<span class="text-gray-500 italic">$1</span>')
                                                 .replace(/(\/\*[\s\S]*?\*\/)/g, 
                                                   '<span class="text-gray-500 italic">$1</span>')
                                                 .replace(/\b(\d+\.?\d*)\b/g, 
                                                   '<span class="text-orange-400">$1</span>');
                                               
                                               return (
                                                 <div 
                                                   key={lineIndex}
                                                   className="min-h-[1.5em] leading-[1.5em]"
                                                   dangerouslySetInnerHTML={{ __html: highlightedLine || ' ' }}
                                                 />
                                               );
                                             });
                                           })()}
                                         </code>
                                       </pre>
                                  
                                  {/* AI Suggestion Ghost Text */}
                                  <AnimatePresence>
                                    {showAISuggestion && aiSuggestion && (
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                             className="absolute inset-0 pointer-events-none z-20"
                                        style={{
                                          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                          fontSize: '14px',
                                               lineHeight: '1.5em',
                                               padding: '0.25rem 0.5rem',
                                        }}
                                      >
                                        <div className="text-muted-foreground/40">
                                          {fileContents[currentFileName]?.split('\n').map((line, index) => (
                                                 <div 
                                                   key={index} 
                                                   className="min-h-[1.5em] leading-[1.5em]"
                                                   style={{ height: '1.5em' }}
                                                 >
                                              {index === fileContents[currentFileName]?.split('\n').length - 1 && line.trim() === '' ? aiSuggestion : ''}
                                            </div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  
                                  {/* AI Suggestion Loading Indicator */}
                                  <AnimatePresence>
                                    {isGeneratingSuggestion && (
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                             className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg text-xs z-30"
                                      >
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                                        AI thinking...
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                       
                                </div>
                              </div>

                                  {/* Status Bar */}
                                  <div className="h-6 bg-muted/10 border-t border-border/20 flex items-center justify-between px-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-4">
                                      <span>AI Assistant Active</span>
                                  <span>•</span>
                                      <span>{currentFileName.split('.').pop()?.toUpperCase() || 'TEXT'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                      <span>Ln {fileContents[currentFileName]?.split('\n').length || 1}</span>
                                  <span>•</span>
                                      <span>Col 1</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="text-center text-muted-foreground">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm">Select a file to start editing</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
              </div>
              </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
};

export default AnimationStudio;
