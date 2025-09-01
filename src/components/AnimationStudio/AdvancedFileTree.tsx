import React, { useState, useRef, useEffect } from 'react';
import { Folder, FolderOpen, File as FileIcon, MoreVertical, ChevronRight, ChevronDown, Plus, Trash2, Pencil, FileText, FolderPlus } from 'lucide-react';

export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
};

interface AdvancedFileTreeProps {
  tree: FileNode[];
  selectedId: string | null;
  onSelect: (node: FileNode) => void;
  onAction?: (action: 'new-file' | 'new-folder' | 'rename' | 'delete' | 'move', node: FileNode, newName?: string, targetParentId?: string) => void;
}

type RowProps = {
  depth: number;
  node: FileNode;
  selectedId: string | null;
  onSelect: (n: FileNode) => void;
  onAction?: AdvancedFileTreeProps['onAction'];
  onCreateNew?: (type: 'file' | 'folder', parentId: string) => void;
  creatingNew?: { type: 'file' | 'folder'; parentId: string } | null;
  onNewItemSubmit?: (name: string) => void;
  onNewItemCancel?: () => void;
  onDragStart?: (e: React.DragEvent, node: FileNode) => void;
  onDragOver?: (e: React.DragEvent, node: FileNode) => void;
  onDrop?: (e: React.DragEvent, targetNode: FileNode) => void;
  draggedNode?: FileNode | null;
  dropTarget?: FileNode | null;
};

