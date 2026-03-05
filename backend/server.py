from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Get LLM API Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class Ingredient(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: Optional[str] = None

class UserIngredient(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    ingredient_name: str
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Recipe(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    meal_type: str  # breakfast, lunch, dinner
    cuisine_type: str  # healthy, comfort
    ingredients: List[str]
    instructions: List[str]
    prep_time: str
    cook_time: str
    servings: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MealPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_type: str  # daily, weekly
    cuisine_type: str  # healthy, comfort
    meals: dict  # {day: {breakfast: Recipe, lunch: Recipe, dinner: Recipe}}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Favorite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    recipe: Recipe
    added_at: datetime = Field(default_factory=datetime.utcnow)

# ==================== REQUEST MODELS ====================

class GenerateMealPlanRequest(BaseModel):
    user_id: str
    plan_type: str  # daily or weekly
    cuisine_type: str  # healthy or comfort
    available_ingredients: Optional[List[str]] = None

class AddIngredientRequest(BaseModel):
    user_id: str
    ingredient_name: str

class GenerateRecipeRequest(BaseModel):
    user_id: str
    meal_type: str  # breakfast, lunch, dinner
    cuisine_type: str  # healthy, comfort
    available_ingredients: List[str]

class AddFavoriteRequest(BaseModel):
    user_id: str
    recipe: Recipe

# ==================== HELPER FUNCTIONS ====================

async def generate_meal_plan_with_ai(plan_type: str, cuisine_type: str, available_ingredients: List[str] = None) -> dict:
    """Generate a meal plan using AI"""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a professional chef and nutritionist. Generate detailed meal plans with recipes."
        ).with_model("openai", "gpt-5.2")
        
        ingredients_text = ""
        if available_ingredients and len(available_ingredients) > 0:
            ingredients_text = f"\n\nAvailable ingredients: {', '.join(available_ingredients)}"
        
        if plan_type == "daily":
            prompt = f"""Create a {cuisine_type} meal plan for ONE day (breakfast, lunch, and dinner).{ingredients_text}
            
For each meal, provide:
1. Recipe name
2. List of ingredients (with quantities)
3. Step-by-step cooking instructions
4. Prep time and cook time
5. Number of servings

Format your response as JSON:
{{
  "breakfast": {{
    "name": "Recipe name",
    "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
    "instructions": ["step 1", "step 2"],
    "prep_time": "10 minutes",
    "cook_time": "15 minutes",
    "servings": 2
  }},
  "lunch": {{ ... }},
  "dinner": {{ ... }}
}}

Make sure the recipes are {cuisine_type} and delicious!"""
        else:  # weekly
            prompt = f"""Create a {cuisine_type} meal plan for 7 days (breakfast, lunch, and dinner for each day).{ingredients_text}
            
For each meal, provide:
1. Recipe name
2. List of ingredients (with quantities)
3. Step-by-step cooking instructions
4. Prep time and cook time
5. Number of servings

Format your response as JSON:
{{
  "Monday": {{
    "breakfast": {{"name": "...", "ingredients": [...], "instructions": [...], "prep_time": "...", "cook_time": "...", "servings": 2}},
    "lunch": {{...}},
    "dinner": {{...}}
  }},
  "Tuesday": {{ ... }},
  ... (continue for all 7 days)
}}

Make sure the recipes are {cuisine_type} and varied throughout the week!"""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse the AI response
        import json
        # Extract JSON from response
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        meal_plan = json.loads(response_text)
        return meal_plan
        
    except Exception as e:
        logger.error(f"Error generating meal plan with AI: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate meal plan: {str(e)}")

# ==================== API ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "Meal Planning API"}

# Meal Plan Endpoints
@api_router.post("/meal-plan/generate")
async def generate_meal_plan(request: GenerateMealPlanRequest):
    """Generate a new meal plan"""
    try:
        logger.info(f"Generating {request.plan_type} {request.cuisine_type} meal plan for user {request.user_id}")
        
        # Generate meal plan using AI
        meals = await generate_meal_plan_with_ai(
            request.plan_type,
            request.cuisine_type,
            request.available_ingredients
        )
        
        # Create meal plan object
        meal_plan = MealPlan(
            user_id=request.user_id,
            plan_type=request.plan_type,
            cuisine_type=request.cuisine_type,
            meals=meals
        )
        
        # Save to database
        await db.meal_plans.insert_one(meal_plan.dict())
        
        return meal_plan
        
    except Exception as e:
        logger.error(f"Error generating meal plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/meal-plans/{user_id}")
async def get_meal_plans(user_id: str):
    """Get all meal plans for a user"""
    try:
        meal_plans = await db.meal_plans.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
        return [MealPlan(**plan) for plan in meal_plans]
    except Exception as e:
        logger.error(f"Error fetching meal plans: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/meal-plans/{plan_id}")
async def delete_meal_plan(plan_id: str):
    """Delete a meal plan"""
    try:
        result = await db.meal_plans.delete_one({"id": plan_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Meal plan not found")
        return {"message": "Meal plan deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting meal plan: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Ingredient Endpoints
@api_router.post("/ingredients/add")
async def add_ingredient(request: AddIngredientRequest):
    """Add an ingredient to user's pantry"""
    try:
        # Check if ingredient already exists
        existing = await db.user_ingredients.find_one({
            "user_id": request.user_id,
            "ingredient_name": request.ingredient_name.lower()
        })
        
        if existing:
            return {"message": "Ingredient already exists", "ingredient": UserIngredient(**existing)}
        
        user_ingredient = UserIngredient(
            user_id=request.user_id,
            ingredient_name=request.ingredient_name.lower()
        )
        
        await db.user_ingredients.insert_one(user_ingredient.dict())
        return user_ingredient
        
    except Exception as e:
        logger.error(f"Error adding ingredient: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ingredients/{user_id}")
async def get_user_ingredients(user_id: str):
    """Get all ingredients for a user"""
    try:
        ingredients = await db.user_ingredients.find({"user_id": user_id}).sort("ingredient_name", 1).to_list(1000)
        return [UserIngredient(**ing) for ing in ingredients]
    except Exception as e:
        logger.error(f"Error fetching ingredients: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/ingredients/{ingredient_id}")
async def delete_ingredient(ingredient_id: str):
    """Delete an ingredient"""
    try:
        result = await db.user_ingredients.delete_one({"id": ingredient_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Ingredient not found")
        return {"message": "Ingredient deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting ingredient: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ingredients/common/list")
async def get_common_ingredients():
    """Get a list of common ingredients"""
    common_ingredients = [
        "Eggs", "Milk", "Butter", "Cheese", "Bread", "Rice", "Pasta",
        "Chicken", "Beef", "Fish", "Tofu", "Beans", "Lentils",
        "Tomatoes", "Onions", "Garlic", "Potatoes", "Carrots", "Broccoli",
        "Spinach", "Bell Peppers", "Mushrooms", "Lettuce", "Cucumber",
        "Olive Oil", "Salt", "Pepper", "Sugar", "Flour", "Baking Powder",
        "Yogurt", "Cream", "Soy Sauce", "Vinegar", "Honey", "Cinnamon",
        "Basil", "Oregano", "Thyme", "Paprika", "Cumin", "Ginger",
        "Apples", "Bananas", "Oranges", "Berries", "Avocado", "Lemon"
    ]
    return {"ingredients": sorted(common_ingredients)}

# Favorites Endpoints
@api_router.post("/favorites/add")
async def add_favorite(request: AddFavoriteRequest):
    """Add a recipe to favorites"""
    try:
        favorite = Favorite(
            user_id=request.user_id,
            recipe=request.recipe
        )
        
        await db.favorites.insert_one(favorite.dict())
        return favorite
        
    except Exception as e:
        logger.error(f"Error adding favorite: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/favorites/{user_id}")
async def get_favorites(user_id: str):
    """Get all favorite recipes for a user"""
    try:
        favorites = await db.favorites.find({"user_id": user_id}).sort("added_at", -1).to_list(100)
        return [Favorite(**fav) for fav in favorites]
    except Exception as e:
        logger.error(f"Error fetching favorites: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/favorites/{favorite_id}")
async def delete_favorite(favorite_id: str):
    """Delete a favorite recipe"""
    try:
        result = await db.favorites.delete_one({"id": favorite_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Favorite not found")
        return {"message": "Favorite deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting favorite: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()