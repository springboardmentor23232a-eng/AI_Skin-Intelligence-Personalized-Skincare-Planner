"""
Product Recommendation API Routes
Handles personalized product recommendations, comparison, and alternatives
"""
from fastapi import APIRouter, HTTPException
from app.product_recommendation import ProductRecommendationEngine
from app.schemas import ProductRecommendationRequest

router = APIRouter()
product_engine = ProductRecommendationEngine()

@router.post("/products/recommendations")
def get_product_recommendations(request: ProductRecommendationRequest):
    """
    Get personalized product recommendations based on user profile
    """
    try:
        recommendations = product_engine.generate_recommendations(request.dict())
        
        return {
            'user_id': request.user_id,
            'recommendations': recommendations,
            'total_count': len(recommendations),
            'skin_profile': {
                'skin_type': request.skin_type,
                'skin_concerns': request.skin_concerns,
                'skin_health_score': request.skin_health_score,
                'budget_category': request.budget_category
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@router.post("/products/compare")
def compare_products(request_data: dict):
    """
    Compare multiple products and provide detailed analysis
    """
    try:
        comparison = product_engine.compare_products(
            request_data.get('product_ids', []),
            request_data.get('user_skin_type', 'normal'),
            request_data.get('user_concerns', [])
        )
        
        if 'error' in comparison:
            raise HTTPException(status_code=400, detail=comparison['error'])
        
        return comparison
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare products: {str(e)}")

@router.post("/products/alternatives")
def get_alternative_products(request_data: dict):
    """
    Get alternative products for a given product
    """
    try:
        alternatives = product_engine.get_alternatives(
            request_data.get('product_id'),
            request_data.get('user_id'),
            request_data.get('reason'),
            request_data.get('budget_category')
        )
        
        if 'error' in alternatives:
            raise HTTPException(status_code=404, detail=alternatives['error'])
        
        return alternatives
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get alternatives: {str(e)}")

@router.get("/products/category/{category}")
def get_products_by_category(category: str):
    """
    Get all products in a specific category
    """
    try:
        products = product_engine.get_products_by_category(category)
        return {
            'category': category,
            'products': products,
            'count': len(products)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get products: {str(e)}")

@router.get("/products/search")
def search_products(query: str):
    """
    Search for products by name, brand, or ingredient
    """
    try:
        results = product_engine.search_products(query)
        return {
            'query': query,
            'results': results,
            'count': len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search products: {str(e)}")

@router.get("/products/categories")
def get_product_categories():
    """
    Get available product categories
    """
    categories = {
        'face_wash': {
            'name': 'Face Wash',
            'description': 'Cleansers for daily facial cleansing',
            'examples': ['Foaming Cleanser', 'Cream Cleanser', 'Gel Cleanser']
        },
        'moisturizer': {
            'name': 'Moisturizer',
            'description': 'Hydrating products for skin moisture',
            'examples': ['Day Cream', 'Night Cream', 'Gel Moisturizer']
        },
        'sunscreen': {
            'name': 'Sunscreen',
            'description': 'Sun protection products',
            'examples': ['SPF 30+', 'SPF 50+', 'Mineral Sunscreen']
        },
        'serum': {
            'name': 'Serum',
            'description': 'Concentrated treatment products',
            'examples': ['Vitamin C Serum', 'Retinol Serum', 'Hyaluronic Acid Serum']
        },
        'toner': {
            'name': 'Toner',
            'description': 'Products for balancing and preparing skin',
            'examples': ['Exfoliating Toner', 'Hydrating Toner', 'Balancing Toner']
        }
    }
    
    return categories

@router.get("/products/budget-categories")
def get_budget_categories():
    """
    Get available budget categories
    """
    categories = {
        'budget': {
            'name': 'Budget',
            'price_range': 'Under $25',
            'description': 'Affordable skincare options'
        },
        'mid_range': {
            'name': 'Mid-Range',
            'price_range': '$25 - $75',
            'description': 'Balanced quality and price'
        },
        'luxury': {
            'name': 'Luxury',
            'price_range': '$75+',
            'description': 'Premium skincare products'
        }
    }
    
    return categories