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
    session_id: Optional[str] = None

class CodeRequest(BaseModel):
    filename: str
    content: str

class VideoRequest(BaseModel):
    message: str
    user_id: Optional[str] = "user123"
    code_filename: Optional[str] = None  # Optional: use existing saved code file

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
        try:
            session = await session_service.create_session(
                app_name=app_name,
                user_id=user_id,
                session_id=request.session_id
            )
            session_id = session.id
        except Exception:
            # Session already exists, use the ID from request
            session_id = request.session_id
        
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
            session_id=session_id,
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
        
        # Process responses to extract chat and code
        code_content = ""
        chat_response = ""
        
        # 1. Extract Chat Response (find [CHAT] anywhere in the response sequence)
        for resp in responses:
            if "[CHAT]" in resp:
                chat_start = resp.find("[CHAT]") + 6
                # Extract until next header or end
                chat_end = resp.find("\n#", chat_start)
                if chat_end == -1: 
                    chat_end = resp.find("---", chat_start)
                if chat_end == -1: 
                    chat_end = len(resp)
                
                extracted_chat = resp[chat_start:chat_end].strip()
                # Clean up bolding/tags
                chat_response = extracted_chat.replace("**", "").replace(":", "", 1).strip()
                break # Take the first [CHAT] found
        
        # 2. Extract Code Content (from the last response)
        if responses:
            last_resp = responses[-1]
            if "```python" in last_resp:
                c_start = last_resp.find("```python") + 9
                c_end = last_resp.find("```", c_start)
                if c_end != -1:
                    code_content = last_resp[c_start:c_end].strip()
            elif "from manim import" in last_resp or "class Introduce" in last_resp:
                # Raw code fallback
                code_content = last_resp.strip()
            
            # If we still don't have a chat response, use the last resp (but remove code)
            if not chat_response:
                if "```python" in last_resp:
                    chat_response = last_resp.split("```python")[0].strip()
                elif code_content:
                    chat_response = "" # It's just code
        
        # Final fallback for chat
        if not chat_response:
            chat_response = "I've generated the animation code for you! Starting the render now..."
        
        return {
            "success": True,
            "chat_response": chat_response,
            "code_content": code_content,
            "session_id": session_id,
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
            generation_id,
            request.code_filename
        )
        
        return {
            "success": True,
            "generation_id": generation_id,
            "message": "Video generation started"
        }
        
    except Exception as e:
        print(f"Video generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Video generation error: {str(e)}")

async def process_video_generation(message: str, user_id: str, generation_id: str, code_filename: str | None = None):
    """Background task for video generation"""
    try:
        video_generation_status[generation_id]["status"] = "processing"
        video_generation_status[generation_id]["message"] = "Analyzing your request..."
        video_generation_status[generation_id]["progress"] = 10
        
        # If code_filename is provided, read the saved code and use it
        code_content = None
        if code_filename:
            try:
                code_path = manim_files_path / code_filename
                if code_path.exists():
                    async with aiofiles.open(code_path, 'r', encoding='utf-8') as f:
                        code_content = await f.read()
                    print(f"Using existing code from {code_filename}")
            except Exception as e:
                print(f"Warning: Could not read code file {code_filename}: {e}")
        
        # Generate video using existing function (now returns dict with video info)
        result = await generate_video(message, generation_id=generation_id, code_content=code_content)
        
        print(f"Video generation result for {generation_id}: {result}")
        
        video_generation_status[generation_id]["status"] = "completed"
        video_generation_status[generation_id]["message"] = "Video generated successfully!"
        video_generation_status[generation_id]["progress"] = 100
        video_generation_status[generation_id]["result"] = result
        # Bubble up convenient fields for the UI
        if isinstance(result, dict):
            video_generation_status[generation_id]["filename"] = result.get("video_filename")
            video_generation_status[generation_id]["url"] = result.get("video_url")
            print(f"Set status - filename: {result.get('video_filename')}, url: {result.get('video_url')}")
        
    except Exception as e:
        error_str = str(e)
        print(f"Video generation background error: {error_str}")
        import traceback
        traceback.print_exc()
        
        # Create user-friendly error message
        if "syntax" in error_str.lower() or "invalid python" in error_str.lower():
            user_message = "The generated code has syntax errors. Please try a different animation description."
        elif "manim command failed" in error_str.lower():
            # Extract the actual error from the message
            if "stderr:" in error_str:
                # Try to extract a cleaner error message
                parts = error_str.split("stderr:")
                if len(parts) > 1:
                    stderr_part = parts[1].strip()
                    # Take first few lines that look like actual errors
                    error_lines = [line for line in stderr_part.split('\n')[:5] 
                                 if line.strip() and 'warning' not in line.lower()]
                    if error_lines:
                        user_message = f"Video generation failed: {error_lines[0][:200]}"
                    else:
                        user_message = "Video generation failed. Please check the code and try again."
                else:
                    user_message = "Video generation failed. Please try a different animation description."
            else:
                user_message = "Video generation failed. Please try again with a simpler animation description."
        else:
            user_message = f"Error: {error_str[:200]}" if len(error_str) > 200 else f"Error: {error_str}"
        
        video_generation_status[generation_id]["status"] = "error"
        video_generation_status[generation_id]["message"] = user_message
        video_generation_status[generation_id]["progress"] = 0
        video_generation_status[generation_id]["error_details"] = error_str  # Keep full error for debugging

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

    # Return pending status instead of 404 - generation might not have started yet
    return {
        "status": "pending",
        "message": "Video generation not started yet",
        "progress": 0
    }

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
        import re
        
        # Sanitize code content - remove HTML/JSX/UI tokens
        sanitized_content = request.content
        try:
            # Remove HTML-like tags and attributes
            sanitized_content = re.sub(r'<[^>]+>', '', sanitized_content)  # Remove HTML tags
            sanitized_content = re.sub(r'class\s*=\s*["\'][^"\']*["\']', '', sanitized_content)  # Remove class attributes
            sanitized_content = re.sub(r'["\']text-[a-z]+-\d+["\']', '', sanitized_content)  # Remove Tailwind classes
            sanitized_content = re.sub(r'["\']font-[a-z]+["\']', '', sanitized_content)  # Remove font classes
            sanitized_content = re.sub(r'["\']span\s+class', '', sanitized_content)  # Remove span class patterns
            sanitized_content = re.sub(r'<400">', '', sanitized_content)  # Remove specific problematic pattern
            sanitized_content = re.sub(r'400">', '', sanitized_content)  # Remove leftover pattern
            # Clean up formatting
            sanitized_content = re.sub(r'\n\s*\n\s*\n', '\n\n', sanitized_content)  # Max 2 consecutive newlines
            # REMOVED: sanitized_content = re.sub(r'  +', ' ', sanitized_content)  # This was breaking Python indentation
        except Exception as e:
            print(f"Warning: Error during code sanitization: {e}")
        
        file_path = manim_files_path / request.filename
        
        async with aiofiles.open(file_path, 'w', encoding='utf-8') as f:
            await f.write(sanitized_content)
        
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