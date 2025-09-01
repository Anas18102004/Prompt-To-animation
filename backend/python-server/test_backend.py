#!/usr/bin/env python3
"""
Test script for Lumen Anima FastAPI Backend
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_backend():
    """Test all backend endpoints"""
    
    print("🧪 Testing Lumen Anima Backend...")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return
    
    # Test 2: Chat endpoint
    try:
        chat_data = {
            "message": "Hello! Can you help me create a simple animation?",
            "user_id": "test_user"
        }
        response = requests.post(f"{BASE_URL}/chat", json=chat_data)
        print(f"✅ Chat endpoint: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Chat response: {result.get('chat_response', 'No response')[:100]}...")
            if result.get('code_content'):
                print(f"   Code generated: {len(result['code_content'])} characters")
    except Exception as e:
        print(f"❌ Chat endpoint failed: {e}")
    
    # Test 3: Save code
    try:
        code_data = {
            "filename": "test_animation.py",
            "content": "from manim import *\n\nclass TestScene(Scene):\n    def construct(self):\n        circle = Circle()\n        self.play(Create(circle))"
        }
        response = requests.post(f"{BASE_URL}/save-code", json=code_data)
        print(f"✅ Save code: {response.status_code}")
    except Exception as e:
        print(f"❌ Save code failed: {e}")
    
    # Test 4: List files
    try:
        response = requests.get(f"{BASE_URL}/list-files")
        print(f"✅ List files: {response.status_code}")
        if response.status_code == 200:
            files = response.json().get('files', [])
            print(f"   Found {len(files)} files")
    except Exception as e:
        print(f"❌ List files failed: {e}")
    
    # Test 5: List videos
    try:
        response = requests.get(f"{BASE_URL}/list-videos")
        print(f"✅ List videos: {response.status_code}")
        if response.status_code == 200:
            videos = response.json().get('videos', [])
            print(f"   Found {len(videos)} videos")
    except Exception as e:
        print(f"❌ List videos failed: {e}")
    
    print("\n🎉 Backend test completed!")

if __name__ == "__main__":
    test_backend()
