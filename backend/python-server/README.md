# Lumen Anima FastAPI Backend

A FastAPI-based backend for the Lumen Anima animation studio, providing AI-powered chat, code generation, and video creation capabilities.

## Features

- 🤖 **AI Chat Integration**: Connect with Google ADK agents for intelligent responses
- 🎬 **Video Generation**: Generate Manim animations from natural language descriptions
- 💾 **Code Management**: Save, retrieve, and manage animation code files
- 📹 **Video Serving**: Stream and download generated videos
- 🔄 **Real-time Status**: Track video generation progress
- 🌐 **CORS Support**: Full frontend integration support

## API Endpoints

### Chat & AI
- `POST /chat` - Send messages to AI agent
- `POST /generate-video` - Start video generation
- `GET /video-status/{generation_id}` - Check video generation status

### Code Management
- `POST /save-code` - Save code to file
- `GET /code/{filename}` - Retrieve code from file
- `GET /list-files` - List all code files

### Video Management
- `GET /video/{filename}` - Stream video file
- `GET /download-video/{filename}` - Download video file
- `GET /list-videos` - List all available videos

## Setup Instructions

### 1. Install Dependencies

```bash
# Using pip
pip install -r requirements.txt

# Or using uv (recommended)
uv pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
# Google AI API Key
GOOGLE_API_KEY=your_google_api_key_here

# Database URL (optional, defaults to SQLite)
DATABASE_URL=sqlite:///./my_agent_data.db
```

### 3. Run the Server

```bash
# Using the startup script
python start_server.py

# Or directly with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Integration

The backend is configured to work with the React frontend running on:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev server)

## Directory Structure

```
backend/python-server/
├── main.py                 # FastAPI application
├── start_server.py         # Server startup script
├── requirements.txt        # Python dependencies
├── ai_agent/              # AI agent modules
│   ├── agent.py           # Root agent configuration
│   ├── generate_video.py  # Video generation logic
│   └── sub_agents/        # Sub-agent implementations
├── manim_generated_files/ # Generated animation code
├── media/                 # Generated videos and assets
│   └── videos/           # MP4 video files
└── my_agent_data.db      # SQLite database
```

## Usage Examples

### Chat with AI
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a bouncing ball animation", "user_id": "user123"}'
```

### Generate Video
```bash
curl -X POST "http://localhost:8000/generate-video" \
  -H "Content-Type: application/json" \
  -d '{"message": "A rotating cube with changing colors", "user_id": "user123"}'
```

### Save Code
```bash
curl -X POST "http://localhost:8000/save-code" \
  -H "Content-Type: application/json" \
  -d '{"filename": "my_animation.py", "content": "from manim import *\n\nclass MyScene(Scene):\n    def construct(self):\n        pass"}'
```

## Development

### Adding New Endpoints

1. Add the endpoint to `main.py`
2. Update the frontend API utilities in `src/components/AnimationStudio/index.tsx`
3. Test the integration

### Debugging

- Check the server logs for detailed error messages
- Use the `/` endpoint to verify the server is running
- Monitor the SQLite database for agent session data

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the frontend URL is in the allowed origins
2. **Video Generation Fails**: Check that Manim and uv are properly installed
3. **AI Agent Errors**: Verify Google API key is set correctly
4. **File Permissions**: Ensure write permissions for media and manim_generated_files directories

### Logs

The server provides detailed logging. Check the console output for:
- API request/response logs
- Video generation progress
- AI agent interactions
- File system operations

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Update documentation for new features
4. Test with the frontend integration
