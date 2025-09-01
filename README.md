# Lumen Anima - AI-Powered Animation Studio

A modern, AI-first animation studio that combines the power of Google's AI agents with Manim to create stunning animations from natural language descriptions.

## ✨ Features

- 🤖 **AI-Powered Chat**: Natural language animation creation
- 🎬 **Real-time Video Generation**: Instant Manim animation rendering
- 💻 **Modern Code Editor**: Clean, AI-enhanced coding experience
- 📹 **Video Preview & Download**: Stream and download generated animations
- 🔄 **Real-time Status**: Track video generation progress
- 🌐 **Full-stack Integration**: Seamless frontend-backend communication

## 🏗️ Architecture

```
Lumen Anima/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   └── AnimationStudio/  # Main studio component
│   │   └── pages/
│   └── package.json
├── backend/
│   └── python-server/        # FastAPI + Google ADK
│       ├── ai_agent/         # AI agent modules
│       ├── main.py           # FastAPI application
│       └── requirements.txt
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google AI API Key

### 1. Backend Setup

```bash
cd backend/python-server

# Run setup script
python setup.py

# Update .env file with your Google API key
# Edit .env and set GOOGLE_API_KEY=your_key_here

# Start the server
python start_server.py
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Test the System

```bash
# Test backend (in backend/python-server/)
python test_backend.py

# Frontend will be available at http://localhost:5173
# Backend API at http://localhost:8000
```

## 🎯 Usage

### Creating Animations

1. **Open the Studio**: Navigate to the Animation Studio
2. **Describe Your Animation**: Type natural language descriptions like:
   - "Create a bouncing ball with a trail"
   - "A rotating cube with changing colors"
   - "A particle system explosion"
3. **AI Generates Code**: The AI creates Manim code automatically
4. **Video Generation**: Animations are rendered in real-time
5. **Preview & Download**: View and download your creations

### Code Editor Features

- **Smart Scaffolding**: Auto-generates relevant code templates
- **Copy Functionality**: One-click code copying
- **File Management**: Organize and manage animation files
- **Real-time Updates**: See changes instantly

## 🔧 API Endpoints

### Chat & AI
- `POST /chat` - Send messages to AI agent
- `POST /generate-video` - Start video generation
- `GET /video-status/{id}` - Check generation status

### Code Management
- `POST /save-code` - Save animation code
- `GET /code/{filename}` - Retrieve code
- `GET /list-files` - List all files

### Video Management
- `GET /video/{filename}` - Stream video
- `GET /download-video/{filename}` - Download video
- `GET /list-videos` - List all videos

## 🛠️ Development

### Backend Development

```bash
cd backend/python-server

# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
python test_backend.py
```

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Adding New Features

1. **Backend**: Add endpoints to `main.py`
2. **Frontend**: Update API utilities in `AnimationStudio/index.tsx`
3. **AI Agents**: Extend agents in `ai_agent/` directory
4. **Testing**: Add tests to `test_backend.py`

## 🎨 UI/UX Features

### Modern Design
- **Dark Mode**: Beautiful dark theme with neon accents
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Layout**: Works on all screen sizes
- **Intuitive Navigation**: Easy-to-use interface

### AI-First Experience
- **Natural Language**: Chat with AI like a coding buddy
- **Smart Suggestions**: Context-aware code recommendations
- **Proactive Help**: AI suggests improvements automatically
- **Conversational Flow**: Friendly, helpful interactions

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure frontend URL is in allowed origins
   - Check backend is running on correct port

2. **Video Generation Fails**
   - Verify Manim installation: `manim --version`
   - Check Google API key is set correctly
   - Ensure write permissions for media directory

3. **AI Agent Errors**
   - Verify Google API key in `.env` file
   - Check network connectivity
   - Review server logs for detailed errors

### Debug Mode

```bash
# Backend with verbose logging
uvicorn main:app --reload --log-level debug

# Frontend with React DevTools
npm run dev
```

## 📁 Project Structure

```
lumen-anima/
├── src/
│   ├── components/
│   │   └── AnimationStudio/
│   │       ├── index.tsx          # Main studio component
│   │       ├── FileTree.tsx       # File management
│   │       └── AdvancedFileTree.tsx
│   ├── pages/
│   │   ├── Index.tsx              # Landing page
│   │   └── StudioPage.tsx         # Studio page
│   └── main.tsx                   # App entry point
├── backend/
│   └── python-server/
│       ├── main.py                # FastAPI app
│       ├── ai_agent/
│       │   ├── agent.py           # Root agent
│       │   ├── generate_video.py  # Video generation
│       │   └── sub_agents/        # Specialized agents
│       ├── media/                 # Generated videos
│       ├── manim_generated_files/ # Generated code
│       └── requirements.txt       # Python dependencies
├── package.json                   # Frontend dependencies
└── README.md                      # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- **Frontend**: TypeScript, ESLint, Prettier
- **Backend**: Python, Black, Flake8
- **Commits**: Conventional commits format

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Manim**: Mathematical animation engine
- **Google ADK**: AI agent development kit
- **FastAPI**: Modern Python web framework
- **React**: Frontend framework
- **Framer Motion**: Animation library

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: This README and inline code comments

---

**Made with ❤️ by the Lumen Anima Team**
