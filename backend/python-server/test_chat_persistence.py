import requests
import json
import time

API_BASE = "http://localhost:8000"

def test_chat_persistence():
    print("--- FIRST REQUEST ---")
    payload1 = {
        "message": "Write a Manim script to create a blue circle.",
        "user_id": "test_user"
    }
    response1 = requests.post(f"{API_BASE}/chat", json=payload1)
    data1 = response1.json()
    
    if not data1.get("success"):
        print("First request failed!")
        return
        
    session_id = data1.get("session_id")
    print(f"Session ID received: {session_id}")
    print("AI Response 1 preview:", data1.get("chat_response")[:100])
    
    print("\n--- SECOND REQUEST (WITH SESSION ID) ---")
    payload2 = {
        "message": "Now change that circle to a square and make it red.",
        "user_id": "test_user",
        "session_id": session_id
    }
    response2 = requests.post(f"{API_BASE}/chat", json=payload2)
    data2 = response2.json()
    
    if not data2.get("success"):
        print("Second request failed!")
        return
        
    print(f"Session ID in response 2: {data2.get('session_id')}")
    print("AI Response 2 preview:", data2.get("chat_response")[:500])
    
    if session_id == data2.get("session_id"):
        print("\nSUCCESS: Session IDs match.")
    else:
        print("\nFAILURE: Session IDs do not match.")

if __name__ == "__main__":
    test_chat_persistence()
