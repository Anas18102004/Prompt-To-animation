from . import suppress_warning
from google.adk.sessions import DatabaseSessionService
from google.adk.runners import Runner
from .agent import root_agent, code_fixer
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

async def generate_video(user_message, generation_id: str | None = None, code_content: str | None = None, retry_count: int = 0, error_history: list | None = None):
    """
    Generate video from user message or use existing code content.
    
    Args:
        user_message: User's message/prompt
        generation_id: Optional generation ID for tracking
        code_content: Optional existing code content to use instead of generating new code
        retry_count: Current retry attempt number
    """
    app_name = "my_agent_app"
    user_id = "user123"
    max_retries = 4
    
    if error_history is None:
        error_history = []

    # If code_content is provided, use it directly instead of generating new code
    if code_content:
        print("Using provided code content instead of generating new code")
        final_response = code_content
    else:
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
            if event.is_final_response():
                if (
                    event.content
                    and event.content.parts
                    and hasattr(event.content.parts[0], "text")
                    and event.content.parts[0].text
                ):
                    final_response = event.content.parts[0].text.strip()
        await runner.close()

    # removing ```python and ``` if present
    if final_response.startswith("```python"):
        final_response = final_response[len("```python"):].strip()
    if final_response.endswith("```"):
        final_response = final_response[:-len("```")].strip()

    # Remove HTML/JSX/UI tokens that might have leaked into the code
    # Remove patterns like <400">, <span class=...>, text-purple-400, etc.
    try:
        # Remove common HTML/JSX tags that might leak from AI responses
        final_response = re.sub(r'<(span|div|b|i|style|class)[^>]*>.*?</\1>', '', final_response, flags=re.DOTALL)
        final_response = re.sub(r'<(span|div|b|i|style|class)[^>]*>', '', final_response)
        final_response = re.sub(r'</(span|div|b|i|style|class)>', '', final_response)
        final_response = re.sub(r'class\s*=\s*["\'][^"\']*["\']', '', final_response)
        final_response = re.sub(r'["\']text-[a-z]+-\d+["\']|["\']font-[a-z]+["\']', '', final_response)
        final_response = re.sub(r'<400">|400">', '', final_response)
        final_response = re.sub(r'\n\s*\n\s*\n', '\n\n', final_response)
    except Exception:
        pass

    # Replace LaTeX-based objects with plain Text to avoid LaTeX toolchain requirement
    try:
        # Convert direct calls
        sanitized_response = re.sub(r"\b(Math)?Tex\(", "Text(", final_response)
        
        # Convert common LaTeX symbols to Unicode so they look decent in Text()
        latex_to_unicode = {
            r"\\sigma": "σ", r"\\alpha": "α", r"\\beta": "β", r"\\gamma": "γ",
            r"\\theta": "θ", r"\\pi": "π", r"\\Sigma": "Σ", r"\\Delta": "Δ",
            r"\\infty": "∞", r"\\rightarrow": "→", r"\\otimes": "⊗", r"\\cdot": "·",
            r"\\dots": "...", r"\\cdots": "..."
        }
        for lat, uni in latex_to_unicode.items():
            sanitized_response = sanitized_response.replace(lat, uni)
            
        # Ensure Axes use Text as label_constructor to avoid hidden LaTeX calls
        # If 'Axes(' exists but 'label_constructor' doesn't, inject it into the first line
        if "Axes(" in sanitized_response and "label_constructor" not in sanitized_response:
            sanitized_response = re.sub(r"Axes\(", "Axes(label_constructor=Text, ", sanitized_response)
            
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
    scenes_path = Path(__file__).parent.parent / "manim_generated_files" / "scenes.py"
    
    # Ensure the directory exists
    scenes_path.parent.mkdir(parents=True, exist_ok=True)

    # Validate Python syntax before writing
    try:
        compile(sanitized_response, '<string>', 'exec')
    except SyntaxError as e:
        # If we exceeded retries, fail
        if retry_count >= max_retries:
            error_msg = f"Generated code has syntax errors after {retry_count} retries:\nLine {e.lineno}: {e.msg}\n{e.text}"
            print(f"Syntax error in generated code: {error_msg}")
            raise RuntimeError(f"Invalid Python code generated: {error_msg}")
        else:
            print(f"Syntax error detected (attempt {retry_count + 1}), initiating code repair...")
            error_context = f"SyntaxError at line {e.lineno}: {e.msg}\nContext: {e.text}"
            
            # Call fixer agent
            history_str = "\n".join([f"ATTEMPT {h['attempt']} ERROR:\n{h['error']}\nCODE:\n{h['code']}\n{'-'*20}" for h in error_history])
            fixer_input = f"HISTORY OF FAILED ATTEMPTS:\n{history_str}\n\nCURRENT FAILED CODE:\n{sanitized_response}\n\nCURRENT ERROR:\n{error_context}"
            
            # Initialize session for fixer
            db_url = "sqlite:///./my_agent_data.db"
            session_service = DatabaseSessionService(db_url=db_url)
            
            fixer_session_id = f"fixer_syntax_{generation_id}" if generation_id else "code_fixer_session"
            try:
                session = await session_service.create_session(app_name="code_fixer_app", user_id="system", session_id=fixer_session_id)
            except Exception:
                # Session might already exist from a previous retry attempt
                pass
            runner = Runner(agent=code_fixer, app_name="code_fixer_app", session_service=session_service)
            
            fixed_code = ""
            fixer_msg = Content(role='user', parts=[Part(text=fixer_input)])
            
            async for event in runner.run_async(user_id="system", session_id=fixer_session_id, new_message=fixer_msg):
                if event.is_final_response():
                    if event.content and event.content.parts and event.content.parts[0].text:
                        fixed_code = event.content.parts[0].text.strip()
            
            await runner.close()
            
            if fixed_code:
                print(f"Received fixed code from agent for syntax error, retrying (count {retry_count + 1})...")
                error_history.append({"attempt": retry_count + 1, "code": sanitized_response, "error": error_context})
                return await generate_video(user_message, generation_id=generation_id, code_content=fixed_code, retry_count=retry_count + 1, error_history=error_history)
            else:
                error_msg = f"Generated code has syntax errors and fixer failed:\nLine {e.lineno}: {e.msg}\n{e.text}"
                raise RuntimeError(f"Invalid Python code generated: {error_msg}")

    written = write_file(path=str(scenes_path), content=sanitized_response)
    if not written:
        raise RuntimeError(f"Failed to write Manim scene to {scenes_path}")
    
    # Ensure any referenced images exist to avoid Manim FileNotFoundError
    try:
        img_names = set(re.findall(r"ImageMobject\((?:\\\"|\')([^\"']+)(?:\\\"|\')\)", sanitized_response))
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
    if result.returncode != 0:
        # If we exceeded retries, fail
        if retry_count >= max_retries:
            print(f"Manim failed after {retry_count} retries for {generation_id}")
        else:
            print(f"Manim failed (attempt {retry_count + 1}), initiating code repair for {generation_id}...")
            
            # Extract error for the fixer
            error_context = result.stderr if result.stderr else result.stdout
            
            # Call fixer agent
            history_str = "\n".join([f"ATTEMPT {h['attempt']} ERROR:\n{h['error']}\nCODE:\n{h['code']}\n{'-'*20}" for h in error_history])
            fixer_input = f"HISTORY OF FAILED ATTEMPTS:\n{history_str}\n\nCURRENT FAILED CODE:\n{sanitized_response}\n\nCURRENT ERROR:\n{error_context}"
            
            # Initialize session for fixer (simplified)
            db_url = "sqlite:///./my_agent_data.db"
            session_service = DatabaseSessionService(db_url=db_url)
            
            # Use a consistent session ID for the fixer to maintain context if possible
            fixer_session_id = f"fixer_{generation_id}" if generation_id else "code_fixer_session"
            try:
                session = await session_service.create_session(app_name="code_fixer_app", user_id="system", session_id=fixer_session_id)
            except Exception:
                # Session might already exist from a previous retry attempt
                pass
            runner = Runner(agent=code_fixer, app_name="code_fixer_app", session_service=session_service)
            
            fixed_code = ""
            fixer_msg = Content(role='user', parts=[Part(text=fixer_input)])
            
            async for event in runner.run_async(user_id="system", session_id=fixer_session_id, new_message=fixer_msg):
                if event.is_final_response():
                    if event.content and event.content.parts and event.content.parts[0].text:
                        fixed_code = event.content.parts[0].text.strip()
            
            await runner.close()
            
            if fixed_code:
                print(f"Received fixed code from agent, retrying (count {retry_count + 1})...")
                error_history.append({"attempt": retry_count + 1, "code": sanitized_response, "error": error_context})
                return await generate_video(user_message, generation_id=generation_id, code_content=fixed_code, retry_count=retry_count + 1, error_history=error_history)
            else:
                print("Fixer agent returned empty response.")

        # If we reach here, either retry failed or fixer failed
        print("stderr:\n", result.stderr)
        
        # Extract the actual error message (skip warnings)
        error_lines = []
        stderr_lines = result.stderr.split('\n') if result.stderr else []
        stdout_lines = result.stdout.split('\n') if result.stdout else []
        
        # Look for actual errors (not warnings)
        for line in stderr_lines + stdout_lines:
            line_lower = line.lower()
            # Skip syntax warnings from dependencies
            if 'syntaxwarning' in line_lower or 'invalid escape sequence' in line_lower:
                continue
            # Include lines that look like actual errors
            if any(keyword in line_lower for keyword in ['error', 'exception', 'traceback', 'failed', 'cannot']):
                error_lines.append(line)
        
        # If we found filtered errors, use those; otherwise use full stderr
        if error_lines:
            error_msg = '\n'.join(error_lines[-20:])  # Last 20 error lines
        else:
            # Use full stderr but truncate if too long
            error_msg = result.stderr if len(result.stderr) < 2000 else result.stderr[:2000] + "... (truncated)"
        
        # Also check stdout for errors
        stdout_error = ""
        if result.stdout:
            stdout_lines = result.stdout.split('\n')
            for line in stdout_lines:
                if any(keyword in line.lower() for keyword in ['error', 'exception', 'traceback', 'failed']):
                    stdout_error += line + '\n'
        
        full_error = f"Manim command failed with exit code {result.returncode}.\n"
        if stdout_error:
            full_error += f"Stdout errors:\n{stdout_error}\n"
        if error_msg:
            full_error += f"Stderr:\n{error_msg}"
        else:
            full_error += f"Full stderr:\n{result.stderr[:1000]}"
        
        raise RuntimeError(full_error)

    
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
                print(f"Copied video from {found_video} to {target}")
            except Exception as copy_error:
                # If copy fails, try moving
                try:
                    shutil.move(str(found_video), str(target))
                    print(f"Moved video from {found_video} to {target}")
                except Exception as move_error:
                    print(f"Could not copy or move video: copy_error={copy_error}, move_error={move_error}")
                    target = found_video  # leave as-is
            rel_name = target.name
            video_info = {
                "video_filename": rel_name,
                "video_url": f"/media/videos/{rel_name}",
                "scene_name": scene_name,
            }
            print(f"Video info set: {video_info}")
        else:
            print(f"Warning: Video file not found. Searched for scene '{scene_name}' in {media_videos_root}")
            # Try one more search in the current directory structure
            if generation_id:
                potential_path = media_videos_root / f"{generation_id}.mp4"
                if potential_path.exists():
                    video_info = {
                        "video_filename": potential_path.name,
                        "video_url": f"/media/videos/{potential_path.name}",
                        "scene_name": scene_name,
                    }
                    print(f"Found video at potential path: {potential_path}")
    except Exception:
        pass

    # Return structured result for the caller
    return {
        "message": final_response,
        **video_info,
    }