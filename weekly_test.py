#!/usr/bin/env python3
"""
Test weekly meal plan generation with extended timeout
"""

import requests
import json
import time

BASE_URL = "https://recipe-daily-1.preview.emergentagent.com/api"
USER_ID = "test_user_123"

def test_weekly_meal_plan():
    """Test weekly meal plan generation with extended timeout"""
    print("Testing weekly meal plan generation...")
    
    meal_plan_data = {
        "user_id": USER_ID,
        "plan_type": "weekly",
        "cuisine_type": "comfort",
        "available_ingredients": ["pasta", "cheese", "tomatoes"]
    }
    
    start_time = time.time()
    try:
        response = requests.post(
            f"{BASE_URL}/meal-plan/generate", 
            json=meal_plan_data, 
            timeout=120  # 2 minutes
        )
        end_time = time.time()
        
        print(f"Response time: {end_time-start_time:.1f}s")
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Weekly meal plan generated successfully!")
            print(f"Plan ID: {data.get('id')}")
            
            meals = data.get('meals', {})
            print(f"Days included: {list(meals.keys())}")
            
            # Check first day structure
            if meals:
                first_day = list(meals.keys())[0]
                first_day_meals = meals[first_day]
                print(f"First day ({first_day}) meals: {list(first_day_meals.keys())}")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out after 120 seconds")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_weekly_meal_plan()