"""
ML-Based Product Recommendation Engine
Implements collaborative filtering, content-based ML, and hybrid recommendation systems
"""
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, precision_recall_fscore_support
import joblib
import json
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import os

class MLRecommendationEngine:
    def __init__(self):
        self.collaborative_model = None
        self.content_model = None
        self.hybrid_model = None
        self.product_embeddings = None
        self.user_embeddings = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.is_trained = False
        
        # Model paths
        self.model_dir = "models"
        os.makedirs(self.model_dir, exist_ok=True)
        
        # Initialize base product database (same as rule-based)
        self.product_database = self._initialize_product_database()
        
    def _initialize_product_database(self) -> Dict[str, dict]:
        """Initialize product database (same as rule-based engine)"""
        return {
            "cerave_foaming_cleanser": {
                "name": "CeraVe Foaming Facial Cleanser",
                "brand": "CeraVe",
                "category": "face_wash",
                "product_type": "drugstore",
                "price": 14.99,
                "currency": "USD",
                "key_ingredients": ["ceramide_np", "niacinamide", "hyaluronic_acid"],
                "suitable_skin_types": ["normal", "oily", "combination"],
                "target_concerns": ["dryness", "sensitivity", "barrier_repair"],
                "benefits": ["Cleanses without stripping", "Strengthens skin barrier", "Non-comedogenic", "Fragrance-free"],
                "warnings": ["May be drying for very dry skin"],
                "rating": 4.5,
                "reviews_count": 15000,
                "availability": "available"
            },
            "cleansing_balm": {
                "name": "Banila Co Clean It Zero Cleansing Balm",
                "brand": "Banila Co",
                "category": "face_wash",
                "product_type": "mid_range",
                "price": 23.00,
                "currency": "USD",
                "key_ingredients": ["esters", "extracts"],
                "suitable_skin_types": ["normal", "dry", "combination", "oily"],
                "target_concerns": ["makeup_removal", "cleansing"],
                "benefits": ["Effective makeup removal", "Gentle on skin", "Emulsifies easily"],
                "warnings": ["Contains fragrance"],
                "rating": 4.6,
                "reviews_count": 8000,
                "availability": "available"
            },
            "gentle_cleanser": {
                "name": "La Roche-Posay Toleriane Hydrating Gentle Cleanser",
                "brand": "La Roche-Posay",
                "category": "face_wash",
                "product_type": "drugstore",
                "price": 15.99,
                "currency": "USD",
                "key_ingredients": ["ceramide_np", "niacinamide", "glycerin"],
                "suitable_skin_types": ["normal", "dry", "sensitive", "combination"],
                "target_concerns": ["sensitivity", "dryness", "redness"],
                "benefits": ["Extremely gentle", "Non-foaming", "Soothes sensitive skin", "Fragrance-free"],
                "warnings": ["None"],
                "rating": 4.7,
                "reviews_count": 12000,
                "availability": "available"
            },
            "neutrogena_moisturizer": {
                "name": "Neutrogena Hydro Boost Water Gel",
                "brand": "Neutrogena",
                "category": "moisturizer",
                "product_type": "drugstore",
                "price": 18.99,
                "currency": "USD",
                "key_ingredients": ["hyaluronic_acid", "glycerin"],
                "suitable_skin_types": ["normal", "oily", "combination"],
                "target_concerns": ["dryness", "dehydration", "dullness"],
                "benefits": ["Oil-free", "Lightweight", "Hydrating", "Non-comedogenic"],
                "warnings": ["Contains alcohol"],
                "rating": 4.4,
                "reviews_count": 20000,
                "availability": "available"
            },
            "cerave_moisturizer": {
                "name": "CeraVe Daily Moisturizing Lotion",
                "brand": "CeraVe",
                "category": "moisturizer",
                "product_type": "drugstore",
                "price": 16.99,
                "currency": "USD",
                "key_ingredients": ["ceramide_np", "hyaluronic_acid", "niacinamide"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "target_concerns": ["dryness", "barrier_repair", "sensitivity"],
                "benefits": ["Strengthens barrier", "Long-lasting hydration", "Non-greasy", "Fragrance-free"],
                "warnings": ["May be too heavy for oily skin"],
                "rating": 4.6,
                "reviews_count": 18000,
                "availability": "available"
            },
            "la_mer_moisturizer": {
                "name": "La Mer Crème de la Mer",
                "brand": "La Mer",
                "category": "moisturizer",
                "product_type": "luxury",
                "price": 190.00,
                "currency": "USD",
                "key_ingredients": ["sea_kelp", "minerals", "oils"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "target_concerns": ["aging", "dryness", "luxury"],
                "benefits": ["Intensive hydration", "Anti-aging", "Luxury experience", "Skin smoothing"],
                "warnings": ["Very expensive", "Contains fragrance"],
                "rating": 4.3,
                "reviews_count": 3000,
                "availability": "available"
            },
            "supergoop_sunscreen": {
                "name": "Supergoop! Unseen Sunscreen",
                "brand": "Supergoop!",
                "category": "sunscreen",
                "product_type": "mid_range",
                "price": 34.00,
                "currency": "USD",
                "key_ingredients": ["avobenzone", "homosalate", "octisalate"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination", "sensitive"],
                "target_concerns": ["sun_protection", "anti_aging"],
                "benefits": ["Invisible finish", "Lightweight", "Broad spectrum", "No white cast"],
                "warnings": ["Contains chemical filters"],
                "rating": 4.5,
                "reviews_count": 10000,
                "availability": "available"
            },
            "elta_md_sunscreen": {
                "name": "EltaMD UV Clear Broad-Spectrum SPF 46",
                "brand": "EltaMD",
                "category": "sunscreen",
                "product_type": "mid_range",
                "price": 28.00,
                "currency": "USD",
                "key_ingredients": ["zinc_oxide", "niacinamide", "hyaluronic_acid"],
                "suitable_skin_types": ["normal", "oily", "combination", "sensitive"],
                "target_concerns": ["acne", "sensitivity", "sun_protection"],
                "benefits": ["Oil-free", "Contains niacinamide", "Physical/mineral filter", "Non-comedogenic"],
                "warnings": ["May leave slight white cast"],
                "rating": 4.7,
                "reviews_count": 15000,
                "availability": "available"
            },
            "cetaphil_sunscreen": {
                "name": "Cetaphil Pro Sun Defense Lightweight Sunscreen",
                "brand": "Cetaphil",
                "category": "sunscreen",
                "product_type": "drugstore",
                "price": 12.99,
                "currency": "USD",
                "key_ingredients": ["avobenzone", "octocrylene", "octisalate"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "target_concerns": ["sun_protection", "sensitivity"],
                "benefits": ["Affordable", "Gentle formula", "Broad spectrum", "Fragrance-free"],
                "warnings": ["Contains chemical filters"],
                "rating": 4.3,
                "reviews_count": 8000,
                "availability": "available"
            },
            "the_ordinary_serum": {
                "name": "The Ordinary Niacinamide 10% + Zinc 1%",
                "brand": "The Ordinary",
                "category": "serum",
                "product_type": "budget",
                "price": 7.90,
                "currency": "USD",
                "key_ingredients": ["niacinamide", "zinc_pca"],
                "suitable_skin_types": ["normal", "oily", "combination"],
                "target_concerns": ["acne", "pores", "oil_control", "barrier_repair"],
                "benefits": ["Oil control", "Pore minimizing", "Strengthens barrier", "Affordable"],
                "warnings": ["May cause pilling with other products"],
                "rating": 4.2,
                "reviews_count": 25000,
                "availability": "available"
            },
            "skinceuticals_serum": {
                "name": "SkinCeuticals C E Ferulic",
                "brand": "SkinCeuticals",
                "category": "serum",
                "product_type": "luxury",
                "price": 182.00,
                "currency": "USD",
                "key_ingredients": ["ascorbic_acid", "vitamin_e", "ferulic_acid"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "target_concerns": ["aging", "dark_spots", "environmental_damage"],
                "benefits": ["Advanced antioxidant protection", "Brightening", "Anti-aging", "Clinically proven"],
                "warnings": ["Expensive", "May cause tingling", "Short shelf life"],
                "rating": 4.6,
                "reviews_count": 5000,
                "availability": "available"
            },
            "good_molecules_serum": {
                "name": "Good Molecules Gentle Retinol Cream",
                "brand": "Good Molecules",
                "category": "serum",
                "product_type": "budget",
                "price": 14.00,
                "currency": "USD",
                "key_ingredients": ["retinol", "peptides", "niacinamide"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "target_concerns": ["aging", "texture", "fine_lines"],
                "benefits": ["Gentle retinol", "Affordable", "Contains peptides", "Barrier supporting"],
                "warnings": ["Still a retinol product"],
                "rating": 4.4,
                "reviews_count": 6000,
                "availability": "available"
            },
            "paulas_choice_toner": {
                "name": "Paula's Choice 2% BHA Liquid Exfoliant",
                "brand": "Paula's Choice",
                "category": "toner",
                "product_type": "mid_range",
                "price": 30.00,
                "currency": "USD",
                "key_ingredients": ["salicylic_acid", "green_tea"],
                "suitable_skin_types": ["oily", "combination", "normal"],
                "target_concerns": ["acne", "pores", "blackheads", "texture"],
                "benefits": ["Exfoliates pores", "Reduces acne", "Improves texture", "Anti-inflammatory"],
                "warnings": ["May cause purging", "Sun sensitivity"],
                "rating": 4.7,
                "reviews_count": 20000,
                "availability": "available"
            },
            "thayers_toner": {
                "name": "Thayers Witch Hazel Alcohol-Free Toner",
                "brand": "Thayers",
                "category": "toner",
                "product_type": "drugstore",
                "price": 10.99,
                "currency": "USD",
                "key_ingredients": ["witch_hazel", "aloe_vera"],
                "suitable_skin_types": ["normal", "oily", "combination", "sensitive"],
                "target_concerns": ["redness", "sensitivity", "oil_control"],
                "benefits": ["Alcohol-free", "Soothing", "Natural ingredients", "Affordable"],
                "warnings": ["Witch hazel can be drying for some"],
                "rating": 4.4,
                "reviews_count": 12000,
                "availability": "available"
            },
            "klairs_toner": {
                "name": "Klairs Supple Preparation Unscented Toner",
                "brand": "Klairs",
                "category": "toner",
                "product_type": "mid_range",
                "price": 22.00,
                "currency": "USD",
                "key_ingredients": ["hyaluronic_acid", "phyto_oligo", "aloe_barbadensis"],
                "suitable_skin_types": ["normal", "dry", "sensitive", "combination"],
                "target_concerns": ["dryness", "sensitivity", "hydration"],
                "benefits": ["Very gentle", "Hydrating", "Fragrance-free", "pH balancing"],
                "warnings": ["None"],
                "rating": 4.6,
                "reviews_count": 9000,
                "availability": "available"
            }
        }
    
    def prepare_training_data(self, user_interactions: List[dict]) -> pd.DataFrame:
        """
        Prepare training data from user interactions
        user_interactions: List of {user_id, product_id, rating, skin_type, concerns, etc.}
        """
        # Convert to DataFrame
        df = pd.DataFrame(user_interactions)
        
        # Feature engineering
        df['skin_type_encoded'] = self._encode_feature(df['skin_type'], 'skin_type')
        df['product_category_encoded'] = self._encode_feature(df['category'], 'category')
        df['product_type_encoded'] = self._encode_feature(df['product_type'], 'product_type')
        
        # Price normalization
        df['price_normalized'] = self.scaler.fit_transform(df[['price']])
        
        # Concern matching features
        df['concern_match_score'] = df.apply(
            lambda row: self._calculate_concern_match(row['user_concerns'], row['target_concerns']),
            axis=1
        )
        
        # Skin type compatibility
        df['skin_type_compatibility'] = df.apply(
            lambda row: 1 if row['skin_type'] in row['suitable_skin_types'] else 0,
            axis=1
        )
        
        return df
    
    def _encode_feature(self, series: pd.Series, feature_name: str) -> pd.Series:
        """Encode categorical features"""
        if feature_name not in self.label_encoders:
            self.label_encoders[feature_name] = LabelEncoder()
            self.label_encoders[feature_name].fit(series)
        return self.label_encoders[feature_name].transform(series)
    
    def _calculate_concern_match(self, user_concerns: list, product_concerns: list) -> float:
        """Calculate concern matching score"""
        if not user_concerns or not product_concerns:
            return 0.0
        
        user_set = set([c.lower() for c in user_concerns])
        product_set = set([c.lower() for c in product_concerns])
        
        matches = len(user_set & product_set)
        total = len(user_set)
        
        return matches / total if total > 0 else 0.0
    
    def train_content_based_model(self):
        """
        Train content-based model using TF-IDF and product features
        """
        # Prepare product content for TF-IDF
        product_content = []
        product_ids = []
        
        for product_id, product_data in self.product_database.items():
            # Combine text features
            content = f"{product_data['name']} {product_data['brand']} " \
                     f"{' '.join(product_data['key_ingredients'])} " \
                     f"{' '.join(product_data['benefits'])} " \
                     f"{' '.join(product_data['target_concerns'])}"
            
            product_content.append(content)
            product_ids.append(product_id)
        
        # Create TF-IDF matrix
        tfidf = TfidfVectorizer(max_features=100, stop_words='english')
        tfidf_matrix = tfidf.fit_transform(product_content)
        
        # Calculate cosine similarity matrix
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        
        # Store model components
        self.content_model = {
            'tfidf': tfidf,
            'tfidf_matrix': tfidf_matrix,
            'cosine_sim': cosine_sim,
            'product_ids': product_ids,
            'product_indices': {pid: idx for idx, pid in enumerate(product_ids)}
        }
        
        print("Content-based model trained successfully")
        
    def get_content_based_recommendations(self, product_id: str, top_n: int = 5) -> List[dict]:
        """
        Get content-based recommendations for a product
        """
        if not self.content_model:
            self.train_content_based_model()
        
        if product_id not in self.content_model['product_indices']:
            return []
        
        # Get product index
        idx = self.content_model['product_indices'][product_id]
        
        # Get similarity scores
        sim_scores = list(enumerate(self.content_model['cosine_sim'][idx]))
        
        # Sort by similarity score (excluding the product itself)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:top_n+1]
        
        # Get product recommendations
        recommendations = []
        for product_idx, score in sim_scores:
            recommended_product_id = self.content_model['product_ids'][product_idx]
            recommendations.append({
                'product_id': recommended_product_id,
                'similarity_score': score,
                'product_data': self.product_database[recommended_product_id]
            })
        
        return recommendations
    
    def train_collaborative_model(self, user_item_matrix: pd.DataFrame):
        """
        Train collaborative filtering model using matrix factorization
        user_item_matrix: DataFrame with user_id, product_id, rating columns
        """
        # Remove duplicate user-product pairs (keep the last rating)
        user_item_matrix = user_item_matrix.drop_duplicates(
            subset=['user_id', 'product_id'], 
            keep='last'
        )
        
        # Create user-item matrix
        user_item_pivot = user_item_matrix.pivot(
            index='user_id', 
            columns='product_id', 
            values='rating'
        ).fillna(0)
        
        # Use matrix factorization (SVD-like approach)
        from sklearn.decomposition import TruncatedSVD
        
        n_components = min(50, min(user_item_pivot.shape) - 1)
        svd = TruncatedSVD(n_components=n_components, random_state=42)
        
        # Fit SVD
        user_factors = svd.fit_transform(user_item_pivot)
        item_factors = svd.components_.T
        
        # Store model
        self.collaborative_model = {
            'svd': svd,
            'user_factors': user_factors,
            'item_factors': item_factors,
            'user_ids': user_item_pivot.index.tolist(),
            'product_ids': user_item_pivot.columns.tolist(),
            'user_indices': {uid: idx for idx, uid in enumerate(user_item_pivot.index)},
            'product_indices': {pid: idx for idx, pid in enumerate(user_item_pivot.columns)}
        }
        
        print("Collaborative filtering model trained successfully")
    
    def get_collaborative_recommendations(self, user_id: str, top_n: int = 5) -> List[dict]:
        """
        Get collaborative filtering recommendations for a user
        """
        if not self.collaborative_model:
            raise ValueError("Collaborative model not trained. Call train_collaborative_model first.")
        
        if user_id not in self.collaborative_model['user_indices']:
            # Cold start: return popular items
            return self._get_popular_items(top_n)
        
        # Get user index
        user_idx = self.collaborative_model['user_indices'][user_id]
        
        # Get user factors
        user_vector = self.collaborative_model['user_factors'][user_idx]
        
        # Calculate predicted ratings for all items
        predicted_ratings = np.dot(self.collaborative_model['item_factors'], user_vector)
        
        # Get top recommendations
        item_indices = np.argsort(predicted_ratings)[::-1][:top_n]
        
        recommendations = []
        for item_idx in item_indices:
            product_id = self.collaborative_model['product_ids'][item_idx]
            recommendations.append({
                'product_id': product_id,
                'predicted_rating': predicted_ratings[item_idx],
                'product_data': self.product_database.get(product_id, {})
            })
        
        return recommendations
    
    def _get_popular_items(self, top_n: int = 5) -> List[dict]:
        """Get popular items as fallback for cold start"""
        # Sort by rating and review count
        products = sorted(
            self.product_database.items(),
            key=lambda x: (x[1]['rating'], x[1]['reviews_count']),
            reverse=True
        )
        
        recommendations = []
        for product_id, product_data in products[:top_n]:
            recommendations.append({
                'product_id': product_id,
                'predicted_rating': product_data['rating'],
                'product_data': product_data
            })
        
        return recommendations
    
    def train_hybrid_model(self, training_data: pd.DataFrame):
        """
        Train hybrid model combining content and collaborative features
        """
        # Prepare features
        features = []
        targets = []
        
        for _, row in training_data.iterrows():
            # Get product data
            product_id = row['product_id']
            product_data = self.product_database.get(product_id, {})
            
            if not product_data:
                continue
            
            # Feature vector
            feature_vector = [
                row.get('skin_type_encoded', 0),
                row.get('product_category_encoded', 0),
                row.get('product_type_encoded', 0),
                row.get('price_normalized', 0),
                row.get('concern_match_score', 0),
                row.get('skin_type_compatibility', 0),
                product_data.get('rating', 4.0),
                np.log1p(product_data.get('reviews_count', 0))  # Log transform reviews
            ]
            
            features.append(feature_vector)
            targets.append(row['rating'])
        
        X = np.array(features)
        y = np.array(targets)
        
        # Train Random Forest for final prediction
        rf_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        rf_model.fit(X, y)
        
        # Store model
        self.hybrid_model = {
            'model': rf_model,
            'feature_names': ['skin_type', 'category', 'product_type', 'price', 
                             'concern_match', 'compatibility', 'rating', 'reviews']
        }
        
        # Perform cross-validation
        cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring='neg_mean_squared_error')
        cv_rmse = np.sqrt(-cv_scores)
        print(f"Hybrid model CV RMSE: {np.mean(cv_rmse):.3f} (+/- {np.std(cv_rmse):.3f})")
        
        print("Hybrid model trained successfully")
    
    def get_hybrid_recommendations(self, user_profile: dict, top_n: int = 10) -> List[dict]:
        """
        Get hybrid recommendations combining ML and rule-based approaches
        """
        recommendations = []
        
        for product_id, product_data in self.product_database.items():
            # Calculate ML-based score
            ml_score = self._calculate_ml_score(user_profile, product_data)
            
            # Calculate rule-based score (maintaining safety)
            rule_score = self._calculate_rule_score(user_profile, product_data)
            
            # Hybrid score (70% ML, 30% rules for safety)
            hybrid_score = 0.7 * ml_score + 0.3 * rule_score
            
            recommendations.append({
                'product_id': product_id,
                'hybrid_score': hybrid_score,
                'ml_score': ml_score,
                'rule_score': rule_score,
                'product_data': product_data
            })
        
        # Sort by hybrid score
        recommendations.sort(key=lambda x: x['hybrid_score'], reverse=True)
        
        return recommendations[:top_n]
    
    def _calculate_ml_score(self, user_profile: dict, product_data: dict) -> float:
        """Calculate ML-based score using trained model"""
        if not self.hybrid_model:
            # Fallback to simple scoring if model not trained
            return self._calculate_simple_ml_score(user_profile, product_data)
        
        # Prepare feature vector
        feature_vector = self._prepare_feature_vector(user_profile, product_data)
        
        # Get prediction from regressor
        model = self.hybrid_model['model']
        prediction = model.predict([feature_vector])[0]
        
        # Convert prediction (1-5 rating) to 0-100 score
        ml_score = (prediction / 5.0) * 100
        
        return min(100.0, max(0.0, ml_score))
    
    def _calculate_simple_ml_score(self, user_profile: dict, product_data: dict) -> float:
        """Simple ML-style scoring when model is not trained"""
        score = 50.0  # Base score
        
        # Skin type match
        if user_profile.get('skin_type') in product_data.get('suitable_skin_types', []):
            score += 20.0
        
        # Concern matching with weighted importance
        user_concerns = user_profile.get('skin_concerns', [])
        product_concerns = product_data.get('target_concerns', [])
        
        concern_weights = {
            'acne': 0.9,
            'aging': 0.8,
            'dryness': 0.7,
            'sensitivity': 0.9,
            'dark_spots': 0.6,
            'oily': 0.7
        }
        
        for concern in user_concerns:
            concern_lower = concern.lower()
            weight = concern_weights.get(concern_lower, 0.5)
            
            for product_concern in product_concerns:
                if concern_lower in product_concern.lower():
                    score += 15.0 * weight
                    break
        
        # Rating influence
        rating = product_data.get('rating', 4.0)
        score += (rating - 4.0) * 10.0
        
        # Review count influence (logarithmic)
        reviews = product_data.get('reviews_count', 0)
        score += np.log1p(reviews) * 0.5
        
        # Price appropriateness
        budget = user_profile.get('budget_category', 'mid_range')
        price = product_data.get('price', 0)
        
        if budget == 'budget' and price <= 25:
            score += 10.0
        elif budget == 'mid_range' and 25 <= price <= 75:
            score += 5.0
        elif budget == 'luxury' and price > 75:
            score += 5.0
        
        return min(100.0, max(0.0, score))
    
    def _calculate_rule_score(self, user_profile: dict, product_data: dict) -> float:
        """Calculate rule-based score for safety"""
        score = 100.0
        
        # Allergen filtering (critical safety)
        user_allergies = user_profile.get('allergies', [])
        product_ingredients = product_data.get('key_ingredients', [])
        
        for allergy in user_allergies:
            for ingredient in product_ingredients:
                if allergy.lower() in ingredient.lower():
                    score -= 50.0  # Heavy penalty for allergens
        
        # Skin type compatibility
        if user_profile.get('skin_type') not in product_data.get('suitable_skin_types', []):
            score -= 30.0
        
        # Health score consideration
        health_score = user_profile.get('skin_health_score', 70)
        
        if health_score < 50:  # Low health - prefer gentle products
            if 'gentle' not in str(product_data.get('benefits', '')).lower():
                score -= 10.0
        
        return max(0.0, score)
    
    def _prepare_feature_vector(self, user_profile: dict, product_data: dict) -> list:
        """Prepare feature vector for ML model"""
        # Encode categorical features
        skin_type_encoded = self._encode_single_feature(
            user_profile.get('skin_type', 'normal'), 'skin_type'
        )
        
        category_encoded = self._encode_single_feature(
            product_data.get('category', 'moisturizer'), 'category'
        )
        
        product_type_encoded = self._encode_single_feature(
            product_data.get('product_type', 'mid_range'), 'product_type'
        )
        
        # Calculate numeric features
        concern_match = self._calculate_concern_match(
            user_profile.get('skin_concerns', []),
            product_data.get('target_concerns', [])
        )
        
        skin_compatibility = 1 if user_profile.get('skin_type') in product_data.get('suitable_skin_types', []) else 0
        
        # Normalize price
        price = product_data.get('price', 20.0)
        price_normalized = (price - 20.0) / 100.0  # Simple normalization
        
        return [
            skin_type_encoded,
            category_encoded,
            product_type_encoded,
            price_normalized,
            concern_match,
            skin_compatibility,
            product_data.get('rating', 4.0),
            np.log1p(product_data.get('reviews_count', 0))
        ]
    
    def _encode_single_feature(self, value: str, feature_name: str) -> int:
        """Encode a single categorical feature"""
        # Create consistent mappings for all features
        if feature_name == 'skin_type':
            mapping = {'oily': 0, 'dry': 1, 'combination': 2, 'normal': 3, 'sensitive': 4}
        elif feature_name == 'category':
            mapping = {'face_wash': 0, 'moisturizer': 1, 'sunscreen': 2, 'serum': 3, 'toner': 4}
        elif feature_name == 'product_type':
            mapping = {'budget': 0, 'drugstore': 1, 'mid_range': 2, 'luxury': 3}
        else:
            mapping = {}
        
        return mapping.get(value, 0)
    
    def save_models(self):
        """Save trained models to disk"""
        if self.content_model:
            joblib.dump(self.content_model, f"{self.model_dir}/content_model.joblib")
        
        if self.collaborative_model:
            joblib.dump(self.collaborative_model, f"{self.model_dir}/collaborative_model.joblib")
        
        if self.hybrid_model:
            joblib.dump(self.hybrid_model, f"{self.model_dir}/hybrid_model.joblib")
        
        joblib.dump(self.label_encoders, f"{self.model_dir}/label_encoders.joblib")
        joblib.dump(self.scaler, f"{self.model_dir}/scaler.joblib")
        
        print("Models saved successfully")
    
    def load_models(self):
        """Load trained models from disk"""
        try:
            if os.path.exists(f"{self.model_dir}/content_model.joblib"):
                self.content_model = joblib.load(f"{self.model_dir}/content_model.joblib")
            
            if os.path.exists(f"{self.model_dir}/collaborative_model.joblib"):
                self.collaborative_model = joblib.load(f"{self.model_dir}/collaborative_model.joblib")
            
            if os.path.exists(f"{self.model_dir}/hybrid_model.joblib"):
                self.hybrid_model = joblib.load(f"{self.model_dir}/hybrid_model.joblib")
            
            if os.path.exists(f"{self.model_dir}/label_encoders.joblib"):
                self.label_encoders = joblib.load(f"{self.model_dir}/label_encoders.joblib")
            
            if os.path.exists(f"{self.model_dir}/scaler.joblib"):
                self.scaler = joblib.load(f"{self.model_dir}/scaler.joblib")
            
            self.is_trained = True
            print("Models loaded successfully")
            return True
        except Exception as e:
            print(f"Error loading models: {e}")
            return False
    
    def generate_mock_training_data(self, n_samples: int = 1000) -> List[dict]:
        """Generate mock training data for testing"""
        import random
        
        skin_types = ['oily', 'dry', 'combination', 'normal', 'sensitive']
        concerns = ['acne', 'aging', 'dryness', 'sensitivity', 'dark_spots', 'dullness']
        product_ids = list(self.product_database.keys())
        
        training_data = []
        seen_pairs = set()
        max_unique_pairs = 100 * len(product_ids)
        target_samples = min(n_samples, max_unique_pairs)

        while len(training_data) < target_samples:
            i = len(training_data)
            user_id = f"user_{i % 100}"  # 100 unique users
            product_id = random.choice(product_ids)
            pair_key = (user_id, product_id)

            # Keep each user/product interaction unique so downstream
            # collaborative filtering and pivoting remain stable.
            if pair_key in seen_pairs:
                continue
            seen_pairs.add(pair_key)

            product_data = self.product_database[product_id]
            
            # Generate user profile
            skin_type = random.choice(skin_types)
            user_concerns = random.sample(concerns, random.randint(1, 3))
            
            # Generate rating based on compatibility
            base_rating = random.uniform(3.0, 5.0)
            
            # Boost rating if compatible
            if skin_type in product_data['suitable_skin_types']:
                base_rating += 0.5
            
            # Boost rating if concerns match
            for concern in user_concerns:
                for target_concern in product_data['target_concerns']:
                    if concern.lower() in target_concern.lower():
                        base_rating += 0.3
                        break
            
            rating = min(5.0, max(1.0, base_rating))
            
            training_data.append({
                'user_id': user_id,
                'product_id': product_id,
                'rating': rating,
                'skin_type': skin_type,
                'user_concerns': user_concerns,
                'category': product_data['category'],
                'product_type': product_data['product_type'],
                'price': product_data['price'],
                'target_concerns': product_data['target_concerns'],
                'suitable_skin_types': product_data['suitable_skin_types']
            })
        
        return training_data
