#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Meal Planning App
Tests all API endpoints using requests library
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://recipe-daily-1.preview.emergentagent.com/api"
USER_ID = "test_user_123"

class MealPlanningAPITester:
    def __init__(self, base_url, user_id):
        self.base_url = base_url
        self.user_id = user_id
        self.test_results = []
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def make_request(self, method, endpoint, data=None):
        """Make HTTP request and handle errors"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method.upper() == "GET":
                response = requests.get(url, timeout=60)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, timeout=60)
            elif method.upper() == "DELETE":
                response = requests.delete(url, timeout=60)
            else:
                return None, f"Unsupported method: {method}"
                
            return response, None
        except requests.exceptions.Timeout:
            return None, "Request timed out"
        except requests.exceptions.ConnectionError:
            return None, "Connection error - backend may be down"
        except Exception as e:
            return None, f"Request failed: {str(e)}"
    
    def test_common_ingredients_list(self):
        """Test GET /api/ingredients/common/list"""
        print("\n🧪 Testing Common Ingredients List...")
        
        response, error = self.make_request("GET", "/ingredients/common/list")
        if error:
            self.log_result("Common Ingredients List", False, error)
            return
            
        if response.status_code == 200:
            data = response.json()
            if "ingredients" in data and isinstance(data["ingredients"], list):
                if len(data["ingredients"]) > 0:
                    self.log_result("Common Ingredients List", True, 
                                  f"Retrieved {len(data['ingredients'])} common ingredients")
                else:
                    self.log_result("Common Ingredients List", False, "Empty ingredients list")
            else:
                self.log_result("Common Ingredients List", False, "Invalid response format")
        else:
            self.log_result("Common Ingredients List", False, 
                          f"HTTP {response.status_code}: {response.text}")
    
    def test_add_ingredient(self):
        """Test POST /api/ingredients/add"""
        print("\n🧪 Testing Add Ingredient...")
        
        # Test data
        ingredient_data = {
            "user_id": self.user_id,
            "ingredient_name": "Organic Quinoa"
        }
        
        response, error = self.make_request("POST", "/ingredients/add", ingredient_data)
        if error:
            self.log_result("Add Ingredient", False, error)
            return None
            
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "ingredient_name" in data:
                self.log_result("Add Ingredient", True, 
                              f"Added ingredient: {data.get('ingredient_name')}")
                return data.get("id")  # Return ingredient ID for deletion test
            else:
                self.log_result("Add Ingredient", False, "Invalid response format")
        else:
            self.log_result("Add Ingredient", False, 
                          f"HTTP {response.status_code}: {response.text}")
        return None
    
    def test_get_user_ingredients(self):
        """Test GET /api/ingredients/{user_id}"""
        print("\n🧪 Testing Get User Ingredients...")
        
        response, error = self.make_request("GET", f"/ingredients/{self.user_id}")
        if error:
            self.log_result("Get User Ingredients", False, error)
            return []
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get User Ingredients", True, 
                              f"Retrieved {len(data)} user ingredients")
                return data
            else:
                self.log_result("Get User Ingredients", False, "Invalid response format")
        else:
            self.log_result("Get User Ingredients", False, 
                          f"HTTP {response.status_code}: {response.text}")
        return []
    
    def test_delete_ingredient(self, ingredient_id):
        """Test DELETE /api/ingredients/{ingredient_id}"""
        print("\n🧪 Testing Delete Ingredient...")
        
        if not ingredient_id:
            self.log_result("Delete Ingredient", False, "No ingredient ID to delete")
            return
            
        response, error = self.make_request("DELETE", f"/ingredients/{ingredient_id}")
        if error:
            self.log_result("Delete Ingredient", False, error)
            return
            
        if response.status_code == 200:
            self.log_result("Delete Ingredient", True, "Ingredient deleted successfully")
        elif response.status_code == 404:
            self.log_result("Delete Ingredient", False, "Ingredient not found")
        else:
            self.log_result("Delete Ingredient", False, 
                          f"HTTP {response.status_code}: {response.text}")
    
    def test_generate_daily_meal_plan(self):
        """Test POST /api/meal-plan/generate - Daily Plan"""
        print("\n🧪 Testing Generate Daily Meal Plan (AI-powered, ~30 seconds)...")
        
        meal_plan_data = {
            "user_id": self.user_id,
            "plan_type": "daily",
            "cuisine_type": "healthy",
            "available_ingredients": ["quinoa", "chicken breast", "spinach", "olive oil"]
        }
        
        # Extend timeout for AI generation
        start_time = time.time()
        response, error = self.make_request("POST", "/meal-plan/generate", meal_plan_data)
        end_time = time.time()
        
        if error:
            self.log_result("Generate Daily Meal Plan", False, error)
            return None
            
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "meals" in data:
                meals = data["meals"]
                if "breakfast" in meals and "lunch" in meals and "dinner" in meals:
                    # Check each meal has required fields
                    all_meals_valid = True
                    for meal_time in ["breakfast", "lunch", "dinner"]:
                        meal = meals[meal_time]
                        if not all(key in meal for key in ["name", "ingredients", "instructions", "prep_time", "cook_time", "servings"]):
                            all_meals_valid = False
                            break
                    
                    if all_meals_valid:
                        self.log_result("Generate Daily Meal Plan", True, 
                                      f"Generated daily meal plan in {end_time-start_time:.1f}s with complete meal data")
                        return data.get("id")
                    else:
                        self.log_result("Generate Daily Meal Plan", False, "Incomplete meal data in response")
                else:
                    self.log_result("Generate Daily Meal Plan", False, "Missing required meals in response")
            else:
                self.log_result("Generate Daily Meal Plan", False, "Invalid response format")
        else:
            self.log_result("Generate Daily Meal Plan", False, 
                          f"HTTP {response.status_code}: {response.text}")
        return None
    
    def test_generate_weekly_meal_plan(self):
        """Test POST /api/meal-plan/generate - Weekly Plan"""
        print("\n🧪 Testing Generate Weekly Meal Plan (AI-powered, ~30 seconds)...")
        
        meal_plan_data = {
            "user_id": self.user_id,
            "plan_type": "weekly",
            "cuisine_type": "comfort",
            "available_ingredients": ["pasta", "cheese", "tomatoes", "ground beef"]
        }
        
        start_time = time.time()
        response, error = self.make_request("POST", "/meal-plan/generate", meal_plan_data)
        end_time = time.time()
        
        if error:
            self.log_result("Generate Weekly Meal Plan", False, error)
            return None
            
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "meals" in data:
                meals = data["meals"]
                # Check for at least some days
                days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                found_days = [day for day in days if day in meals]
                
                if len(found_days) >= 7:
                    # Check first day has complete meal structure
                    first_day_meals = meals[found_days[0]]
                    if all(meal_time in first_day_meals for meal_time in ["breakfast", "lunch", "dinner"]):
                        self.log_result("Generate Weekly Meal Plan", True, 
                                      f"Generated weekly meal plan in {end_time-start_time:.1f}s with {len(found_days)} days")
                        return data.get("id")
                    else:
                        self.log_result("Generate Weekly Meal Plan", False, "Incomplete meal structure for days")
                else:
                    self.log_result("Generate Weekly Meal Plan", False, f"Only found {len(found_days)} days instead of 7")
            else:
                self.log_result("Generate Weekly Meal Plan", False, "Invalid response format")
        else:
            self.log_result("Generate Weekly Meal Plan", False, 
                          f"HTTP {response.status_code}: {response.text}")
        return None
    
    def test_get_user_meal_plans(self):
        """Test GET /api/meal-plans/{user_id}"""
        print("\n🧪 Testing Get User Meal Plans...")
        
        response, error = self.make_request("GET", f"/meal-plans/{self.user_id}")
        if error:
            self.log_result("Get User Meal Plans", False, error)
            return []
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get User Meal Plans", True, 
                              f"Retrieved {len(data)} meal plans")
                return data
            else:
                self.log_result("Get User Meal Plans", False, "Invalid response format")
        else:
            self.log_result("Get User Meal Plans", False, 
                          f"HTTP {response.status_code}: {response.text}")
        return []
    
    def test_delete_meal_plan(self, plan_id):
        """Test DELETE /api/meal-plans/{plan_id}"""
        print("\n🧪 Testing Delete Meal Plan...")
        
        if not plan_id:
            self.log_result("Delete Meal Plan", False, "No meal plan ID to delete")
            return
            
        response, error = self.make_request("DELETE", f"/meal-plans/{plan_id}")
        if error:
            self.log_result("Delete Meal Plan", False, error)
            return
            
        if response.status_code == 200:
            self.log_result("Delete Meal Plan", True, "Meal plan deleted successfully")
        elif response.status_code == 404:
            self.log_result("Delete Meal Plan", False, "Meal plan not found")
        else:
            self.log_result("Delete Meal Plan", False, 
                          f"HTTP {response.status_code}: {response.text}")
    
    def test_add_favorite(self):
        """Test POST /api/favorites/add"""
        print("\n🧪 Testing Add Favorite...")
        
        # Create a sample recipe
        sample_recipe = {
            "name": "Grilled Chicken Salad",
            "meal_type": "lunch",
            "cuisine_type": "healthy",
            "ingredients": ["Chicken breast 200g", "Mixed greens 100g", "Olive oil 2 tbsp", "Lemon juice 1 tbsp"],
            "instructions": ["Grill chicken until cooked", "Prepare salad greens", "Mix with dressing", "Serve fresh"],
            "prep_time": "10 minutes",
            "cook_time": "15 minutes",
            "servings": 1
        }
        
        favorite_data = {
            "user_id": self.user_id,
            "recipe": sample_recipe
        }
        
        response, error = self.make_request("POST", "/favorites/add", favorite_data)
        if error:
            self.log_result("Add Favorite", False, error)
            return None
            
        if response.status_code == 200:
            data = response.json()
            if "id" in data and "recipe" in data:
                self.log_result("Add Favorite", True, 
                              f"Added favorite: {data['recipe'].get('name', 'Unknown')}")
                return data.get("id")
            else:
                self.log_result("Add Favorite", False, "Invalid response format")
        else:
            self.log_result("Add Favorite", False, 
                          f"HTTP {response.status_code}: {response.text}")
        return None
    
    def test_get_user_favorites(self):
        """Test GET /api/favorites/{user_id}"""
        print("\n🧪 Testing Get User Favorites...")
        
        response, error = self.make_request("GET", f"/favorites/{self.user_id}")
        if error:
            self.log_result("Get User Favorites", False, error)
            return []
            
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get User Favorites", True, 
                              f"Retrieved {len(data)} favorites")
                return data
            else:
                self.log_result("Get User Favorites", False, "Invalid response format")
        else:
            self.log_result("Get User Favorites", False, 
                          f"HTTP {response.status_code}: {response.text}")
        return []
    
    def test_delete_favorite(self, favorite_id):
        """Test DELETE /api/favorites/{favorite_id}"""
        print("\n🧪 Testing Delete Favorite...")
        
        if not favorite_id:
            self.log_result("Delete Favorite", False, "No favorite ID to delete")
            return
            
        response, error = self.make_request("DELETE", f"/favorites/{favorite_id}")
        if error:
            self.log_result("Delete Favorite", False, error)
            return
            
        if response.status_code == 200:
            self.log_result("Delete Favorite", True, "Favorite deleted successfully")
        elif response.status_code == 404:
            self.log_result("Delete Favorite", False, "Favorite not found")
        else:
            self.log_result("Delete Favorite", False, 
                          f"HTTP {response.status_code}: {response.text}")
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("🚀 STARTING COMPREHENSIVE BACKEND API TESTING")
        print(f"📋 Base URL: {self.base_url}")
        print(f"👤 User ID: {self.user_id}")
        print("=" * 80)
        
        # Test common ingredients
        self.test_common_ingredients_list()
        
        # Test ingredient management
        ingredient_id = self.test_add_ingredient()
        self.test_get_user_ingredients()
        self.test_delete_ingredient(ingredient_id)
        
        # Test meal plan generation (AI endpoints)
        daily_plan_id = self.test_generate_daily_meal_plan()
        weekly_plan_id = self.test_generate_weekly_meal_plan()
        
        # Test meal plan retrieval
        self.test_get_user_meal_plans()
        
        # Test favorites
        favorite_id = self.test_add_favorite()
        self.test_get_user_favorites()
        self.test_delete_favorite(favorite_id)
        
        # Clean up meal plans
        if daily_plan_id:
            self.test_delete_meal_plan(daily_plan_id)
        if weekly_plan_id:
            self.test_delete_meal_plan(weekly_plan_id)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"✅ PASSED: {passed}")
        print(f"❌ FAILED: {failed}")
        print(f"📈 SUCCESS RATE: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
        
        print("=" * 80)

def main():
    """Main test execution"""
    print("Meal Planning App - Backend API Testing")
    print("Testing all endpoints with comprehensive validation...")
    
    tester = MealPlanningAPITester(BASE_URL, USER_ID)
    tester.run_all_tests()
    
    # Return exit code based on results
    failed_tests = sum(1 for result in tester.test_results if not result["success"])
    if failed_tests > 0:
        sys.exit(1)  # Indicate failure
    else:
        sys.exit(0)  # Indicate success

if __name__ == "__main__":
    main()