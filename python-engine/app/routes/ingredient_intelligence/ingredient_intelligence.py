"""
Ingredient Intelligence API Routes
Handles ingredient analysis, suitability assessment, interaction analysis, and education
"""
from fastapi import APIRouter, HTTPException
from app.ingredient_intelligence import IngredientIntelligence
from app.schemas import IngredientInteractionRequest
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()
ingredient_engine = IngredientIntelligence()

class SimpleIngredientRequest(BaseModel):
    ingredient_name: str
    skin_type: Optional[str] = None
    skin_concerns: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    current_ingredients: Optional[List[str]] = None

@router.post("/ingredient/analyze")
def analyze_ingredient(request: SimpleIngredientRequest):
    """
    Analyze an ingredient for suitability based on user profile
    """
    try:
        result = ingredient_engine.analyze_ingredient(request.dict())
        
        if 'error' in result:
            raise HTTPException(status_code=404, detail=result['error'])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze ingredient: {str(e)}")

@router.post("/ingredient/interactions")
def analyze_ingredient_interactions(request: IngredientInteractionRequest):
    """
    Analyze interactions between multiple ingredients
    """
    try:
        result = ingredient_engine.analyze_ingredient_interactions(request.ingredients)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze interactions: {str(e)}")

@router.get("/ingredient/categories")
def get_ingredient_categories():
    """
    Get available ingredient categories
    """
    categories = {
        'retinoids': {
            'name': 'Retinoids',
            'description': 'Vitamin A derivatives that accelerate cell turnover and collagen production',
            'examples': ['Retinol', 'Retinaldehyde', 'Retinyl Palmitate']
        },
        'niacinamide': {
            'name': 'Niacinamide',
            'description': 'Vitamin B3 that strengthens skin barrier and reduces inflammation',
            'examples': ['Niacinamide', 'Nicotinamide']
        },
        'vitamin_c': {
            'name': 'Vitamin C',
            'description': 'Antioxidant that brightens skin and protects against environmental damage',
            'examples': ['Ascorbic Acid', 'Sodium Ascorbyl Phosphate', 'Magnesium Ascorbyl Phosphate']
        },
        'hyaluronic_acid': {
            'name': 'Hyaluronic Acid',
            'description': 'Humectant that attracts and retains moisture in the skin',
            'examples': ['Hyaluronic Acid', 'Sodium Hyaluronate']
        },
        'salicylic_acid': {
            'name': 'Salicylic Acid',
            'description': 'BHA that exfoliates inside pores and reduces acne',
            'examples': ['Salicylic Acid', 'Beta Hydroxy Acid']
        },
        'ceramides': {
            'name': 'Ceramides',
            'description': 'Lipid molecules that form the skin barrier and retain moisture',
            'examples': ['Ceramide NP', 'Ceramide AP', 'Ceramide EOP']
        },
        'peptides': {
            'name': 'Peptides',
            'description': 'Amino acid chains that stimulate collagen production and repair',
            'examples': ['Palmitoyl Pentapeptide-4', 'Copper Peptide', 'Matrixyl']
        },
        'ahas_bhas': {
            'name': 'AHAs/BHAs',
            'description': 'Alpha and beta hydroxy acids that exfoliate and improve skin texture',
            'examples': ['Glycolic Acid', 'Lactic Acid', 'Mandelic Acid', 'Salicylic Acid']
        }
    }
    
    return categories

@router.get("/ingredient/category/{category}")
def get_ingredients_by_category(category: str):
    """
    Get all ingredients in a specific category
    """
    try:
        ingredients = ingredient_engine.get_ingredient_by_category(category)
        return {
            'category': category,
            'ingredients': ingredients,
            'count': len(ingredients)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get ingredients: {str(e)}")

@router.get("/ingredient/search")
def search_ingredients(query: str):
    """
    Search for ingredients by name or benefit
    """
    try:
        results = ingredient_engine.search_ingredients(query)
        return {
            'query': query,
            'results': results,
            'count': len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search ingredients: {str(e)}")