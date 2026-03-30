#!/usr/bin/env python3
"""
Critical Delete/Clear Functionality Test
Testing ingredient delete and clear functionality specifically as requested.
"""

import asyncio
import aiohttp
import json
import sys
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "https://recipe-daily-1.preview.emergentagent.com/api"

# Test user as specified in the request
TEST_USER = "test_user_delete_verify_20250308"

class IngredientDeleteClearTest:
    def __init__(self):
        self.session = None
        self.test_results = []
        self.ingredient_ids = []
        
    async def setup(self):
        """Setup HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    def log_result(self, step, success, message, data=None):
        """Log test result"""
        result = {
            "step": step,
            "success": success,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅" if success else "❌"
        print(f"{status} Step {step}: {message}")
        if data:
            print(f"   Data: {data}")
        print()
        
    async def make_request(self, method, endpoint, data=None):
        """Make HTTP request with error handling"""
        url = f"{BACKEND_URL}{endpoint}"
        try:
            if method == "GET":
                async with self.session.get(url) as response:
                    response_data = await response.json()
                    return response.status, response_data
            elif method == "POST":
                async with self.session.post(url, json=data) as response:
                    response_data = await response.json()
                    return response.status, response_data
            elif method == "DELETE":
                async with self.session.delete(url) as response:
                    response_data = await response.json()
                    return response.status, response_data
        except Exception as e:
            return None, {"error": str(e)}
            
    async def get_ingredient_count(self):
        """Get current ingredient count for user"""
        status, data = await self.make_request("GET", f"/ingredients/{TEST_USER}")
        if status == 200:
            return len(data)
        return 0
        
    async def get_ingredients_list(self):
        """Get current ingredients list for user"""
        status, data = await self.make_request("GET", f"/ingredients/{TEST_USER}")
        if status == 200:
            return data
        return []
        
    async def step_1_add_5_ingredients(self):
        """Step 1: Add 5 ingredients"""
        ingredients_to_add = ["tomatoes", "onions", "garlic", "chicken", "rice"]
        
        for ingredient in ingredients_to_add:
            status, data = await self.make_request("POST", "/ingredients/add", {
                "user_id": TEST_USER,
                "ingredient_name": ingredient
            })
            
            if status == 200:
                self.ingredient_ids.append(data["id"])
                
        count = await self.get_ingredient_count()
        ingredients_list = await self.get_ingredients_list()
        ingredient_names = [ing["ingredient_name"] for ing in ingredients_list]
        
        success = count == 5
        self.log_result(
            1, 
            success, 
            f"Added 5 ingredients. Current count: {count}",
            {"ingredient_names": ingredient_names, "ingredient_ids": self.ingredient_ids}
        )
        return success
        
    async def step_2_verify_ingredients_appear(self):
        """Step 2: Verify they appear in GET request"""
        ingredients_list = await self.get_ingredients_list()
        count = len(ingredients_list)
        ingredient_names = [ing["ingredient_name"] for ing in ingredients_list]
        
        success = count == 5
        self.log_result(
            2,
            success,
            f"Verified ingredients in GET request. Count: {count}",
            {"ingredient_names": ingredient_names}
        )
        return success
        
    async def step_3_delete_one_ingredient(self):
        """Step 3: Delete ONE ingredient by ID"""
        if not self.ingredient_ids:
            self.log_result(3, False, "No ingredient IDs available for deletion", None)
            return False
            
        ingredient_to_delete = self.ingredient_ids[0]
        status, data = await self.make_request("DELETE", f"/ingredients/{ingredient_to_delete}")
        
        success = status == 200
        self.log_result(
            3,
            success,
            f"Deleted ingredient {ingredient_to_delete}. Status: {status}",
            {"response": data, "deleted_id": ingredient_to_delete}
        )
        
        if success:
            self.ingredient_ids.remove(ingredient_to_delete)
            
        return success
        
    async def step_4_verify_removal(self):
        """Step 4: Verify it's removed"""
        count = await self.get_ingredient_count()
        ingredients_list = await self.get_ingredients_list()
        ingredient_names = [ing["ingredient_name"] for ing in ingredients_list]
        
        success = count == 4
        self.log_result(
            4,
            success,
            f"Verified ingredient removal. Current count: {count}",
            {"ingredient_names": ingredient_names}
        )
        return success
        
    async def step_5_add_2_more_ingredients(self):
        """Step 5: Add 2 more ingredients (total should be 6)"""
        additional_ingredients = ["pasta", "cheese"]
        
        for ingredient in additional_ingredients:
            status, data = await self.make_request("POST", "/ingredients/add", {
                "user_id": TEST_USER,
                "ingredient_name": ingredient
            })
            
            if status == 200:
                self.ingredient_ids.append(data["id"])
                
        count = await self.get_ingredient_count()
        ingredients_list = await self.get_ingredients_list()
        ingredient_names = [ing["ingredient_name"] for ing in ingredients_list]
        
        success = count == 6
        self.log_result(
            5,
            success,
            f"Added 2 more ingredients. Total count: {count}",
            {"ingredient_names": ingredient_names, "total_ingredient_ids": len(self.ingredient_ids)}
        )
        return success
        
    async def step_6_clear_all_ingredients(self):
        """Step 6: Clear ALL ingredients"""
        status, data = await self.make_request("DELETE", f"/ingredients/clear/{TEST_USER}")
        
        success = status == 200
        self.log_result(
            6,
            success,
            f"Clear all ingredients request. Status: {status}",
            {"response": data}
        )
        return success
        
    async def step_7_verify_empty(self):
        """Step 7: Verify pantry is empty (count = 0)"""
        count = await self.get_ingredient_count()
        ingredients_list = await self.get_ingredients_list()
        
        success = count == 0
        self.log_result(
            7,
            success,
            f"Verified pantry is empty. Count: {count}",
            {"ingredients_list": ingredients_list}
        )
        return success
        
    async def run_comprehensive_test(self):
        """Run the complete test sequence as specified"""
        print("🧪 CRITICAL DELETE/CLEAR FUNCTIONALITY TEST")
        print("=" * 60)
        print(f"Test User: {TEST_USER}")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        print()
        
        await self.setup()
        
        try:
            # Clear any existing data first
            await self.make_request("DELETE", f"/ingredients/clear/{TEST_USER}")
            
            # Run test sequence
            step_results = []
            step_results.append(await self.step_1_add_5_ingredients())
            step_results.append(await self.step_2_verify_ingredients_appear())
            step_results.append(await self.step_3_delete_one_ingredient())
            step_results.append(await self.step_4_verify_removal())
            step_results.append(await self.step_5_add_2_more_ingredients())
            step_results.append(await self.step_6_clear_all_ingredients())
            step_results.append(await self.step_7_verify_empty())
            
            # Summary
            passed_steps = sum(step_results)
            total_steps = len(step_results)
            
            print("=" * 60)
            print("🔍 DETAILED TEST SUMMARY")
            print("=" * 60)
            
            for i, result in enumerate(self.test_results, 1):
                status = "✅ PASS" if result["success"] else "❌ FAIL"
                print(f"Step {result['step']}: {status} - {result['message']}")
                if result["data"]:
                    print(f"         Data: {result['data']}")
                print()
                
            print("=" * 60)
            print(f"📊 OVERALL RESULT: {passed_steps}/{total_steps} steps passed")
            
            if passed_steps == total_steps:
                print("🎉 ALL TESTS PASSED - Delete/Clear functionality working correctly!")
            else:
                print("⚠️  SOME TESTS FAILED - Delete/Clear functionality has issues!")
                
            print("=" * 60)
            
            return passed_steps == total_steps
            
        finally:
            await self.cleanup()

async def main():
    """Main test execution"""
    test = IngredientDeleteClearTest()
    success = await test.run_comprehensive_test()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())