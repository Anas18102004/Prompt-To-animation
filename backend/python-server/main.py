import asyncio
import json
import os
from pathlib import Path
import uuid
from datetime import datetime
import aiofiles
import subprocess
import shutil
from dotenv import load_dotenv

# Load environment variables at the very beginning
load_dotenv()

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from ai_agent.generate_video import generate_video
from ai_agent.agent import root_agent
from google.adk.sessions import DatabaseSessionService
from google.adk.runners import Runner
from google.genai.types import Content, Part

app = FastAPI(title="Lumen Anima Backend", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
base_path = Path(__file__).parent
media_path = base_path / "media"
videos_path = media_path / "videos"
manim_files_path = base_path / "manim_generated_files"

# Ensure directories exist
media_path.mkdir(exist_ok=True)
videos_path.mkdir(exist_ok=True)
manim_files_path.mkdir(exist_ok=True)

# Mount static files for video serving
app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

# Data models
class ChatMessage(BaseModel):
    message: str
    user_id: Optional[str] = "user123"

class CodeRequest(BaseModel):
    filename: str
    content: str

class VideoRequest(BaseModel):
    message: str
    user_id: Optional[str] = "user123"

# Global state for tracking video generation
video_generation_status = {}
current_project_data = {}

@app.get("/")
async def root():
    return {"message": "Lumen Anima Backend API", "status": "running"}

@app.post("/chat")
async def chat_endpoint(request: ChatMessage):
    """Handle chat messages and return AI responses"""
    try:
        app_name = "lumen_anima_app"
        user_id = request.user_id

        # Initialize session
        db_url = "sqlite:///./my_agent_data.db"
        session_service = DatabaseSessionService(db_url=db_url)
        session = await session_service.create_session(
            app_name=app_name,
            user_id=user_id
        )
        
        runner = Runner(
            agent=root_agent,
            app_name=app_name,
            session_service=session_service
        )

        user_message = Content(role='user', parts=[Part(text=request.message)])
        
        # Collect all responses for streaming
        responses = []
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session.id,
            new_message=user_message
        ):
            if event.is_final_response():
                if (
                    event.content
                    and event.content.parts
                    and hasattr(event.content.parts[0], "text")
                    and event.content.parts[0].text
                ):
                    final_response = event.content.parts[0].text.strip()
                    responses.append(final_response)
        
        await runner.close()
        
        # Process the response to extract code if present
        code_content = ""
        chat_response = ""
        
        if responses:
            full_response = responses[-1]
            
            # Extract code blocks
            if "```python" in full_response:
                code_start = full_response.find("```python") + 9
                code_end = full_response.find("```", code_start)
                if code_end != -1:
                    code_content = full_response[code_start:code_end].strip()
                    chat_response = full_response.replace(f"```python\n{code_content}\n```", "").strip()
                else:
                    chat_response = full_response
            else:
                chat_response = full_response
        
        return {
            "success": True,
            "chat_response": chat_response,
            "code_content": code_content,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@app.post("/generate-video")
async def generate_video_endpoint(request: VideoRequest, background_tasks: BackgroundTasks):
    """Generate video from user message"""
    try:
        generation_id = str(uuid.uuid4())
        video_generation_status[generation_id] = {
            "status": "processing",
            "message": "Starting video generation...",
            "progress": 0
        }
        
        # Start video generation in background
        background_tasks.add_task(
            process_video_generation,
            request.message,
            request.user_id,
            generation_id
        )
        
        return {
            "success": True,
            "generation_id": generation_id,
            "message": "Video generation started"
        }
        
    except Exception as e:
        print(f"Video generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Video generation error: {str(e)}")

async def process_video_generation(message: str, user_id: str, generation_id: str):
    """Background task for video generation"""
    try:
        video_generation_status[generation_id]["status"] = "processing"
        video_generation_status[generation_id]["message"] = "Analyzing your request..."
        video_generation_status[generation_id]["progress"] = 10
        
        # Generate video using existing function (now returns dict with video info)
        result = await generate_video(message, generation_id=generation_id)
        
        video_generation_status[generation_id]["status"] = "completed"
        video_generation_status[generation_id]["message"] = "Video generated successfully!"
        video_generation_status[generation_id]["progress"] = 100
        video_generation_status[generation_id]["result"] = result
        # Bubble up convenient fields for the UI
        if isinstance(result, dict):
            video_generation_status[generation_id]["filename"] = result.get("video_filename")
            video_generation_status[generation_id]["url"] = result.get("video_url")
        
    except Exception as e:
        print(f"Video generation background error: {str(e)}")
        video_generation_status[generation_id]["status"] = "error"
        video_generation_status[generation_id]["message"] = f"Error: {str(e)}"
        video_generation_status[generation_id]["progress"] = 0

@app.get("/video-status/{generation_id}")
async def get_video_status(generation_id: str):
    """Get video generation status"""
    if generation_id in video_generation_status:
        return video_generation_status[generation_id]

    # Fallback after reload: if file exists in media/videos/{generation_id}.mp4, synthesize a completed status
    video_path = videos_path / f"{generation_id}.mp4"
    if video_path.exists():
        return {
            "status": "completed",
            "message": "Video ready",
            "progress": 100,
            "filename": video_path.name,
            "url": f"/media/videos/{video_path.name}",
        }

    raise HTTPException(status_code=404, detail="Generation ID not found")

@app.get("/video/{filename}")
async def get_video(filename: str):
    """Serve video files"""
    video_path = videos_path / filename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=filename
    )

@app.get("/download-video/{filename}")
async def download_video(filename: str):
    """Download video file"""
    video_path = videos_path / filename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    
    return FileResponse(
        path=str(video_path),
        media_type="application/octet-stream",
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/list-videos")
async def list_videos():
    """List all available videos"""
    videos = []
    for video_file in videos_path.glob("*.mp4"):
        videos.append({
            "filename": video_file.name,
            "size": video_file.stat().st_size,
            "created": datetime.fromtimestamp(video_file.stat().st_ctime).isoformat()
        })
    
    return {"videos": videos}

@app.post("/save-code")
async def save_code(request: CodeRequest):
    """Save code to file"""
    try:
        file_path = manim_files_path / request.filename
        
        async with aiofiles.open(file_path, 'w', encoding='utf-8') as f:
            await f.write(request.content)
        
        return {
            "success": True,
            "message": f"Code saved to {request.filename}",
            "file_path": str(file_path)
        }
        
    except Exception as e:
        print(f"Save code error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error saving code: {str(e)}")

@app.get("/code/{filename}")
async def get_code(filename: str):
    """Get code from file"""
    try:
        file_path = manim_files_path / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:
            content = await f.read()
        
        return {
            "success": True,
            "filename": filename,
            "content": content
        }
        
    except Exception as e:
        print(f"Get code error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error reading code: {str(e)}")

@app.get("/list-files")
async def list_files():
    """List all code files"""
    try:
        files = []
        for file_path in manim_files_path.glob("*.py"):
            files.append({
                "filename": file_path.name,
                "size": file_path.stat().st_size,
                "created": datetime.fromtimestamp(file_path.stat().st_ctime).isoformat()
            })
        
        return {"files": files}
        
    except Exception as e:
        print(f"List files error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)