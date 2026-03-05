#!/usr/bin/env python3
"""
Quick test to check meal plans and backend status
"""

import requests
import json

BASE_URL = "https://recipe-daily-1.preview.emergentagent.com/api"
USER_ID = "test_user_123"

def test_basic_endpoints():
    """Test basic endpoints"""
    
    # Test root
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print(f"Root API: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"Root API error: {e}")
    
    # Test get meal plans
    try:
        response = requests.get(f"{BASE_URL}/meal-plans/{USER_ID}", timeout=10)
        print(f"Meal Plans: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} meal plans")
            for i, plan in enumerate(data[:2]):  # Show first 2
                print(f"  Plan {i+1}: {plan.get('plan_type')} {plan.get('cuisine_type')} - {plan.get('id')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Meal plans error: {e}")
    
    # Test common ingredients 
    try:
        response = requests.get(f"{BASE_URL}/ingredients/common/list", timeout=10)
        print(f"Common ingredients: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data.get('ingredients', []))} common ingredients")
    except Exception as e:
        print(f"Common ingredients error: {e}")
        
    # Test daily meal plan (shorter timeout)
    try:
        meal_plan_data = {
            "user_id": USER_ID,
            "plan_type": "daily",
            "cuisine_type": "healthy"
        }
        response = requests.post(f"{BASE_URL}/meal-plan/generate", json=meal_plan_data, timeout=30)
        print(f"Daily meal plan: {response.status_code}")
        if response.status_code == 200:
            print("✅ Daily meal plan generation working")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Daily meal plan error: {e}")

if __name__ == "__main__":
    test_basic_endpoints()