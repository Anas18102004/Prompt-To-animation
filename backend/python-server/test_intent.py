import urllib.request
import json

API_BASE = "http://localhost:8000"

def call_chat(message):
    url = f"{API_BASE}/chat"
    payload = json.dumps({"message": message, "user_id": "test_user"}).encode('utf-8')
    req = urllib.request.Request(url, data=payload)
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req) as f:
            return json.loads(f.read().decode('utf-8'))
    except Exception as e:
        print(f"Error calling {url}: {e}")
        return {}

def test_intent_classification():
    print("--- TESTING GREETING (Should NOT generate code) ---")
    data_greeting = call_chat("Hello!")
    
    code_content = data_greeting.get("code_content", "")
    print(f"Code Content Length: {len((code_content or '').strip())}")
    
    if len((code_content or "").strip()) == 0:
        print("SUCCESS: No code generated for greeting.")
    else:
        print("FAILURE: Code was generated for a greeting!")

    print("\n--- TESTING ANIMATION (Should generate code) ---")
    data_animation = call_chat("Animate a circle.")
    
    code_content_anim = data_animation.get("code_content", "")
    print(f"Code Content Length: {len((code_content_anim or '').strip())}")
    
    if len((code_content_anim or "").strip()) > 0:
        print("SUCCESS: Code generated for animation.")
    else:
        print("FAILURE: No code generated for animation.")

if __name__ == "__main__":
    test_intent_classification()
