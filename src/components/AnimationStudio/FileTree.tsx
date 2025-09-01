import React from 'react';

interface FileTreeProps {
  files: string[];
  selectedFile: string | null;
  onSelect: (file: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ files, selectedFile, onSelect }) => {
  return (
    <div className="w-full h-full p-2 bg-background border-r border-border/20 overflow-y-auto">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2">FILES</h3>
      <ul className="space-y-1">
        {files.length === 0 ? (
          <li className="text-xs text-muted-foreground">No files created yet</li>
        ) : (
          files.map((file) => (
            <li key={file}>
              <button
                className={`w-full text-left px-2 py-1 rounded transition-colors text-sm ${selectedFile === file ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted/40'}`}
                onClick={() => onSelect(file)}
              >
                {file}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FileTree;
