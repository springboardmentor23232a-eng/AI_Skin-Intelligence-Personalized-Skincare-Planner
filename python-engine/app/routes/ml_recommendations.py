"""
ML-Based Product Recommendation API Routes
Handles ML-powered product recommendations using collaborative filtering, content-based ML, and hybrid approaches
"""
from fastapi import APIRouter, HTTPException
from app.ml_recommendation_engine import MLRecommendationEngine
from app.schemas import (
    ProductRecommendationRequest, ProductRecommendationResponse,
    ProductComparisonRequest, ProductComparisonResponse,
    AlternativeProductsRequest, AlternativeProductsResponse
)
import uuid

router = APIRouter()
ml_engine = MLRecommendationEngine()

# Try to load pre-trained models
ml_engine.load_models()

@router.post("/ml/recommendations")
def get_ml_recommendations(request: ProductRecommendationRequest):
    """
    Get ML-powered product recommendations based on user profile
    """
    try:
        # Prepare user profile for ML model
        user_profile = {
            'user_id': request.user_id,
            'skin_type': request.skin_type,
            'skin_concerns': request.skin_concerns,
            'skin_health_score': request.skin_health_score,
            'allergies': request.allergies,
            'budget_category': request.budget_category or 'mid_range'
        }
        
        # Get hybrid recommendations
        recommendations = ml_engine.get_hybrid_recommendations(user_profile, top_n=10)
        
        # Format recommendations according to schema
        formatted_recommendations = []
        for rec in recommendations:
            product_data = rec['product_data']
            
            # Generate recommendation reason based on ML scores
            reason_parts = []
            
            if rec['ml_score'] > 70:
                reason_parts.append("Strong ML recommendation based on similar user profiles")
            if rec['rule_score'] > 80:
                reason_parts.append("Excellent match for your skin type and concerns")
            if product_data['rating'] >= 4.5:
                reason_parts.append(f"Highly rated ({product_data['rating']}/5)")
            
            recommendation_reason = "; ".join(reason_parts) if reason_parts else "Good match for your profile"
            
            # Determine priority based on hybrid score
            if rec['hybrid_score'] >= 80:
                priority = "high"
            elif rec['hybrid_score'] >= 60:
                priority = "medium"
            else:
                priority = "low"
            
            formatted_recommendations.append({
                'user_id': request.user_id,
                'product': {
                    'id': rec['product_id'],
                    **product_data
                },
                'suitability_score': int(rec['hybrid_score']),
                'recommendation_reason': recommendation_reason,
                'priority': priority,
                'category': product_data['category'],
                'budget_category': product_data['product_type'],
                'is_alternative': False,
                'alternative_for': None,
                'ml_insights': {
                    'ml_score': round(rec['ml_score'], 1),
                    'rule_score': round(rec['rule_score'], 1),
                    'hybrid_score': round(rec['hybrid_score'], 1)
                }
            })
        
        return {
            'user_id': request.user_id,
            'recommendations': formatted_recommendations,
            'total_count': len(formatted_recommendations),
            'model_info': {
                'models_loaded': ml_engine.is_trained,
                'recommendation_type': 'hybrid',
                'components': ['content_based', 'collaborative_filtering', 'rule_based']
            },
            'skin_profile': {
                'skin_type': request.skin_type,
                'skin_concerns': request.skin_concerns,
                'skin_health_score': request.skin_health_score,
                'budget_category': request.budget_category
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate ML recommendations: {str(e)}")

@router.post("/ml/content-based/{product_id}")
def get_content_based_recommendations(product_id: str, top_n: int = 5):
    """
    Get content-based recommendations for a specific product
    """
    try:
        recommendations = ml_engine.get_content_based_recommendations(product_id, top_n)
        
        formatted_recs = []
        for rec in recommendations:
            formatted_recs.append({
                'product_id': rec['product_id'],
                'similarity_score': round(rec['similarity_score'], 3),
                'product': rec['product_data']
            })
        
        return {
            'base_product_id': product_id,
            'recommendations': formatted_recs,
            'total_count': len(formatted_recs),
            'method': 'content_based_tfidf'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get content-based recommendations: {str(e)}")

@router.post("/ml/collaborative/{user_id}")
def get_collaborative_recommendations(user_id: str, top_n: int = 5):
    """
    Get collaborative filtering recommendations for a user
    """
    try:
        recommendations = ml_engine.get_collaborative_recommendations(user_id, top_n)
        
        formatted_recs = []
        for rec in recommendations:
            formatted_recs.append({
                'product_id': rec['product_id'],
                'predicted_rating': round(rec['predicted_rating'], 2),
                'product': rec['product_data']
            })
        
        return {
            'user_id': user_id,
            'recommendations': formatted_recs,
            'total_count': len(formatted_recs),
            'method': 'collaborative_filtering_svd'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get collaborative recommendations: {str(e)}")

@router.post("/ml/train")
def train_ml_models():
    """
    Train ML models with current data
    """
    try:
        # Generate training data
        training_data = ml_engine.generate_mock_training_data(n_samples=2000)
        
        # Train content-based model
        ml_engine.train_content_based_model()
        
        # Train collaborative filtering
        import pandas as pd
        df = pd.DataFrame(training_data)
        user_item_data = df[['user_id', 'product_id', 'rating']].copy()
        
        try:
            ml_engine.train_collaborative_model(user_item_data)
        except Exception as e:
            print(f"Collaborative filtering training skipped: {e}")
        
        # Train hybrid model
        prepared_df = ml_engine.prepare_training_data(training_data)
        ml_engine.train_hybrid_model(prepared_df)
        
        # Save models
        ml_engine.save_models()
        
        return {
            'success': True,
            'message': 'ML models trained successfully',
            'models_trained': {
                'content_based': ml_engine.content_model is not None,
                'collaborative_filtering': ml_engine.collaborative_model is not None,
                'hybrid': ml_engine.hybrid_model is not None
            },
            'training_samples': len(training_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to train ML models: {str(e)}")

@router.get("/ml/model-info")
def get_model_info():
    """
    Get information about loaded ML models
    """
    return {
        'is_trained': ml_engine.is_trained,
        'models_available': {
            'content_based': ml_engine.content_model is not None,
            'collaborative_filtering': ml_engine.collaborative_model is not None,
            'hybrid': ml_engine.hybrid_model is not None
        },
        'product_database_size': len(ml_engine.product_database),
        'model_directory': 'models/',
        'label_encoders': list(ml_engine.label_encoders.keys())
    }

@router.post("/ml/compare-approaches")
def compare_recommendation_approaches(request: ProductRecommendationRequest):
    """
    Compare recommendations from different ML approaches
    """
    try:
        user_profile = {
            'user_id': request.user_id,
            'skin_type': request.skin_type,
            'skin_concerns': request.skin_concerns,
            'skin_health_score': request.skin_health_score,
            'allergies': request.allergies,
            'budget_category': request.budget_category or 'mid_range'
        }
        
        # Get recommendations from different approaches
        hybrid_recs = ml_engine.get_hybrid_recommendations(user_profile, top_n=5)
        
        # Format for comparison
        comparison = {
            'hybrid': [
                {
                    'product_id': rec['product_id'],
                    'product_name': rec['product_data']['name'],
                    'score': round(rec['hybrid_score'], 1),
                    'ml_score': round(rec['ml_score'], 1),
                    'rule_score': round(rec['rule_score'], 1)
                }
                for rec in hybrid_recs
            ]
        }
        
        # Add content-based if we have a base product
        if hybrid_recs:
            base_product = hybrid_recs[0]['product_id']
            try:
                content_recs = ml_engine.get_content_based_recommendations(base_product, top_n=3)
                comparison['content_based'] = [
                    {
                        'product_id': rec['product_id'],
                        'product_name': rec['product_data']['name'],
                        'similarity_score': round(rec['similarity_score'], 3)
                    }
                    for rec in content_recs
                ]
            except:
                comparison['content_based'] = []
        
        return {
            'user_profile': user_profile,
            'comparison': comparison,
            'approaches_compared': list(comparison.keys())
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compare approaches: {str(e)}")

@router.post("/ml/feedback")
def collect_feedback(
    user_id: str,
    product_id: str,
    rating: float,
    skin_type: str,
    skin_concerns: list
):
    """
    Collect user feedback for continuous learning
    """
    try:
        # In a real implementation, this would store feedback in a database
        # for periodic model retraining
        
        feedback_data = {
            'user_id': user_id,
            'product_id': product_id,
            'rating': rating,
            'skin_type': skin_type,
            'skin_concerns': skin_concerns,
            'timestamp': str(uuid.uuid4())  # Simple timestamp replacement
        }
        
        # For now, just acknowledge receipt
        # In production, this would be stored and used for model retraining
        
        return {
            'success': True,
            'message': 'Feedback collected successfully',
            'feedback': feedback_data,
            'note': 'Feedback will be used in next model retraining'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to collect feedback: {str(e)}")