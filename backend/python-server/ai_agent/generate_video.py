from . import suppress_warning
from google.adk.sessions import DatabaseSessionService
from google.adk.runners import Runner
from .agent import root_agent
from google.genai.types import Content, Part
from dotenv import load_dotenv
import subprocess
import shutil
import sys
import os
import re
import base64
from pathlib import Path
from .tools.filesystem import write_file

load_dotenv() 

async def generate_video(user_message, generation_id: str | None = None):
    app_name = "my_agent_app"
    user_id = "user123"

    # Initialize the session service with a database URL
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

    user_message = Content(role='user', parts=[Part(text=user_message)])

    async for event in runner.run_async(
                            user_id=user_id, 
                            session_id=session.id, 
                            new_message=user_message
                        ):
        # print(event)
        if event.is_final_response():
            if (
                event.content
                and event.content.parts
                and hasattr(event.content.parts[0], "text")
                and event.content.parts[0].text
            ):
                final_response = event.content.parts[0].text.strip()
    await runner.close()
    print("Final response received from agent:", final_response)

    # removing ```python and ``` if present
    if final_response.startswith("```python"):
        final_response = final_response[len("```python"):].strip()
    if final_response.endswith("```"):
        final_response = final_response[:-len("```")].strip()


    # Replace LaTeX-based objects with plain Text to avoid LaTeX toolchain requirement
    try:
        sanitized_response = re.sub(r"\b(Math)?Tex\(", "Text(", final_response)
    except Exception:
        sanitized_response = final_response

    # Remove unsupported Manim Angle(...) keyword args like vertex=... that cause TypeError
    # Example error: TypeError: Mobject.__init__() got an unexpected keyword argument 'vertex'
    try:
        # Remove occurrences of "vertex=<anything>" within function arg lists
        # Pass 1: drop the vertex assignment
        sanitized_response = re.sub(r"\bvertex\s*=\s*[^,\)]+", "", sanitized_response)
        # If Angle(...) contains a positional numeric radius (3rd arg) AND also radius=..., drop the positional one
        # Restrict to Angle(...) to avoid touching other calls
        sanitized_response = re.sub(
            r"(Angle\s*\([^,]*,[^,]*)(,\s*[^,\)]+)(?=\s*,[^)]*\bradius\s*=)",
            r"\1",
            sanitized_response,
        )
        # Cleanup any doubled commas created by the removal
        sanitized_response = re.sub(r",\s*,", ", ", sanitized_response)
        # Cleanup '(', comma spacing issues
        sanitized_response = re.sub(r"\(\s*,", "(", sanitized_response)
        sanitized_response = re.sub(r",\s*\)", ")", sanitized_response)
    except Exception:
        pass

    # Build dynamic path
    scenes_path = Path(__file__).parent.parent.parent / "manim_generated_files" / "scenes.py"

    written = write_file(path=scenes_path, content=sanitized_response)
    if not written:
        raise RuntimeError(f"Failed to write Manim scene to {scenes_path}")
    print(f"Wrote Manim scene to {scenes_path}")
    
    # Ensure any referenced images exist to avoid Manim FileNotFoundError
    try:
        print(f"Working directory for Manim: {Path.cwd()}")
        img_names = set(re.findall(r"ImageMobject\((?:\\\"|\')([^\"']+)(?:\\\"|\')\)", sanitized_response))
        print(f"Detected image references: {sorted(img_names)}")
        if img_names:
            # 1x1 transparent PNG
            tiny_png_b64 = (
                b"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAEElEQVR42mP8/5+hHgAHGgK8N1d9WwAAAABJRU5ErkJggg=="
            )
            png_bytes = base64.b64decode(tiny_png_b64)
            for name in img_names:
                candidates = []
                p_name = Path(name)
                # Candidate 1: CWD/name
                candidates.append(Path.cwd() / p_name)
                # Candidate 2: alongside scenes.py
                candidates.append(scenes_path.parent / p_name)
                for candidate in candidates:
                    try:
                        candidate.parent.mkdir(parents=True, exist_ok=True)
                        if not candidate.exists():
                            with open(candidate, "wb") as f:
                                f.write(png_bytes)
                            print(f"Created placeholder image: {candidate}")
                        else:
                            print(f"Image already exists: {candidate}")
                    except Exception as ie:
                        print(f"Failed creating placeholder at {candidate}: {ie}")
    except Exception as e:
        print(f"Warning: Could not ensure placeholder images: {e}")
    
    # Ensure ffmpeg is available (Manim depends on it)
    ffmpeg_path = shutil.which("ffmpeg")
    if not ffmpeg_path:
        raise RuntimeError(
            "ffmpeg not found on PATH. Please install ffmpeg and ensure it's available on PATH.\n"
            "Windows (choco): choco install ffmpeg\n"
            "Windows (scoop): scoop install ffmpeg\n"
            "Or download from https://ffmpeg.org/download.html and add bin to PATH."
        )

    # Determine scene class name dynamically (fallback to 'Introduce')
    scene_name = "Introduce"
    try:
        m = re.search(r"class\s+([A-Za-z_]\w*)\s*\(\s*Scene\s*\)", sanitized_response)
        if m:
            scene_name = m.group(1)
    except Exception:
        pass

    cmd = [
        sys.executable, "-m", "manim", "-ql",
        str(scenes_path),
        scene_name
    ]

    # run and capture output (inject FFMPEG_BINARY to be explicit)
    env = os.environ.copy()
    env["FFMPEG_BINARY"] = ffmpeg_path
    result = subprocess.run(cmd, capture_output=True, text=True, env=env)
    print("exit code:", result.returncode)
    print("stdout:\n", result.stdout)
    if result.returncode != 0:
        print("stderr:\n", result.stderr)

    
    # Try to locate the rendered video from manim output
    video_info = {}
    try:
        # Determine the correct media/videos root (one level above ai_agent)
        media_videos_root = Path(__file__).parent.parent / "media" / "videos"
        media_videos_root.mkdir(parents=True, exist_ok=True)
        found_video: Path | None = None

        # Prefer parsing the exact path from manim stdout
        try:
            m_out = re.search(r"File ready at\s+'([^']+\.mp4)'", result.stdout)
            if m_out:
                cand = Path(m_out.group(1))
                if cand.exists():
                    found_video = cand
        except Exception:
            pass

        # Fallback: Search common manim output structure for the scene .mp4
        if not found_video:
            try:
                for p in (media_videos_root / "scenes").glob(f"**/{scene_name}.mp4"):
                    found_video = p
                    break
            except Exception:
                found_video = None

        if found_video and found_video.exists():
            if generation_id:
                target = media_videos_root / f"{generation_id}.mp4"
            else:
                # Fallback name if no generation id provided
                target = media_videos_root / f"{scene_name}.mp4"
            try:
                shutil.copyfile(found_video, target)
            except Exception:
                # If copy fails, try moving
                try:
                    shutil.move(str(found_video), str(target))
                except Exception:
                    target = found_video  # leave as-is
            rel_name = target.name
            video_info = {
                "video_filename": rel_name,
                "video_url": f"/media/videos/{rel_name}",
                "scene_name": scene_name,
            }
    except Exception as e:
        print(f"Warning: Could not normalize/copy video output: {e}")

    # Return structured result for the caller
    return {
        "message": final_response,
        **video_info,
    }