def mock_extract(responses):
    code_content = ""
    chat_response = ""
    
    # 1. Extract Chat Response (find [CHAT] anywhere in the response sequence)
    for resp in responses:
        if "[CHAT]" in resp:
            chat_start = resp.find("[CHAT]") + 6
            chat_end = resp.find("\n#", chat_start)
            if chat_end == -1: 
                chat_end = resp.find("---", chat_start)
            if chat_end == -1: 
                chat_end = len(resp)
            
            extracted_chat = resp[chat_start:chat_end].strip()
            chat_response = extracted_chat.replace("**", "").replace(":", "", 1).strip()
            break
    
    if responses:
        last_resp = responses[-1]
        if "```python" in last_resp:
            c_start = last_resp.find("```python") + 9
            c_end = last_resp.find("```", c_start)
            if c_end != -1:
                code_content = last_resp[c_start:c_end].strip()
        elif "from manim import" in last_resp or "class Introduce" in last_resp:
            code_content = last_resp.strip()
        
        if not chat_response:
            if "```python" in last_resp:
                chat_response = last_resp.split("```python")[0].strip()
            elif code_content:
                chat_response = ""
    
    if not chat_response:
        chat_response = "I've generated the animation code for you! Starting the render now..."
        
    return chat_response, code_content

# Test Case 1: Script Writer + Code Writer
responses = [
    "[CHAT] I'd be happy to explain backpropagation! Here is the plan.\n## Storyboard\n...",
    "from manim import *\nclass Introduce(Scene):..."
]
chat, code = mock_extract(responses)
print(f"Test 1 Chat: '{chat}'")
print(f"Test 1 Code: {code[:30]}...")

# Test Case 2: No [CHAT] section
responses = [
    "## Storyboard\n...",
    "```python\nprint('hello')\n```"
]
chat, code = mock_extract(responses)
print(f"\nTest 2 Chat: '{chat}'")
print(f"Test 2 Code: {code[:30]}...")