const Row: React.FC<RowProps> = ({ 
  depth, 
  node, 
  selectedId, 
  onSelect, 
  onAction, 
  onCreateNew,
  creatingNew,
  onNewItemSubmit,
  onNewItemCancel,
  onDragStart,
  onDragOver,
  onDrop,
  draggedNode,
  dropTarget
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const isFolder = node.type === 'folder';
  const isSelected = selectedId === node.id;
  const isCreatingNew = creatingNew?.parentId === node.id;
  const isDragging = draggedNode?.id === node.id;
  const isDropTarget = dropTarget?.id === node.id;

  // Helper function to check if a node is a descendant of another
  const isDescendant = (potentialDescendant: FileNode, ancestor: FileNode): boolean => {
    if (!ancestor.children) return false;
    return ancestor.children.some(child => 
      child.id === potentialDescendant.id || isDescendant(potentialDescendant, child)
    );
  };

  const canDrop = isFolder && draggedNode && draggedNode.id !== node.id && !isDescendant(draggedNode, node);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus rename input when renaming starts
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  // Focus new item input when creating starts
  useEffect(() => {
    if (isCreatingNew && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [isCreatingNew]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowContextMenu(true);
  };

  const handleRename = () => {
    setIsRenaming(true);
    setShowContextMenu(false);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onAction?.('rename', node, renameValue.trim());
    }
    setIsRenaming(false);
    setRenameValue(node.name);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameValue(node.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleNewItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value.trim();
      if (value) {
        onNewItemSubmit?.(value);
      }
    } else if (e.key === 'Escape') {
      onNewItemCancel?.();
    }
  };

  const handleAction = (action: 'new-file' | 'new-folder' | 'rename' | 'delete') => {
    setShowContextMenu(false);
    if (action === 'rename') {
      handleRename();
    } else if (action === 'new-file' || action === 'new-folder') {
      onCreateNew?.(action === 'new-file' ? 'file' : 'folder', node.id);
    } else {
      onAction?.(action, node);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    console.log('=== DRAG START ===');
    console.log('Dragging node:', node.name, 'ID:', node.id);
    e.stopPropagation();
    onDragStart?.(e, node);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
    console.log('Drag started successfully');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== DRAG OVER ===');
    console.log('Over node:', node.name, 'ID:', node.id);
    console.log('Can drop:', canDrop);
    console.log('Dragged node:', draggedNode?.name);
    e.dataTransfer.dropEffect = canDrop ? 'move' : 'none';
    onDragOver?.(e, node);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('=== DROP ===');
    console.log('Dropping on node:', node.name, 'ID:', node.id);
    console.log('Can drop:', canDrop);
    console.log('Dragged node:', draggedNode?.name);
    if (canDrop && draggedNode) {
      console.log('Executing drop...');
      onDrop?.(e, node);
    } else {
      console.log('Drop cancelled - invalid target or no dragged node');
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-muted/40 transition-all duration-200 ${
          isSelected ? 'bg-primary/10 text-primary' : ''
        } ${
          isDragging ? 'opacity-50 bg-muted/20' : ''
        } ${
          isDropTarget && canDrop ? 'bg-primary/20 border-2 border-primary/50' : ''
        } ${
          isDropTarget && !canDrop ? 'bg-destructive/10 border-2 border-destructive/50' : ''
        }`}
        style={{ 
          paddingLeft: depth * 14 + 8,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onClick={() => onSelect(node)}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        title={isDragging ? 'Dragging...' : canDrop ? 'Drop here to move' : 'Drag to move'}
      >
        {isFolder ? (
          <button
            className="h-5 w-5 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <span className="h-5 w-5" />
        )}
        {isFolder ? (
          expanded ? <FolderOpen className="h-4 w-4 text-muted-foreground" /> : <Folder className="h-4 w-4 text-muted-foreground" />
        ) : (
          <FileIcon className="h-4 w-4 text-muted-foreground" />
        )}
        
        {isRenaming ? (
          <input
            ref={renameInputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleRenameSubmit}
            className="flex-1 text-sm bg-background border border-primary/50 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm truncate flex-1">{node.name}</span>
        )}
        
        <div className="relative">
          <button
            className="p-1 rounded hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setShowContextMenu(!showContextMenu); }}
            aria-label="Actions"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {/* Context Menu */}
          {showContextMenu && (
            <div
              ref={contextMenuRef}
              className="absolute right-0 mt-1 bg-background border border-border/40 rounded-lg shadow-lg z-50 min-w-48 py-1"
            >
              {isFolder && (
                <>
                  <button
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40"
                    onClick={() => handleAction('new-file')}
                  >
                    <FileText className="h-4 w-4" />
                    New File
                  </button>
                  <button
                    className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40"
                    onClick={() => handleAction('new-folder')}
                  >
                    <FolderPlus className="h-4 w-4" />
                    New Folder
                  </button>
                  <div className="border-t border-border/20 my-1"></div>
                </>
              )}
              <button
                className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40"
                onClick={() => handleAction('rename')}
              >
                <Pencil className="h-4 w-4" />
                Rename
              </button>
              <button
                className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40 text-destructive"
                onClick={() => handleAction('delete')}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Inline new item creation */}
      {isCreatingNew && (
        <div
          className="flex items-center gap-2 px-2 py-1"
          style={{ paddingLeft: (depth + 1) * 14 + 8 }}
        >
          <span className="h-5 w-5" />
          {creatingNew.type === 'file' ? (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          <input
            ref={newItemInputRef}
            type="text"
            placeholder={creatingNew.type === 'file' ? 'file.tsx' : 'folder-name'}
            onKeyDown={handleNewItemKeyDown}
            onBlur={() => onNewItemCancel?.()}
            className="flex-1 text-sm bg-background border border-primary/50 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      {isFolder && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <Row 
              key={child.id} 
              depth={depth + 1} 
              node={child} 
              selectedId={selectedId} 
              onSelect={onSelect} 
              onAction={onAction}
              onCreateNew={onCreateNew}
              creatingNew={creatingNew}
              onNewItemSubmit={onNewItemSubmit}
              onNewItemCancel={onNewItemCancel}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              draggedNode={draggedNode}
              dropTarget={dropTarget}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AdvancedFileTree: React.FC<AdvancedFileTreeProps> = ({ tree, selectedId, onSelect, onAction }) => {
  const [creatingNew, setCreatingNew] = useState<{ type: 'file' | 'folder'; parentId: string } | null>(null);
  const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
  const [dropTarget, setDropTarget] = useState<FileNode | null>(null);

  const handleCreateNew = (type: 'file' | 'folder', parentId: string) => {
    setCreatingNew({ type, parentId });
  };

  // Helper function to find a node by ID in the tree
  const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleNewItemSubmit = (name: string) => {
    if (creatingNew) {
      // For root-level creation, pass a dummy root node
      if (creatingNew.parentId === 'root') {
        const rootNode = { id: 'root', name: 'root', type: 'folder' as const };
        onAction?.(creatingNew.type === 'file' ? 'new-file' : 'new-folder', rootNode, name);
      } else {
        // Find the actual parent node in the tree
        const parentNode = findNodeById(tree, creatingNew.parentId);
        if (parentNode) {
          onAction?.(creatingNew.type === 'file' ? 'new-file' : 'new-folder', parentNode, name);
        }
      }
      setCreatingNew(null);
    }
  };

  const handleNewItemCancel = () => {
    setCreatingNew(null);
  };

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    console.log('=== MAIN DRAG START ===');
    console.log('Setting dragged node:', node.name, 'ID:', node.id);
    setDraggedNode(node);
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    console.log('=== MAIN DRAG OVER ===');
    console.log('Setting drop target:', node.name, 'ID:', node.id);
    setDropTarget(node);
  };

  const handleDrop = (e: React.DragEvent, targetNode: FileNode) => {
    console.log('=== MAIN DROP ===');
    console.log('Target node:', targetNode.name, 'ID:', targetNode.id);
    console.log('Dragged node:', draggedNode?.name, 'ID:', draggedNode?.id);
    
    if (draggedNode && targetNode.type === 'folder' && draggedNode.id !== targetNode.id) {
      console.log('Calling move action...');
      onAction?.('move', draggedNode, undefined, targetNode.id);
    } else {
      console.log('Drop conditions not met:');
      console.log('- draggedNode exists:', !!draggedNode);
      console.log('- targetNode is folder:', targetNode.type === 'folder');
      console.log('- not dropping on self:', draggedNode?.id !== targetNode.id);
    }
    setDraggedNode(null);
    setDropTarget(null);
  };

  // Clear drag state when drag ends
  useEffect(() => {
    const handleDragEnd = () => {
      console.log('=== DRAG END ===');
      console.log('Clearing drag state');
      setDraggedNode(null);
      setDropTarget(null);
    };

    const handleDragLeave = () => {
      console.log('=== DRAG LEAVE ===');
      setDropTarget(null);
    };

    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('dragleave', handleDragLeave);
    return () => {
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('dragleave', handleDragLeave);
    };
  }, []);

  return (
    <div className="w-full h-full bg-background border-r border-border/20 overflow-auto group">
      <div className="px-2 py-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground">FILES</h3>
        <div className="flex gap-1">
          <button
            className="p-1 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground"
            onClick={() => handleCreateNew('file', 'root')}
            title="New file at root level"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            className="p-1 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground"
            onClick={() => handleCreateNew('folder', 'root')}
            title="New folder at root level"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Root-level new item creation */}
      {creatingNew?.parentId === 'root' && (
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="h-5 w-5" />
          {creatingNew.type === 'file' ? (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          <input
            type="text"
            placeholder={creatingNew.type === 'file' ? 'file.tsx' : 'folder-name'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  handleNewItemSubmit(value);
                }
              } else if (e.key === 'Escape') {
                handleNewItemCancel();
              }
            }}
            onBlur={() => handleNewItemCancel()}
            className="flex-1 text-sm bg-background border border-primary/50 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>
      )}
      
      <div className="pb-2">
        {tree.map((node) => (
          <Row 
            key={node.id} 
            depth={0} 
            node={node} 
            selectedId={selectedId} 
            onSelect={onSelect} 
            onAction={onAction}
            onCreateNew={handleCreateNew}
            creatingNew={creatingNew}
            onNewItemSubmit={handleNewItemSubmit}
            onNewItemCancel={handleNewItemCancel}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedNode={draggedNode}
            dropTarget={dropTarget}
          />
        ))}
      </div>
    </div>
  );
};

export default AdvancedFileTree;
