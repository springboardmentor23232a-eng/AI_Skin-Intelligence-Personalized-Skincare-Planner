"""
ML Model Training Pipeline
Trains and evaluates the ML recommendation models
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ml_recommendation_engine import MLRecommendationEngine
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
import json

def main():
    print("=" * 60)
    print("ML RECOMMENDATION ENGINE TRAINING PIPELINE")
    print("=" * 60)
    
    # Initialize the ML engine
    ml_engine = MLRecommendationEngine()
    
    # Generate mock training data
    print("\n1. Generating training data...")
    training_data = ml_engine.generate_mock_training_data(n_samples=2000)
    print(f"Generated {len(training_data)} training samples")
    
    # Convert to DataFrame
    df = pd.DataFrame(training_data)
    print(f"Data shape: {df.shape}")
    print(f"Rating distribution:\n{df['rating'].describe()}")
    
    # Train content-based model
    print("\n2. Training content-based model...")
    ml_engine.train_content_based_model()
    
    # Test content-based recommendations
    print("\n3. Testing content-based recommendations...")
    test_product = "cerave_foaming_cleanser"
    content_recs = ml_engine.get_content_based_recommendations(test_product, top_n=3)
    print(f"Recommendations for {test_product}:")
    for rec in content_recs:
        print(f"  - {rec['product_data']['name']} (similarity: {rec['similarity_score']:.3f})")
    
    # Prepare data for collaborative filtering
    print("\n4. Preparing collaborative filtering data...")
    user_item_data = df[['user_id', 'product_id', 'rating']].copy()
    print(f"User-item interactions: {len(user_item_data)}")
    print(f"Unique users: {user_item_data['user_id'].nunique()}")
    print(f"Unique products: {user_item_data['product_id'].nunique()}")
    
    # Train collaborative filtering model
    print("\n5. Training collaborative filtering model...")
    try:
        ml_engine.train_collaborative_model(user_item_data)
        
        # Test collaborative recommendations
        print("\n6. Testing collaborative recommendations...")
        test_user = "user_0"
        collab_recs = ml_engine.get_collaborative_recommendations(test_user, top_n=3)
        print(f"Recommendations for {test_user}:")
        for rec in collab_recs:
            print(f"  - {rec['product_data']['name']} (predicted rating: {rec['predicted_rating']:.2f})")
    except Exception as e:
        print(f"Collaborative filtering training failed: {e}")
        print("This is expected if there's insufficient user interaction data")
    
    # Train hybrid model
    print("\n7. Training hybrid model...")
    try:
        # Prepare training data for hybrid model
        prepared_df = ml_engine.prepare_training_data(training_data)
        
        # Split data
        train_df, test_df = train_test_split(prepared_df, test_size=0.2, random_state=42)
        
        # Train hybrid model
        ml_engine.train_hybrid_model(train_df)
        
        # Evaluate hybrid model
        print("\n8. Evaluating hybrid model...")
        
        # Prepare test features
        test_features = []
        test_targets = []
        
        for _, row in test_df.iterrows():
            product_id = row['product_id']
            product_data = ml_engine.product_database.get(product_id, {})
            
            if not product_data:
                continue
            
            user_profile = {
                'skin_type': row['skin_type'],
                'skin_concerns': row['user_concerns'],
                'budget_category': row['product_type'],
                'skin_health_score': 70
            }
            
            feature_vector = ml_engine._prepare_feature_vector(user_profile, product_data)
            test_features.append(feature_vector)
            test_targets.append(row['rating'])  # Continuous rating
        
        if test_features:
            X_test = np.array(test_features)
            y_test = np.array(test_targets)
            
            # Make predictions
            model = ml_engine.hybrid_model['model']
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_test, y_pred)
            
            print(f"Test RMSE: {rmse:.3f}")
            print(f"Test MAE: {mae:.3f}")
            
            # Feature importance
            feature_importance = dict(zip(
                ml_engine.hybrid_model['feature_names'],
                model.feature_importances_
            ))
            print(f"\nFeature Importance:")
            for feature, importance in sorted(feature_importance.items(), key=lambda x: x[1], reverse=True):
                print(f"  {feature}: {importance:.3f}")
    
    except Exception as e:
        print(f"Hybrid model training failed: {e}")
    
    # Test hybrid recommendations
    print("\n9. Testing hybrid recommendations...")
    test_user_profile = {
        'user_id': 'test_user',
        'skin_type': 'oily',
        'skin_concerns': ['acne', 'pores'],
        'skin_health_score': 65,
        'allergies': ['fragrance'],
        'budget_category': 'mid_range'
    }
    
    hybrid_recs = ml_engine.get_hybrid_recommendations(test_user_profile, top_n=5)
    print(f"Hybrid recommendations for oily skin with acne concerns:")
    for i, rec in enumerate(hybrid_recs, 1):
        print(f"  {i}. {rec['product_data']['name']}")
        print(f"     Hybrid Score: {rec['hybrid_score']:.1f}")
        print(f"     ML Score: {rec['ml_score']:.1f}")
        print(f"     Rule Score: {rec['rule_score']:.1f}")
        print(f"     Price: ${rec['product_data']['price']:.2f}")
    
    # Save models
    print("\n10. Saving trained models...")
    ml_engine.save_models()
    
    # Test model loading
    print("\n11. Testing model loading...")
    new_engine = MLRecommendationEngine()
    if new_engine.load_models():
        print("Models loaded successfully")
        
        # Test loaded model
        loaded_recs = new_engine.get_hybrid_recommendations(test_user_profile, top_n=3)
        print(f"Loaded model generated {len(loaded_recs)} recommendations")
    else:
        print("Model loading failed")
    
    print("\n" + "=" * 60)
    print("TRAINING PIPELINE COMPLETED SUCCESSFULLY")
    print("=" * 60)
    
    # Save training summary
    summary = {
        'training_samples': len(training_data),
        'unique_users': df['user_id'].nunique(),
        'unique_products': df['product_id'].nunique(),
        'models_trained': {
            'content_based': ml_engine.content_model is not None,
            'collaborative_filtering': ml_engine.collaborative_model is not None,
            'hybrid': ml_engine.hybrid_model is not None
        },
        'product_database_size': len(ml_engine.product_database)
    }
    
    with open('models/training_summary.json', 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"Training summary saved to models/training_summary.json")
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()