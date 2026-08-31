"""
Product Recommendation Engine
Handles personalized product recommendations, suitability scoring, product comparison, alternatives, and budget-based suggestions
"""
from typing import List, Dict, Optional, Tuple
import json
import os

try:
    from groq import Groq
except ImportError:
    Groq = None

class ProductRecommendationEngine:
    def __init__(self):
        # Initialize product database with comprehensive product information
        self.product_database = self._initialize_product_database()
        self.ingredient_engine = None  # Will be set to use IngredientIntelligence
        api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROQ_API")
        self.groq_client = Groq(api_key=api_key) if Groq and api_key and api_key != "your_groq_api_key_here" else None
        
    def set_ingredient_engine(self, ingredient_engine):
        """Set the ingredient intelligence engine for enhanced analysis"""
        self.ingredient_engine = ingredient_engine
    
    def _initialize_product_database(self) -> Dict[str, dict]:
        """Initialize comprehensive product database"""
        return {
            # Face Wash Products
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
                "usage_instructions": "Massage onto damp skin, rinse with lukewarm water",
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
                "usage_instructions": "Scoop onto dry skin, massage gently, rinse with warm water",
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
                "usage_instructions": "Apply to wet or dry skin, massage gently, rinse",
                "rating": 4.7,
                "reviews_count": 12000,
                "availability": "available"
            },
            
            # Moisturizer Products
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
                "usage_instructions": "Apply to clean skin morning and night",
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
                "usage_instructions": "Apply liberally as needed",
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
                "usage_instructions": "Apply small amount to warmed skin",
                "rating": 4.3,
                "reviews_count": 3000,
                "availability": "available"
            },
            
            # Sunscreen Products
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
                "usage_instructions": "Apply generously 15 minutes before sun exposure",
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
                "usage_instructions": "Apply liberally 15 minutes before sun exposure",
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
                "usage_instructions": "Apply 15 minutes before sun exposure",
                "rating": 4.3,
                "reviews_count": 8000,
                "availability": "available"
            },
            
            # Serum Products
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
                "usage_instructions": "Apply to face in morning and evening before creams",
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
                "usage_instructions": "Apply 4-5 drops to face in morning before moisturizer",
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
                "usage_instructions": "Apply in evening, follow with moisturizer",
                "rating": 4.4,
                "reviews_count": 6000,
                "availability": "available"
            },
            
            # Toner Products
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
                "usage_instructions": "Apply after cleansing, can be used daily",
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
                "usage_instructions": "Apply to face after cleansing with cotton pad",
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
                "usage_instructions": "Apply after cleansing, pat into skin",
                "rating": 4.6,
                "reviews_count": 9000,
                "availability": "available"
            },

            # Indian skincare products
            "dermaco_2_percent_salicyl_acid_face_wash": {
                "name": "2% Salicylic Acid Face Wash",
                "brand": "The Derma Co",
                "category": "face_wash",
                "product_type": "budget",
                "price": 8.99,
                "currency": "USD",
                "key_ingredients": ["salicylic_acid", "niacinamide"],
                "suitable_skin_types": ["oily", "combination"],
                "target_concerns": ["acne", "pores", "blackheads", "oil_control"],
                "benefits": ["Unclogs pores", "Helps reduce breakouts", "Controls excess oil"],
                "warnings": ["May be drying; patch test recommended"],
                "usage_instructions": "Use once daily and follow with moisturizer",
                "rating": 4.4,
                "reviews_count": 18000,
                "availability": "available"
            },
            "dermaco_10_percent_niacinamide_serum": {
                "name": "10% Niacinamide Face Serum",
                "brand": "The Derma Co",
                "category": "serum",
                "product_type": "budget",
                "price": 9.49,
                "currency": "USD",
                "key_ingredients": ["niacinamide", "zinc"],
                "suitable_skin_types": ["oily", "combination", "normal"],
                "target_concerns": ["acne", "pores", "oil_control", "dark_spots"],
                "benefits": ["Helps control oil", "Refines appearance of pores", "Supports even tone"],
                "warnings": ["May irritate very sensitive skin"],
                "usage_instructions": "Apply 2-3 drops after cleansing",
                "rating": 4.3,
                "reviews_count": 15000,
                "availability": "available"
            },
            "dermaco_1_percent_hyaluronic_sunscreen": {
                "name": "1% Hyaluronic Sunscreen Aqua Gel SPF 50",
                "brand": "The Derma Co",
                "category": "sunscreen",
                "product_type": "budget",
                "price": 11.99,
                "currency": "USD",
                "key_ingredients": ["hyaluronic_acid", "vitamin_e"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination"],
                "target_concerns": ["sun_protection", "dryness"],
                "benefits": ["Broad-spectrum SPF 50", "Lightweight gel texture", "Hydrating"],
                "warnings": ["Reapply after sweating or swimming"],
                "usage_instructions": "Apply generously as the last morning step",
                "rating": 4.4,
                "reviews_count": 21000,
                "availability": "available"
            },
            "minimalist_2_percent_salicylic_acid_serum": {
                "name": "2% Salicylic Acid Face Serum",
                "brand": "Minimalist",
                "category": "serum",
                "product_type": "budget",
                "price": 10.99,
                "currency": "USD",
                "key_ingredients": ["salicylic_acid", "black_currant"],
                "suitable_skin_types": ["oily", "combination"],
                "target_concerns": ["acne", "pores", "blackheads", "texture"],
                "benefits": ["Exfoliates inside pores", "Helps reduce blackheads", "Improves texture"],
                "warnings": ["Introduce gradually; avoid over-exfoliation"],
                "usage_instructions": "Use 2-3 nights per week after cleansing",
                "rating": 4.5,
                "reviews_count": 19000,
                "availability": "available"
            },
            "minimalist_10_percent_vitamin_c_serum": {
                "name": "10% Vitamin C Face Serum",
                "brand": "Minimalist",
                "category": "serum",
                "product_type": "budget",
                "price": 12.49,
                "currency": "USD",
                "key_ingredients": ["vitamin_c", "ferulic_acid", "vitamin_e"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination"],
                "target_concerns": ["dark_spots", "dullness", "sun_damage"],
                "benefits": ["Brightens dull-looking skin", "Supports even tone", "Antioxidant support"],
                "warnings": ["Patch test and use sunscreen"],
                "usage_instructions": "Apply in the morning before moisturizer and sunscreen",
                "rating": 4.3,
                "reviews_count": 12000,
                "availability": "available"
            },
            "minimalist_5_percent_niacinamide_serum": {
                "name": "5% Niacinamide Face Serum",
                "brand": "Minimalist",
                "category": "serum",
                "product_type": "budget",
                "price": 9.99,
                "currency": "USD",
                "key_ingredients": ["niacinamide", "hyaluronic_acid"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination", "sensitive"],
                "target_concerns": ["acne", "pores", "redness", "dark_spots"],
                "benefits": ["Supports skin barrier", "Helps balance oil", "Gentle daily formula"],
                "warnings": ["Stop use if irritation occurs"],
                "usage_instructions": "Apply morning or evening after cleansing",
                "rating": 4.4,
                "reviews_count": 14000,
                "availability": "available"
            },

            "dot_key_c5_face_wash": {
                "name": "Dot & Key Barrier Repair Gentle Face Wash",
                "brand": "Dot & Key",
                "category": "face_wash",
                "product_type": "budget",
                "price": 8.49,
                "currency": "USD",
                "key_ingredients": ["ceramide_np", "hyaluronic_acid", "oat_extract"],
                "suitable_skin_types": ["dry", "normal", "sensitive", "combination"],
                "target_concerns": ["dryness", "sensitivity", "barrier_repair"],
                "benefits": ["Gentle cleanse", "Supports skin barrier", "Hydrating"],
                "warnings": ["Patch test if highly reactive"],
                "usage_instructions": "Massage onto damp skin and rinse",
                "rating": 4.3,
                "reviews_count": 9000,
                "availability": "available"
            },
            "plum_green_tea_moisturizer": {
                "name": "Plum Green Tea Mattifying Moisturizer",
                "brand": "Plum",
                "category": "moisturizer",
                "product_type": "budget",
                "price": 9.99,
                "currency": "USD",
                "key_ingredients": ["green_tea", "niacinamide", "glycerin"],
                "suitable_skin_types": ["oily", "combination", "normal"],
                "target_concerns": ["acne", "pores", "oil_control"],
                "benefits": ["Lightweight gel", "Helps control shine", "Non-greasy"],
                "warnings": ["May not provide enough moisture for very dry skin"],
                "usage_instructions": "Apply a small amount after serum",
                "rating": 4.2,
                "reviews_count": 11000,
                "availability": "available"
            },
            "re_equil_ultra_matte_sunscreen": {
                "name": "Re'equil Ultra Matte Dry Touch Sunscreen SPF 50",
                "brand": "Re'equil",
                "category": "sunscreen",
                "product_type": "mid_range",
                "price": 14.99,
                "currency": "USD",
                "key_ingredients": ["uva_filters", "uvb_filters", "vitamin_e"],
                "suitable_skin_types": ["oily", "combination", "normal"],
                "target_concerns": ["sun_protection", "oil_control"],
                "benefits": ["Matte finish", "Broad-spectrum protection", "Water resistant"],
                "warnings": ["Reapply every two hours outdoors"],
                "usage_instructions": "Apply generously as the final morning step",
                "rating": 4.5,
                "reviews_count": 17000,
                "availability": "available"
            },
            "aqualogica_glow_sunscreen": {
                "name": "Aqualogica Glow+ Dewy Sunscreen SPF 50",
                "brand": "Aqualogica",
                "category": "sunscreen",
                "product_type": "budget",
                "price": 10.49,
                "currency": "USD",
                "key_ingredients": ["hyaluronic_acid", "vitamin_c", "papaya_extract"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "target_concerns": ["sun_protection", "dullness", "dryness"],
                "benefits": ["Dewy finish", "Hydrating", "Broad-spectrum SPF 50"],
                "warnings": ["May feel dewy on very oily skin"],
                "usage_instructions": "Apply two-finger amount to face and neck",
                "rating": 4.2,
                "reviews_count": 13000,
                "availability": "available"
            },
            "deconstruct_alpha_arbutin_serum": {
                "name": "Deconstruct 2% Alpha Arbutin Serum",
                "brand": "Deconstruct",
                "category": "serum",
                "product_type": "budget",
                "price": 11.49,
                "currency": "USD",
                "key_ingredients": ["alpha_arbutin", "niacinamide", "hyaluronic_acid"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination", "sensitive"],
                "target_concerns": ["dark_spots", "dullness", "redness"],
                "benefits": ["Targets uneven tone", "Hydrating", "Fragrance-free"],
                "warnings": ["Use sunscreen during the day"],
                "usage_instructions": "Apply 2-3 drops after cleansing",
                "rating": 4.4,
                "reviews_count": 7000,
                "availability": "available"
            },
            "foxtale_daily_dual_moisturizer": {
                "name": "Foxtale Daily Duet Barrier Repair Moisturizer",
                "brand": "Foxtale",
                "category": "moisturizer",
                "product_type": "mid_range",
                "price": 13.49,
                "currency": "USD",
                "key_ingredients": ["ceramide_np", "squalane", "hyaluronic_acid"],
                "suitable_skin_types": ["dry", "normal", "combination", "sensitive"],
                "target_concerns": ["dryness", "sensitivity", "barrier_repair"],
                "benefits": ["Barrier support", "Comfortable daily hydration", "Non-sticky"],
                "warnings": ["May feel rich on very oily skin"],
                "usage_instructions": "Apply after serum morning and evening",
                "rating": 4.3,
                "reviews_count": 6000,
                "availability": "available"
            },
            "cosrx_snail_essence": {
                "name": "COSRX Advanced Snail 96 Mucin Power Essence",
                "brand": "COSRX",
                "category": "serum",
                "product_type": "mid_range",
                "price": 19.99,
                "currency": "USD",
                "key_ingredients": ["snail_mucin", "hyaluronic_acid", "allantoin"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "target_concerns": ["dryness", "redness", "texture"],
                "benefits": ["Hydrates", "Soothes", "Supports skin recovery"],
                "warnings": ["Avoid if allergic to snail-derived ingredients"],
                "usage_instructions": "Press one or two pumps into clean skin",
                "rating": 4.6,
                "reviews_count": 25000,
                "availability": "available"
            },
            "beauty_of_joseon_ginseng_essence": {
                "name": "Beauty of Joseon Ginseng Essence Water",
                "brand": "Beauty of Joseon",
                "category": "toner",
                "product_type": "mid_range",
                "price": 17.99,
                "currency": "USD",
                "key_ingredients": ["ginseng", "niacinamide", "rice_extract"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "target_concerns": ["dryness", "dullness", "redness"],
                "benefits": ["Light hydration", "Brightening support", "Soothing"],
                "warnings": ["Patch test botanical ingredients"],
                "usage_instructions": "Pat into skin after cleansing",
                "rating": 4.5,
                "reviews_count": 14000,
                "availability": "available"
            },
            "loreal_hyaluron_serum": {
                "name": "Revitalift 1.5% Pure Hyaluronic Acid Serum",
                "brand": "L'Oréal Paris",
                "category": "serum",
                "product_type": "mid_range",
                "price": 18.99,
                "currency": "USD",
                "key_ingredients": ["hyaluronic_acid", "glycerin"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "target_concerns": ["dryness", "dehydration", "texture"],
                "benefits": ["Plumps with hydration", "Lightweight texture", "Supports smoother-looking skin"],
                "warnings": ["Patch test before use"],
                "usage_instructions": "Apply 2-3 drops after cleansing",
                "rating": 4.4, "reviews_count": 18000, "availability": "available"
            },
            "eucerin_oil_control_sunscreen": {
                "name": "Eucerin Sun Oil Control Gel-Cream SPF 50+",
                "brand": "Eucerin", "category": "sunscreen", "product_type": "mid_range",
                "price": 24.99, "currency": "USD",
                "key_ingredients": ["uva_filters", "uvb_filters", "licochalcone"],
                "suitable_skin_types": ["oily", "combination", "sensitive"],
                "target_concerns": ["sun_protection", "oil_control", "acne"],
                "benefits": ["Matte finish", "High SPF protection", "Helps control shine"],
                "warnings": ["Reapply after sweating or swimming"],
                "usage_instructions": "Apply generously before sun exposure",
                "rating": 4.5, "reviews_count": 12000, "availability": "available"
            },
            "estee_lauder_advanced_night_repair": {
                "name": "Advanced Night Repair Serum",
                "brand": "Estée Lauder", "category": "serum", "product_type": "luxury",
                "price": 85.00, "currency": "USD",
                "key_ingredients": ["hyaluronic_acid", "peptides", "antioxidants"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "target_concerns": ["dryness", "dullness", "aging"],
                "benefits": ["Overnight hydration", "Supports smoother-looking skin", "Antioxidant support"],
                "warnings": ["Luxury price point"],
                "usage_instructions": "Apply before moisturizer in the evening",
                "rating": 4.6, "reviews_count": 30000, "availability": "available"
            },
            "shiseido_ultimune_serum": {
                "name": "Ultimune Power Infusing Serum",
                "brand": "Shiseido", "category": "serum", "product_type": "luxury",
                "price": 78.00, "currency": "USD",
                "key_ingredients": ["glycerin", "botanical_extracts", "antioxidants"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "target_concerns": ["dryness", "dullness", "aging"],
                "benefits": ["Hydrating serum", "Silky texture", "Antioxidant support"],
                "warnings": ["Contains botanical extracts and fragrance"],
                "usage_instructions": "Use morning and evening after cleansing",
                "rating": 4.5, "reviews_count": 11000, "availability": "available"
            },
            "olay_regenerist_moisturizer": {
                "name": "Regenerist Micro-Sculpting Cream",
                "brand": "Olay", "category": "moisturizer", "product_type": "mid_range",
                "price": 32.00, "currency": "USD",
                "key_ingredients": ["niacinamide", "peptides", "hyaluronic_acid"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "target_concerns": ["dryness", "aging", "texture"],
                "benefits": ["Rich hydration", "Peptide support", "Smooth finish"],
                "warnings": ["May feel rich on very oily skin"],
                "usage_instructions": "Apply to clean skin morning or evening",
                "rating": 4.4, "reviews_count": 24000, "availability": "available"
            },
            "dove_dermaface_cleanser": {
                "name": "Dove DermaSeries Face Wash",
                "brand": "Dove", "category": "face_wash", "product_type": "budget",
                "price": 9.49, "currency": "USD",
                "key_ingredients": ["glycerin", "ceramide_np"],
                "suitable_skin_types": ["dry", "normal", "sensitive"],
                "target_concerns": ["dryness", "sensitivity", "barrier_repair"],
                "benefits": ["Gentle cleansing", "Creamy texture", "Helps reduce tightness"],
                "warnings": ["Patch test if highly reactive"],
                "usage_instructions": "Massage onto damp skin and rinse",
                "rating": 4.2, "reviews_count": 8000, "availability": "available"
            },
            "neostrata_resurface_serum": {
                "name": "NEOSTRATA Resurface Glycolic Renewal Serum",
                "brand": "NEOSTRATA", "category": "serum", "product_type": "mid_range",
                "price": 48.00, "currency": "USD",
                "key_ingredients": ["glycolic_acid", "citric_acid"],
                "suitable_skin_types": ["normal", "oily", "combination"],
                "target_concerns": ["texture", "dullness", "dark_spots"],
                "benefits": ["Exfoliating action", "Refines texture", "Brightening support"],
                "warnings": ["Introduce gradually; use sunscreen"],
                "usage_instructions": "Use at night two to three times weekly",
                "rating": 4.3, "reviews_count": 6000, "availability": "available"
            },
            "fresh_rose_toner": {
                "name": "Rose & Hyaluronic Acid Deep Hydration Toner",
                "brand": "Fresh", "category": "toner", "product_type": "luxury",
                "price": 28.00, "currency": "USD",
                "key_ingredients": ["rose_extract", "hyaluronic_acid", "glycerin"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "target_concerns": ["dryness", "dehydration", "dullness"],
                "benefits": ["Hydrating", "Refreshing", "Softens skin feel"],
                "warnings": ["Contains fragrance"],
                "usage_instructions": "Apply after cleansing",
                "rating": 4.3, "reviews_count": 7000, "availability": "available"
            },
            "amorepacific_vintage_essence": {
                "name": "Vintage Single Extract Essence",
                "brand": "Amorepacific", "category": "serum", "product_type": "luxury",
                "price": 72.00, "currency": "USD",
                "key_ingredients": ["green_tea_extract", "glycerin"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "target_concerns": ["dryness", "redness", "dullness"],
                "benefits": ["Soothing hydration", "Antioxidant support", "Lightweight essence"],
                "warnings": ["Contains botanical extracts"],
                "usage_instructions": "Press into skin after cleansing",
                "rating": 4.4, "reviews_count": 5000, "availability": "available"
            },
            "kao_curel_intensive_moisture": {
                "name": "Curél Intensive Moisture Facial Cream",
                "brand": "Curél", "category": "moisturizer", "product_type": "mid_range",
                "price": 26.00, "currency": "USD",
                "key_ingredients": ["ceramide_np", "glycerin", "eucalyptus_extract"],
                "suitable_skin_types": ["dry", "normal", "sensitive"],
                "target_concerns": ["dryness", "sensitivity", "barrier_repair"],
                "benefits": ["Barrier-focused hydration", "Fragrance-free", "Gentle formula"],
                "warnings": ["May feel rich on oily skin"],
                "usage_instructions": "Apply after cleansing morning and evening",
                "rating": 4.5, "reviews_count": 9000, "availability": "available"
            },
            "aveeno_oat_gel_moisturizer": {
                "name": "Daily Moisturizing Oat Gel Cream",
                "brand": "Aveeno", "category": "moisturizer", "product_type": "budget",
                "price": 15.00, "currency": "USD",
                "key_ingredients": ["oat_extract", "glycerin", "hyaluronic_acid"],
                "suitable_skin_types": ["normal", "dry", "sensitive", "combination"],
                "target_concerns": ["dryness", "redness", "sensitivity"],
                "benefits": ["Soothing oat formula", "Light gel cream", "Hydrating"],
                "warnings": ["Patch test botanical ingredients"],
                "usage_instructions": "Apply as needed after cleansing",
                "rating": 4.4, "reviews_count": 13000, "availability": "available"
            },
            "coty_philosophy_hydrating_cleanser": {
                "name": "Purity Made Simple Facial Cleanser",
                "brand": "Philosophy", "category": "face_wash", "product_type": "mid_range",
                "price": 25.00, "currency": "USD",
                "key_ingredients": ["glycerin", "meadowfoam_seed_oil"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "target_concerns": ["dryness", "cleansing"],
                "benefits": ["One-step cleanse", "Comfortable finish", "Removes impurities"],
                "warnings": ["Contains fragrance"],
                "usage_instructions": "Massage onto damp skin and rinse",
                "rating": 4.3, "reviews_count": 10000, "availability": "available"
            },
            "natura_ekos_buriti_oil": {
                "name": "Ekos Buriti Face Oil",
                "brand": "Natura", "category": "moisturizer", "product_type": "mid_range",
                "price": 22.00, "currency": "USD",
                "key_ingredients": ["buriti_oil", "vitamin_e"],
                "suitable_skin_types": ["dry", "normal"],
                "target_concerns": ["dryness", "dullness"],
                "benefits": ["Nourishing oil", "Softens skin", "Emollient hydration"],
                "warnings": ["May feel heavy or clog-prone for oily skin"],
                "usage_instructions": "Use a few drops over moisturizer",
                "rating": 4.2, "reviews_count": 4000, "availability": "available"
            },
            "galderma_cetaphil_gentle_cleanser": {
                "name": "Cetaphil Gentle Skin Cleanser",
                "brand": "Cetaphil", "category": "face_wash", "product_type": "budget",
                "price": 12.99, "currency": "USD",
                "key_ingredients": ["glycerin", "panthenol", "niacinamide"],
                "suitable_skin_types": ["dry", "normal", "sensitive", "combination"],
                "target_concerns": ["dryness", "sensitivity", "redness"],
                "benefits": ["Non-stripping cleanse", "Sensitive-skin friendly", "Fragrance-free"],
                "warnings": ["May not remove heavy makeup"],
                "usage_instructions": "Massage onto skin and rinse or wipe away",
                "rating": 4.6, "reviews_count": 32000, "availability": "available"
            },
            "avene_thermal_spring_water": {
                "name": "Avène Thermal Spring Water",
                "brand": "Avène", "category": "toner", "product_type": "mid_range",
                "price": 18.00, "currency": "USD",
                "key_ingredients": ["thermal_water"],
                "suitable_skin_types": ["normal", "dry", "oily", "combination", "sensitive"],
                "target_concerns": ["redness", "sensitivity", "dryness"],
                "benefits": ["Refreshing mist", "Soothing", "Suitable for sensitive skin"],
                "warnings": ["Not a replacement for moisturizer"],
                "usage_instructions": "Mist onto skin and gently pat dry",
                "rating": 4.4, "reviews_count": 15000, "availability": "available"
            },
            "rohto_skin_aqua_sunscreen": {
                "name": "Skin Aqua UV Super Moisture Gel SPF 50+",
                "brand": "Rohto", "category": "sunscreen", "product_type": "budget",
                "price": 16.00, "currency": "USD",
                "key_ingredients": ["hyaluronic_acid", "uva_filters", "uvb_filters"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination"],
                "target_concerns": ["sun_protection", "dryness"],
                "benefits": ["Lightweight gel", "High SPF", "Hydrating"],
                "warnings": ["Reapply regularly outdoors"],
                "usage_instructions": "Apply generously as the last morning step",
                "rating": 4.5, "reviews_count": 18000, "availability": "available"
            },
            "schwarzkopf_hyaluron_cream": {
                "name": "Schwarzkopf Professional Skin Protector Cream",
                "brand": "Schwarzkopf", "category": "moisturizer", "product_type": "mid_range",
                "price": 20.00, "currency": "USD",
                "key_ingredients": ["glycerin", "panthenol"],
                "suitable_skin_types": ["normal", "dry"],
                "target_concerns": ["dryness", "barrier_repair"],
                "benefits": ["Comforting hydration", "Protective cream", "Soft finish"],
                "warnings": ["Product availability may vary"],
                "usage_instructions": "Apply a small amount to clean skin",
                "rating": 4.1, "reviews_count": 2500, "availability": "available"
            },
            "revlon_elizabeth_arden_eight_hour": {
                "name": "Eight Hour Cream Skin Protectant",
                "brand": "Elizabeth Arden", "category": "moisturizer", "product_type": "mid_range",
                "price": 28.00, "currency": "USD",
                "key_ingredients": ["petrolatum", "vitamin_e", "salicylic_acid"],
                "suitable_skin_types": ["dry", "normal"],
                "target_concerns": ["dryness", "barrier_repair"],
                "benefits": ["Occlusive moisture", "Protective balm", "Multi-use formula"],
                "warnings": ["May feel heavy; contains fragrance"],
                "usage_instructions": "Apply sparingly to dry areas",
                "rating": 4.4, "reviews_count": 17000, "availability": "available"
            },
            "chanel_blue_serum": {
                "name": "N°1 de CHANEL Rich Revitalizing Cream",
                "brand": "CHANEL", "category": "moisturizer", "product_type": "luxury",
                "price": 95.00, "currency": "USD",
                "key_ingredients": ["red_camellia_extract", "hyaluronic_acid"],
                "suitable_skin_types": ["normal", "dry"],
                "target_concerns": ["dryness", "dullness", "aging"],
                "benefits": ["Rich hydration", "Luxury texture", "Smoothing support"],
                "warnings": ["Contains fragrance; luxury price point"],
                "usage_instructions": "Apply morning and evening after serum",
                "rating": 4.2, "reviews_count": 3500, "availability": "available"
            },
            "belif_aqua_bomb": {
                "name": "The True Cream Aqua Bomb",
                "brand": "belif", "category": "moisturizer", "product_type": "mid_range",
                "price": 38.00, "currency": "USD",
                "key_ingredients": ["glycerin", "niacinamide", "oat_extract"],
                "suitable_skin_types": ["oily", "normal", "combination"],
                "target_concerns": ["dehydration", "dryness", "dullness"],
                "benefits": ["Refreshing gel cream", "Lightweight hydration", "Smooth finish"],
                "warnings": ["Contains fragrance"],
                "usage_instructions": "Apply after cleansing and serum",
                "rating": 4.5, "reviews_count": 21000, "availability": "available"
            }
        }
    
    def generate_recommendations(self, request_data: dict) -> List[dict]:
        """
        Generate personalized product recommendations based on user profile
        """
        user_id = request_data.get('user_id')
        skin_type = request_data.get('skin_type', 'normal')
        skin_concerns = request_data.get('skin_concerns', [])
        skin_health_score = request_data.get('skin_health_score', 70)
        allergies = request_data.get('allergies', [])
        budget_category = request_data.get('budget_category', 'mid_range')
        preferred_brands = request_data.get('preferred_brands', [])
        excluded_brands = request_data.get('excluded_brands', [])
        product_categories = request_data.get('product_categories', None)
        
        # Filter products based on criteria
        suitable_products = self._filter_products(
            skin_type, skin_concerns, allergies, budget_category, 
            preferred_brands, excluded_brands, product_categories
        )
        
        # Score and rank products
        scored_products = self._score_products(
            suitable_products, skin_type, skin_concerns, skin_health_score
        )
        
        # Sort by suitability score
        scored_products.sort(key=lambda x: x['suitability_score'], reverse=True)
        
        # Generate recommendation details
        recommendations = []
        for product in scored_products[:10]:  # Top 10 recommendations
            recommendation = self._create_recommendation(
                product, skin_type, skin_concerns, user_id
            )
            recommendations.append(recommendation)
        
        return recommendations
    
    def _filter_products(self, skin_type: str, skin_concerns: list, allergies: list,
                        budget_category: str, preferred_brands: list, 
                        excluded_brands: list, product_categories: list) -> list:
        """Filter products based on user criteria"""
        filtered = []
        
        for product_id, product_data in self.product_database.items():
            # Check skin type compatibility
            if skin_type not in product_data['suitable_skin_types']:
                continue
            
            # Check category filter
            if product_categories and product_data['category'] not in product_categories:
                continue
            
            # Check budget category
            if budget_category and product_data['product_type'] != budget_category:
                # Allow more expensive if budget is not strict
                if budget_category == 'budget' and product_data['price'] > 25:
                    continue
                elif budget_category == 'mid_range' and product_data['price'] > 75:
                    continue
            
            # Check excluded brands
            if excluded_brands and product_data['brand'] in excluded_brands:
                continue
            
            # Check preferred brands (if specified, prioritize these)
            if preferred_brands and product_data['brand'] not in preferred_brands:
                # Still include but with lower priority
                pass
            
            # Check for allergen concerns in ingredients
            product_has_allergen = False
            for allergy in allergies:
                for ingredient in product_data['key_ingredients']:
                    if allergy.lower() in ingredient.lower():
                        product_has_allergen = True
                        break
                if product_has_allergen:
                    break
            
            if product_has_allergen:
                continue
            
            filtered.append({
                'id': product_id,
                **product_data
            })
        
        return filtered
    
    def _score_products(self, products: list, skin_type: str, 
                       skin_concerns: list, skin_health_score: int) -> list:
        """Score products based on suitability for user profile"""
        for product in products:
            score = 100
            
            # Skin type match
            if skin_type in product['suitable_skin_types']:
                score += 20
            
            # Concern matching
            concern_matches = 0
            for concern in skin_concerns:
                for target in product['target_concerns']:
                    if concern.lower() in target.lower() or target.lower() in concern.lower():
                        concern_matches += 1
                        break
            
            score += min(30, concern_matches * 10)
            
            # Health score consideration
            if skin_health_score < 50:
                # Low health score - prioritize gentle products
                if 'gentle' in str(product['benefits']).lower() or 'soothing' in str(product['benefits']).lower():
                    score += 15
            elif skin_health_score > 80:
                # High health score - can handle more active products
                if 'anti-aging' in str(product['benefits']).lower() or 'treatment' in str(product['benefits']).lower():
                    score += 10
            
            # Rating consideration
            if product.get('rating'):
                score += (product['rating'] - 4.0) * 5  # Bonus for higher ratings
            
            # Reviews count (popularity bonus)
            if product.get('reviews_count', 0) > 10000:
                score += 5
            
            product['suitability_score'] = max(0, min(100, score))
        
        return products
    
    def _create_recommendation(self, product: dict, skin_type: str, 
                              skin_concerns: list, user_id: str) -> dict:
        """Create detailed recommendation object"""
        # Generate recommendation reason
        reasons = []
        
        if skin_type in product['suitable_skin_types']:
            reasons.append(f"Excellent for {skin_type} skin")
        
        concern_matches = []
        for concern in skin_concerns:
            for target in product['target_concerns']:
                if concern.lower() in target.lower() or target.lower() in concern.lower():
                    concern_matches.append(concern)
                    break
        
        if concern_matches:
            reasons.append(f"Addresses your concerns: {', '.join(concern_matches)}")
        
        if product['rating'] >= 4.5:
            reasons.append(f"Highly rated ({product['rating']}/5)")
        
        if product['reviews_count'] > 10000:
            reasons.append("Popular choice with many positive reviews")
        
        # Determine priority
        priority = "high"
        if product['suitability_score'] >= 80:
            priority = "high"
        elif product['suitability_score'] >= 60:
            priority = "medium"
        else:
            priority = "low"
        
        return {
            'user_id': user_id,
            'product': product,
            'suitability_score': product['suitability_score'],
            'recommendation_reason': "; ".join(reasons) if reasons else "Generally suitable for your profile",
            'priority': priority,
            'category': product['category'],
            'budget_category': product['product_type'],
            'is_alternative': False,
            'alternative_for': None
        }
    
    def compare_products(self, product_ids: list, user_skin_type: str, user_concerns: list) -> dict:
        """
        Compare multiple products and provide detailed comparison
        """
        products = []
        for product_id in product_ids:
            if product_id in self.product_database:
                products.append({
                    'id': product_id,
                    **self.product_database[product_id]
                })
        
        if len(products) < 2:
            return {'error': 'Need at least 2 products to compare'}
        
        # Create comparison matrix
        comparison_matrix = {
            'price_comparison': sorted(products, key=lambda x: x['price']),
            'rating_comparison': sorted(products, key=lambda x: x.get('rating', 0), reverse=True),
            'ingredient_comparison': {p['name']: p['key_ingredients'] for p in products},
            'skin_type_compatibility': {p['name']: p['suitable_skin_types'] for p in products},
            'concern_coverage': {p['name']: p['target_concerns'] for p in products}
        }
        
        # Determine best overall based on user profile
        scored_products = self._score_products(products, user_skin_type, user_concerns, 70)
        best_overall = max(scored_products, key=lambda x: x['suitability_score'])['name']
        
        # Generate recommendations
        recommendations = {
            'best_value': min(products, key=lambda x: x['price'])['name'],
            'highest_rated': max(products, key=lambda x: x.get('rating', 0))['name'],
            'best_for_skin_type': best_overall,
            'most_popular': max(products, key=lambda x: x.get('reviews_count', 0))['name']
        }
        ai_advice = self._get_comparison_advice(products, scored_products, user_skin_type, user_concerns, recommendations)
        
        return {
            'products': products,
            'comparison_matrix': comparison_matrix,
            'best_overall': best_overall,
            'recommendations': recommendations,
            **({'ai_advice': ai_advice} if ai_advice else {})
        }

    def _get_comparison_advice(self, products: list, scored_products: list,
                               skin_type: str, concerns: list, recommendations: dict) -> Optional[dict]:
        """Ask Groq for explanation using only verified catalog and scoring data."""
        if not self.groq_client:
            return None
        product_facts = [{
            'name': product['name'],
            'brand': product.get('brand'),
            'price': product.get('price'),
            'rating': product.get('rating'),
            'key_ingredients': product.get('key_ingredients', []),
            'suitable_skin_types': product.get('suitable_skin_types', []),
            'target_concerns': product.get('target_concerns', []),
            'warnings': product.get('warnings', [])
        } for product in products]
        scores = {item['name']: item['suitability_score'] for item in scored_products}
        prompt = f"""Compare these verified skincare products for a user.
User skin type: {skin_type}
User concerns: {concerns}
Verified product facts: {json.dumps(product_facts)}
Verified suitability scores: {json.dumps(scores)}
Verified labels: {json.dumps(recommendations)}
Return JSON only with keys: summary, best_choice_reason, pros_and_cons, safety_note.
summary and best_choice_reason must be strings. pros_and_cons must be an object keyed by product name,
with each value containing pros (array) and cons (array). safety_note must be a string.
Do not invent prices, ingredients, medical claims, or products. Use only the supplied facts."""
        try:
            response = self.groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {"role": "system", "content": "You are a careful skincare product comparison advisor."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=900,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            advice = json.loads(content)
            if not isinstance(advice, dict) or not all(key in advice for key in ('summary', 'best_choice_reason', 'pros_and_cons', 'safety_note')):
                return None
            return advice
        except Exception as exc:
            print(f"Groq product comparison advice unavailable: {exc}")
            return None
    
    def get_alternatives(self, product_id: str, user_id: str, reason: str = None, 
                       budget_category: str = None) -> dict:
        """
        Get alternative products for a given product
        """
        if product_id not in self.product_database:
            return {'error': 'Product not found'}
        
        original_product = self.product_database[product_id]
        
        # Find similar products based on category and skin type
        alternatives = []
        for alt_id, alt_data in self.product_database.items():
            if alt_id == product_id:
                continue
            
            # Same category
            if alt_data['category'] != original_product['category']:
                continue
            
            # At least one overlapping suitable skin type
            if not set(alt_data['suitable_skin_types']) & set(original_product['suitable_skin_types']):
                continue
            
            # Budget filter if specified
            if budget_category and alt_data['product_type'] != budget_category:
                if budget_category == 'budget' and alt_data['price'] > 25:
                    continue
                elif budget_category == 'mid_range' and alt_data['price'] > 75:
                    continue
            
            alternatives.append({
                'id': alt_id,
                **alt_data
            })
        
        # Score alternatives based on similarity to original
        for alt in alternatives:
            similarity_score = 0
            
            # Category match (already filtered)
            similarity_score += 30
            
            # Skin type overlap
            skin_overlap = len(set(alt['suitable_skin_types']) & set(original_product['suitable_skin_types']))
            similarity_score += skin_overlap * 10
            
            # Similar target concerns
            concern_overlap = len(set(alt['target_concerns']) & set(original_product['target_concerns']))
            similarity_score += concern_overlap * 5
            
            # Price similarity (within 50%)
            price_diff = abs(alt['price'] - original_product['price']) / original_product['price']
            if price_diff <= 0.5:
                similarity_score += 10
            
            alt['suitability_score'] = min(100, similarity_score)
        
        # Sort by similarity
        alternatives.sort(key=lambda x: x['suitability_score'], reverse=True)
        
        # Take top alternatives
        top_alternatives = alternatives[:5]
        
        # Create recommendation responses
        alt_recommendations = []
        for alt in top_alternatives:
            alt_recommendations.append({
                'user_id': user_id,
                'product': alt,
                'suitability_score': alt['suitability_score'],
                'recommendation_reason': f"Similar to {original_product['name']} with {alt['suitability_score']}% similarity",
                'priority': 'medium',
                'category': alt['category'],
                'budget_category': alt['product_type'],
                'is_alternative': True,
                'alternative_for': product_id
            })
        
        # Generate summary
        summary = f"Found {len(top_alternatives)} alternatives to {original_product['name']}"
        if reason:
            summary += f" based on {reason}"
        if budget_category:
            summary += f" in {budget_category} price range"
        
        return {
            'original_product': {
                'id': product_id,
                **original_product
            },
            'alternatives': alt_recommendations,
            'recommendation_summary': summary
        }
    
    def get_products_by_category(self, category: str) -> list:
        """Get all products in a specific category"""
        products = []
        for product_id, product_data in self.product_database.items():
            if product_data['category'] == category:
                products.append({
                    'id': product_id,
                    **product_data
                })
        return products
    
    def search_products(self, query: str) -> list:
        """Search for products by name, brand, combined brand+name, or ingredient."""
        if not query:
            return []

        normalized_query = ''.join(ch.lower() if ch.isalnum() or ch.isspace() else ' ' for ch in str(query))
        normalized_query = ' '.join(normalized_query.split())
        if not normalized_query:
            return []

        tokens = normalized_query.split()
        search_terms = []
        for term in [normalized_query, ' '.join(tokens[:min(4, len(tokens))]), ' '.join(tokens[-min(4, len(tokens)):])]:
            term = ' '.join(term.split())
            if term and term not in search_terms:
                search_terms.append(term)

        results = []
        for product_id, product_data in self.product_database.items():
            brand = product_data.get('brand', '').lower()
            name = product_data.get('name', '').lower()
            combined = f"{brand} {name}".lower()
            ingredient_text = ' '.join(product_data.get('key_ingredients', [])).lower()

            matched = False
            for term in search_terms:
                if term in combined or term in name or term in brand or term in ingredient_text:
                    matched = True
                    break

            if not matched:
                if len(tokens) > 1 and all(token in combined for token in tokens):
                    matched = True

            if matched:
                results.append({
                    'id': product_id,
                    **product_data
                })

        return results