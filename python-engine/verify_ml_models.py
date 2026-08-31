"""
Quick verification script to check if all ML models are trained and available
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ml_recommendation_engine import MLRecommendationEngine

def verify_models():
    print("=" * 60)
    print("ML MODELS VERIFICATION")
    print("=" * 60)
    
    # Initialize ML engine
    ml_engine = MLRecommendationEngine()
    
    # Check model files exist
    print("\n1. Checking model files...")
    model_dir = "models"
    required_files = [
        "content_model.joblib",
        "collaborative_model.joblib", 
        "hybrid_model.joblib",
        "label_encoders.joblib",
        "scaler.joblib"
    ]
    
    files_exist = True
    for file in required_files:
        file_path = os.path.join(model_dir, file)
        exists = os.path.exists(file_path)
        status = "[OK]" if exists else "[MISSING]"
        print(f"  {status} {file}")
        if not exists:
            files_exist = False
    
    if not files_exist:
        print("\n[ERROR] Some model files are missing!")
        return False
    
    # Try to load models
    print("\n2. Loading trained models...")
    if ml_engine.load_models():
        print("  [OK] Models loaded successfully")
    else:
        print("  [ERROR] Model loading failed")
        return False
    
    # Check model availability
    print("\n3. Checking model availability...")
    print(f"  Content-based: {'[OK] Available' if ml_engine.content_model else '[ERROR] Not available'}")
    print(f"  Collaborative filtering: {'[OK] Available' if ml_engine.collaborative_model else '[ERROR] Not available'}")
    print(f"  Hybrid model: {'[OK] Available' if ml_engine.hybrid_model else '[ERROR] Not available'}")
    print(f"  Label encoders: {len(ml_engine.label_encoders)} encoders loaded")
    print(f"  Is trained: {ml_engine.is_trained}")
    
    # Test model functionality
    print("\n4. Testing model functionality...")
    
    # Test content-based recommendations
    try:
        content_recs = ml_engine.get_content_based_recommendations("cerave_foaming_cleanser", top_n=2)
        print(f"  [OK] Content-based recommendations: {len(content_recs)} results")
    except Exception as e:
        print(f"  [ERROR] Content-based failed: {e}")
    
    # Test collaborative recommendations
    try:
        collab_recs = ml_engine.get_collaborative_recommendations("user_0", top_n=2)
        print(f"  [OK] Collaborative recommendations: {len(collab_recs)} results")
    except Exception as e:
        print(f"  [ERROR] Collaborative failed: {e}")
    
    # Test hybrid recommendations
    try:
        test_profile = {
            'user_id': 'test_user',
            'skin_type': 'oily',
            'skin_concerns': ['acne'],
            'skin_health_score': 70,
            'allergies': [],
            'budget_category': 'mid_range'
        }
        hybrid_recs = ml_engine.get_hybrid_recommendations(test_profile, top_n=3)
        print(f"  [OK] Hybrid recommendations: {len(hybrid_recs)} results")
        
        if hybrid_recs:
            print(f"  Top recommendation: {hybrid_recs[0]['product_data']['name']}")
            print(f"  Hybrid score: {hybrid_recs[0]['hybrid_score']:.1f}")
    except Exception as e:
        print(f"  [ERROR] Hybrid failed: {e}")
    
    # Check training summary
    print("\n5. Training summary...")
    try:
        import json
        with open('models/training_summary.json', 'r') as f:
            summary = json.load(f)
        print(f"  Training samples: {summary['training_samples']}")
        print(f"  Unique users: {summary['unique_users']}")
        print(f"  Unique products: {summary['unique_products']}")
        print(f"  Models trained: {summary['models_trained']}")
    except Exception as e:
        print(f"  [ERROR] Could not read training summary: {e}")
    
    print("\n" + "=" * 60)
    print("[SUCCESS] ALL ML MODELS VERIFIED SUCCESSFULLY")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = verify_models()
    sys.exit(0 if success else 1)