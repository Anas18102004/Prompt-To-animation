from pathlib import Path
from typing import Union
import logging

def write_file(path: str, content: str) -> bool:
    """
    Create a new file or completely overwrite an existing file with new content.
    Optimized for AI agent use with robust error handling and validation.
    
    Args:
        path (str or Path): The path to the file where content will be written.
        content (str): The content to write to the file.
        
    Returns:
        bool: True if file was written successfully, False otherwise.     
    """

    try:
        # Convert to Path object for better path handling
        file_path = Path(path).resolve()
        
        with open(file_path, "w", encoding="utf-8", newline='') as f:
            f.write(content)
                    
        # Log success for agent debugging
        logging.debug(f"Successfully wrote {len(content)} characters to {file_path}")
        return True
        
    except PermissionError as e:
        logging.error(f"Permission denied writing to {path}: {e}")
        raise OSError(f"Permission denied: Cannot write to {path}") from e
        
    except FileNotFoundError as e:
        logging.error(f"Invalid path {path}: {e}")
        raise OSError(f"Invalid path or drive not accessible: {path}") from e
        
    except OSError as e:
        logging.error(f"OS error writing to {path}: {e}")
        raise OSError(f"Failed to write file {path}: {e}") from e
        
    except Exception as e:
        logging.error(f"Unexpected error writing to {path}: {e}")
        # Clean up temp file if it exists
        raise OSError(f"Unexpected error writing to {path}: {e}") from e