#!/usr/bin/env python3
"""
Startup script for Lumen Anima FastAPI Backend
"""

import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Set up environment
    os.environ.setdefault("PYTHONPATH", str(Path(__file__).parent))
    
    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
