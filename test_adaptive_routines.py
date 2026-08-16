"""
Test script for adaptive routine updates
Tests the complete adaptive routine update system
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

def test_adaptive_update_check():
    """Test checking if a routine needs updating"""
    print("Testing adaptive update check...")
    
    # First create a routine
    user_id = str(uuid.uuid4())
    routine_data = {
        "user_id": user_id,
        "routine_type": "morning",
        "skin_type": "oily",
        "skin_concerns": ["acne", "dark_spots"],
        "skin_health_score": 50,
        "allergies": [],
        "lifestyle_factors": {
            "diet": "balanced",
            "exercise": "moderate",
            "stress": "high"
        }
    }
    
    try:
        # Create routine
        create_response = requests.post(f"{PYTHON_API_URL}/routine", json=routine_data)
        routine_id = create_response.json()['id']
        print(f"Created routine: {routine_id}")
        
        # Check for update with no changes
        no_change_assessment = routine_data.copy()
        check_response = requests.post(
            f"{PYTHON_API_URL}/routine/{routine_id}/check-update",
            json=no_change_assessment
        )
        check_result = check_response.json()
        print(f"No changes check: should_update={check_result['should_update']}, reason={check_result['reason']}")
        
        # Check for update with significant changes
        changed_assessment = {
            "skin_type": "dry",  # Changed from oily
            "skin_concerns": ["dryness"],  # Changed from acne, dark_spots
            "skin_health_score": 75,  # Improved from 50
            "allergies": ["fragrance"],  # New allergy
            "lifestyle_factors": {
                "diet": "mediterranean",
                "exercise": "active",
                "stress": "low"
            }
        }
        
        check_response = requests.post(
            f"{PYTHON_API_URL}/routine/{routine_id}/check-update",
            json=changed_assessment
        )
        check_result = check_response.json()
        print(f"Changes check: should_update={check_result['should_update']}, reason={check_result['reason']}")
        
        return routine_id, changed_assessment
        
    except Exception as e:
        print(f"Error: {e}")
        return None, None

def test_adapt_routine(routine_id, new_assessment):
    """Test adapting a routine to new assessment"""
    print("\nTesting routine adaptation...")
    
    try:
        # Get original routine
        original_response = requests.get(f"{PYTHON_API_URL}/routine/{routine_id}")
        original_routine = original_response.json()
        print(f"Original steps: {len(original_routine['routine_steps'])}")
        
        # Adapt routine
        adapt_response = requests.post(
            f"{PYTHON_API_URL}/routine/{routine_id}/adapt",
            json=new_assessment
        )
        adapt_result = adapt_response.json()
        
        print(f"Adaptation response: {adapt_result}")
        
        if adapt_result.get('success'):
            print(f"Adaptation success: {adapt_result['success']}")
            print(f"Changes made: {adapt_result.get('changes', [])}")
            
            # Handle different response structures
            routine_data = adapt_result.get('routine', {})
            if isinstance(routine_data, dict):
                steps = routine_data.get('routine_steps', [])
                print(f"New steps: {len(steps)}")
                
                # Show adapted steps
                for step in steps:
                    print(f"  {step['step_order']}. {step['category']}: {step['step_name']}")
            else:
                print(f"Routine data type: {type(routine_data)}")
        else:
            print(f"Adaptation not needed: {adapt_result.get('reason', 'Unknown')}")
        
        return adapt_result.get('success', False)
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_regenerate_routine(routine_id, new_params):
    """Test completely regenerating a routine"""
    print("\nTesting routine regeneration...")
    
    try:
        # Get original routine
        original_response = requests.get(f"{PYTHON_API_URL}/routine/{routine_id}")
        original_routine = original_response.json()
        print(f"Original routine type: {original_routine['routine_type']}")
        
        # Regenerate with new parameters
        regen_response = requests.post(
            f"{PYTHON_API_URL}/routine/{routine_id}/regenerate",
            json=new_params
        )
        regenerated_routine = regen_response.json()
        
        print(f"Regenerated routine type: {regenerated_routine['routine_type']}")
        print(f"New steps: {len(regenerated_routine['routine_steps'])}")
        
        # Show regenerated steps
        for step in regenerated_routine['routine_steps']:
            print(f"  {step['step_order']}. {step['category']}: {step['step_name']}")
        
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_specific_scenario():
    """Test the specific scenario mentioned: acne severity High -> Moderate"""
    print("\n" + "="*60)
    print("Testing Specific Scenario: Acne Severity High -> Moderate")
    print("="*60)
    
    user_id = str(uuid.uuid4())
    
    # Create routine with high acne severity
    high_acne_routine = {
        "user_id": user_id,
        "routine_type": "morning",
        "skin_type": "oily",
        "skin_concerns": ["acne", "clogged_pores", "excess_oil"],
        "skin_health_score": 40,  # Low health score = high severity
        "allergies": [],
        "lifestyle_factors": {
            "diet": "poor",
            "exercise": "sedentary",
            "stress": "high"
        }
    }
    
    try:
        # Create initial routine
        create_response = requests.post(f"{PYTHON_API_URL}/routine", json=high_acne_routine)
        routine_id = create_response.json()['id']
        print(f"Created high-acne routine: {routine_id}")
        
        # Show initial routine
        initial_routine = create_response.json()
        print("\nInitial routine (High Acne Severity):")
        for step in initial_routine['routine_steps']:
            print(f"  {step['step_order']}. {step['category']}: {step['step_name']}")
        
        # Simulate improvement: acne severity reduced
        improved_assessment = {
            "skin_type": "combination",  # Improved from oily
            "skin_concerns": ["clogged_pores"],  # Acne resolved, only pores remain
            "skin_health_score": 70,  # Improved from 40
            "allergies": [],
            "lifestyle_factors": {
                "diet": "balanced",
                "exercise": "moderate",
                "stress": "medium"
            }
        }
        
        print(f"Assessment improved: Health score 40 -> 70, Acne concern removed")
        
        # Check if update needed
        check_response = requests.post(
            f"{PYTHON_API_URL}/routine/{routine_id}/check-update",
            json=improved_assessment
        )
        check_result = check_response.json()
        print(f"Update recommended: {check_result['should_update']}")
        print(f"Reason: {check_result['reason']}")
        
        # Adapt the routine
        adapt_response = requests.post(
            f"{PYTHON_API_URL}/routine/{routine_id}/adapt",
            json=improved_assessment
        )
        adapt_result = adapt_response.json()
        
        if adapt_result['success']:
            print(f"\n✅ Routine adapted successfully!")
            print(f"Changes made: {adapt_result['changes']}")
            
            print("\nAdapted routine (Moderate Acne Severity):")
            for step in adapt_result['routine']['routine_steps']:
                print(f"  {step['step_order']}. {step['category']}: {step['step_name']}")
        
        return True
        
    except Exception as e:
        print(f"Error in scenario test: {e}")
        return False

def main():
    """Run all adaptive routine tests"""
    print("="*60)
    print("ADAPTIVE ROUTINE UPDATE SYSTEM TESTS")
    print("="*60)
    
    # Test 1: Check for updates
    routine_id, changed_assessment = test_adaptive_update_check()
    
    if routine_id and changed_assessment:
        # Test 2: Adapt routine
        test_adapt_routine(routine_id, changed_assessment)
        
        # Test 3: Regenerate routine
        test_regenerate_routine(routine_id, changed_assessment)
    
    # Test 4: Specific scenario
    test_specific_scenario()
    
    print("\n" + "="*60)
    print("ADAPTIVE ROUTINE TESTS COMPLETED")
    print("="*60)

if __name__ == "__main__":
    main()