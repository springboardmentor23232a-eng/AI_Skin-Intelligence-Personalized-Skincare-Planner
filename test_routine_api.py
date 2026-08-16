"""
Test script for skincare routine generation API
Tests the complete routine generation system with Groq AI integration
"""
import requests
import json
import uuid
from datetime import datetime
import sys
import io

# Fix Windows encoding issue
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# API endpoints
PYTHON_API_URL = "http://localhost:8001/api"
NODE_API_URL = "http://localhost:3000/api/routine"

def test_routine_categories():
    """Test getting routine categories"""
    print("Testing routine categories...")
    try:
        response = requests.get(f"{PYTHON_API_URL}/categories/info")
        print(f"Status: {response.status_code}")
        print(f"Categories: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_ai_personalization():
    """Test AI-powered routine personalization"""
    print("\nTesting AI personalization...")
    
    test_data = {
        "skin_type": "oily",
        "skin_concerns": ["acne", "dark_spots"],
        "skin_health_score": 65,
        "allergies": ["fragrance"],
        "lifestyle_factors": {
            "diet": "balanced",
            "exercise": "moderate",
            "stress": "medium"
        },
        "routine_type": "morning",
        "season": "summer"
    }
    
    try:
        response = requests.post(
            f"{PYTHON_API_URL}/routine/ai-personalize",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_create_routine():
    """Test creating a complete routine"""
    print("\nTesting routine creation...")
    
    user_id = str(uuid.uuid4())
    
    routine_data = {
        "user_id": user_id,
        "routine_type": "morning",
        "skin_type": "combination",
        "skin_concerns": ["acne", "aging"],
        "skin_health_score": 70,
        "allergies": ["parabens"],
        "lifestyle_factors": {
            "diet": "mediterranean",
            "exercise": "active",
            "stress": "low"
        },
        "season": "spring"
    }
    
    try:
        response = requests.post(
            f"{PYTHON_API_URL}/routine",
            json=routine_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Created routine ID: {result.get('id')}")
        print(f"Routine name: {result.get('routine_name')}")
        print(f"Number of steps: {len(result.get('routine_steps', []))}")
        print(f"Products recommended: {result.get('products', [])}")
        
        if response.status_code == 200:
            return result.get('id'), user_id
        return None, None
    except Exception as e:
        print(f"Error: {e}")
        return None, None

def test_get_routine(routine_id):
    """Test getting a specific routine"""
    print(f"\nTesting get routine {routine_id}...")
    try:
        response = requests.get(f"{PYTHON_API_URL}/routine/{routine_id}")
        print(f"Status: {response.status_code}")
        print(f"Routine: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_user_routines(user_id):
    """Test getting all routines for a user"""
    print(f"\nTesting get user routines for {user_id}...")
    try:
        response = requests.get(f"{PYTHON_API_URL}/routine/user/{user_id}")
        print(f"Status: {response.status_code}")
        print(f"Routines: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_node_routine_creation():
    """Test routine creation through Node.js backend"""
    print("\nTesting Node.js backend routine creation...")
    
    user_id = str(uuid.uuid4())
    
    routine_data = {
        "user_id": user_id,
        "routine_type": "evening",
        "skin_type": "dry",
        "skin_concerns": ["dryness", "sensitivity"],
        "skin_health_score": 60,
        "allergies": ["alcohol"],
        "lifestyle_factors": {
            "diet": "balanced",
            "exercise": "light",
            "stress": "high"
        }
    }
    
    try:
        response = requests.post(
            f"{NODE_API_URL}/routine",
            json=routine_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Created routine: {json.dumps(result, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_different_routine_types():
    """Test different routine types"""
    print("\nTesting different routine types...")
    
    routine_types = ["morning", "evening", "weekly", "seasonal"]
    results = {}
    
    for routine_type in routine_types:
        print(f"\n--- Testing {routine_type} routine ---")
        
        test_data = {
            "user_id": str(uuid.uuid4()),
            "routine_type": routine_type,
            "skin_type": "normal",
            "skin_concerns": ["aging"],
            "skin_health_score": 75,
            "allergies": [],
            "lifestyle_factors": {"diet": "balanced", "exercise": "moderate"},
            "season": "winter" if routine_type == "seasonal" else None
        }
        
        try:
            response = requests.post(
                f"{PYTHON_API_URL}/routine",
                json=test_data,
                headers={"Content-Type": "application/json"}
            )
            results[routine_type] = {
                "success": response.status_code == 200,
                "steps": len(response.json().get('routine_steps', [])) if response.status_code == 200 else 0
            }
            print(f"Success: {response.status_code == 200}")
            print(f"Steps: {results[routine_type]['steps']}")
        except Exception as e:
            results[routine_type] = {"success": False, "error": str(e)}
            print(f"Error: {e}")
    
    return results

def main():
    """Run all tests"""
    print("=" * 60)
    print("SKINCARE ROUTINE GENERATION API TESTS")
    print("=" * 60)
    
    # Test 1: Get routine categories
    test1 = test_routine_categories()
    
    # Test 2: AI personalization
    test2 = test_ai_personalization()
    
    # Test 3: Create routine
    routine_id, user_id = test_create_routine()
    test3 = routine_id is not None
    
    # Test 4: Get specific routine (if creation succeeded)
    test4 = False
    if routine_id:
        test4 = test_get_routine(routine_id)
    
    # Test 5: Get user routines (if creation succeeded)
    test5 = False
    if user_id:
        test5 = test_get_user_routines(user_id)
    
    # Test 6: Node.js backend
    test6 = test_node_routine_creation()
    
    # Test 7: Different routine types
    test7_results = test_different_routine_types()
    test7 = all(result['success'] for result in test7_results.values())
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"1. Routine Categories: {'✓ PASS' if test1 else '✗ FAIL'}")
    print(f"2. AI Personalization: {'✓ PASS' if test2 else '✗ FAIL'}")
    print(f"3. Create Routine: {'✓ PASS' if test3 else '✗ FAIL'}")
    print(f"4. Get Routine: {'✓ PASS' if test4 else '✗ FAIL'}")
    print(f"5. Get User Routines: {'✓ PASS' if test5 else '✗ FAIL'}")
    print(f"6. Node.js Backend: {'✓ PASS' if test6 else '✗ FAIL'}")
    print(f"7. Different Routine Types: {'✓ PASS' if test7 else '✗ FAIL'}")
    
    print("\nRoutine Type Details:")
    for routine_type, result in test7_results.items():
        status = '✓ PASS' if result['success'] else '✗ FAIL'
        steps = result.get('steps', 0)
        print(f"  {routine_type}: {status} ({steps} steps)")
    
    total_tests = 7
    passed_tests = sum([test1, test2, test3, test4, test5, test6, test7])
    print(f"\nTotal: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed!")
    else:
        print(f"⚠️ {total_tests - passed_tests} test(s) failed")

if __name__ == "__main__":
    main()