#!/usr/bin/env python3
"""
Setup script for Lumen Anima Backend
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        print(f"   Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing dependencies...")
    
    # Try uv first, then pip
    if run_command("uv --version", "Checking uv availability"):
        return run_command("uv pip install -r requirements.txt", "Installing dependencies with uv")
    else:
        print("⚠️  uv not found, using pip...")
        return run_command("pip install -r requirements.txt", "Installing dependencies with pip")

def create_directories():
    """Create necessary directories"""
    print("\n📁 Creating directories...")
    
    directories = [
        "media",
        "media/videos", 
        "manim_generated_files"
    ]
    
    for directory in directories:
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_file = Path(".env")
    if not env_file.exists():
        print("\n🔧 Creating .env file...")
        env_content = """# Google AI API Key
GOOGLE_API_KEY=your_google_api_key_here

# Database URL (optional, defaults to SQLite)
DATABASE_URL=sqlite:///./my_agent_data.db

# Server Configuration
HOST=0.0.0.0
PORT=8000
"""
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Created .env file")
        print("⚠️  Please update GOOGLE_API_KEY in .env file")
    else:
        print("✅ .env file already exists")

def check_manim():
    """Check if Manim is properly installed"""
    print("\n🎬 Checking Manim installation...")
    if run_command("manim --version", "Checking Manim"):
        print("✅ Manim is properly installed")
        return True
    else:
        print("❌ Manim installation check failed")
        print("💡 You may need to install Manim separately")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up Lumen Anima Backend...")
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Create .env file
    create_env_file()
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Check Manim
    check_manim()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update GOOGLE_API_KEY in .env file")
    print("2. Run: python start_server.py")
    print("3. Test with: python test_backend.py")
    print("4. Frontend will connect to http://localhost:8000")

if __name__ == "__main__":
    main()
