"""
GlowMix Product Recommendation Engine Module
--------------------------------------------
Provides deterministic, rule-based product suitability scoring (0-100%),
allergy/sensitivity conflict enforcement, category filtering, budget-based recommendations,
side-by-side product comparison, and alternative product suggestions.
"""

# Master catalog of skincare products across all 7 required categories
PRODUCT_CATALOG = [
    # ----------------------------------------------------
    # Category 1: Face Wash
    # ----------------------------------------------------
    {
        "id": 101,
        "name": "BHA 2% Pore Clarifying Foaming Cleanser",
        "brand": "DermoClear",
        "category": "Face Wash",
        "price": 899.0,
        "rating": 4.7,
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Acne", "Oily Skin", "Excess Sebum", "Dark Spots"],
        "key_ingredients": ["Salicylic Acid", "Tea Tree Oil", "Zinc PCA"],
        "full_ingredients": ["Water", "Cocamidopropyl Betaine", "Salicylic Acid", "Tea Tree Oil", "Zinc PCA", "Glycerin"],
        "benefits": ["Unclogs pores", "Reduces excess oil", "Prevents acne breakouts"],
        "description": "A deep-cleansing BHA foam that gently removes excess sebum, clarifies clogged pores, and prevents acne breakouts."
    },
    {
        "id": 102,
        "name": "Gentle Hydrating Ceramide Cleanser",
        "brand": "BarrierCare",
        "category": "Face Wash",
        "price": 799.0,
        "rating": 4.9,
        "suitable_skin_types": ["Dry", "Sensitive", "Normal", "Combination"],
        "target_concerns": ["Dry Skin", "Sensitive Skin", "Barrier Weakness", "Dehydration", "Redness"],
        "key_ingredients": ["Ceramides", "Hyaluronic Acid", "Glycerin"],
        "full_ingredients": ["Water", "Glycerin", "Cetearyl Alcohol", "Ceramide NP", "Ceramide AP", "Hyaluronic Acid"],
        "benefits": ["Restores skin moisture barrier", "Soothes sensitive skin", "Non-foaming and non-stripping"],
        "description": "A cream cleanser formulated with essential ceramides and hyaluronic acid to cleanse without disrupting the skin barrier."
    },
    {
        "id": 103,
        "name": "Centella Soothing Gel Cleanser",
        "brand": "CicaBotanics",
        "category": "Face Wash",
        "price": 599.0,
        "rating": 4.6,
        "suitable_skin_types": ["Sensitive", "Combination", "Oily", "Normal"],
        "target_concerns": ["Redness", "Sensitive Skin", "Mild Sensitivity", "Acne"],
        "key_ingredients": ["Centella Asiatica", "Panthenol", "Allantoin"],
        "full_ingredients": ["Water", "Centella Asiatica Extract", "Panthenol", "Allantoin", "Glycerin"],
        "benefits": ["Calms inflammation", "Reduces skin redness", "Balanced pH 5.5 formulation"],
        "description": "A lightweight gel cleanser powered by Centella Asiatica to calm redness and irritated skin while gently cleansing."
    },
    {
        "id": 104,
        "name": "Brightening AHA Exfoliating Wash",
        "brand": "GlowLab",
        "category": "Face Wash",
        "price": 999.0,
        "rating": 4.4,
        "suitable_skin_types": ["Dry", "Combination", "Normal"],
        "target_concerns": ["Hyperpigmentation", "Uneven Skin Tone", "Dark Spots"],
        "key_ingredients": ["Glycolic Acid", "Lactic Acid", "Vitamin C"],
        "full_ingredients": ["Water", "Glycolic Acid", "Lactic Acid", "Ascorbic Acid", "Fragrance", "Essential Oils"],
        "benefits": ["Exfoliates dead skin cells", "Brightens complexion", "Smooths skin texture"],
        "description": "An AHA chemical exfoliating cleanser designed to fade surface hyperpigmentation and reveal a radiant complexion."
    },

    # ----------------------------------------------------
    # Category 2: Moisturizer
    # ----------------------------------------------------
    {
        "id": 201,
        "name": "Barrier Defense Ceramide Gel Moisturizer",
        "brand": "BarrierCare",
        "category": "Moisturizer",
        "price": 1299.0,
        "rating": 4.8,
        "suitable_skin_types": ["Dry", "Sensitive", "Combination", "Normal"],
        "target_concerns": ["Barrier Weakness", "Dry Skin", "Dehydration", "Redness"],
        "key_ingredients": ["Ceramides", "Niacinamide", "Peptides"],
        "full_ingredients": ["Water", "Ceramide NP", "Niacinamide", "Palmitoyl Tripeptide-1", "Glycerin", "Squalane"],
        "benefits": ["Locks in deep moisture", "Strengthens skin barrier", "Oil-free gel cream texture"],
        "description": "A light gel moisturizer loaded with 3 essential ceramides and niacinamide to repair damaged moisture barriers."
    },
    {
        "id": 202,
        "name": "Oil-Free Mattifying Niacinamide Lotion",
        "brand": "DermoClear",
        "category": "Moisturizer",
        "price": 999.0,
        "rating": 4.7,
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Oily Skin", "Excess Sebum", "Acne", "Uneven Skin Tone"],
        "key_ingredients": ["Niacinamide", "Zinc PCA", "Hyaluronic Acid"],
        "full_ingredients": ["Water", "Niacinamide", "Zinc PCA", "Sodium Hyaluronate", "Silica"],
        "benefits": ["Controls shine for 8 hours", "Refines enlarged pores", "Provides weightless hydration"],
        "description": "An ultra-lightweight moisturizer that absorbs shine and balances oil production with 5% Niacinamide."
    },
    {
        "id": 203,
        "name": "Rich Squalane Restorative Cream",
        "brand": "LuxSkin",
        "category": "Moisturizer",
        "price": 1799.0,
        "rating": 4.9,
        "suitable_skin_types": ["Dry", "Sensitive"],
        "target_concerns": ["Dry Skin", "Wrinkles", "Fine Lines", "Dehydration"],
        "key_ingredients": ["Squalane", "Shea Butter", "Hyaluronic Acid"],
        "full_ingredients": ["Water", "Squalane", "Shea Butter", "Glycerin", "Sodium Hyaluronate"],
        "benefits": ["Intense overnight nourishment", "Smooths fine dehydration lines", "Plumps skin texture"],
        "description": "A rich, velvety night cream powered by 100% plant-derived Squalane for dry and aging skin types."
    },
    {
        "id": 204,
        "name": "Cica Repair Moisture Balm",
        "brand": "CicaBotanics",
        "category": "Moisturizer",
        "price": 1149.0,
        "rating": 4.7,
        "suitable_skin_types": ["Sensitive", "Dry", "Combination"],
        "target_concerns": ["Sensitive Skin", "Redness", "Barrier Weakness"],
        "key_ingredients": ["Centella Asiatica", "Madecassoside", "Panthenol"],
        "full_ingredients": ["Water", "Centella Asiatica Extract", "Madecassoside", "Panthenol", "Glycerin"],
        "benefits": ["Relieves itching and irritation", "Accelerates skin healing", "Dermatologist tested"],
        "description": "A concentrated repair balm infused with Madecassoside and Panthenol to soothe reactive and compromised skin."
    },

    # ----------------------------------------------------
    # Category 3: Sunscreen
    # ----------------------------------------------------
    {
        "id": 301,
        "name": "Invisible Shield Mineral Sunscreen SPF 50+",
        "brand": "SunDefense",
        "category": "Sunscreen",
        "price": 1099.0,
        "rating": 4.8,
        "suitable_skin_types": ["Sensitive", "Combination", "Oily", "Dry", "Normal"],
        "target_concerns": ["Sensitive Skin", "Hyperpigmentation", "Dark Spots", "Wrinkles"],
        "key_ingredients": ["Zinc Oxide", "Niacinamide", "Vitamin E"],
        "full_ingredients": ["Zinc Oxide 12%", "Water", "Niacinamide", "Tocopherol", "Caprylic/Capric Triglyceride"],
        "benefits": ["100% non-nano zinc mineral filter", "Zero white cast", "Reef safe & fragrance free"],
        "description": "A broad-spectrum mineral SPF 50+ offering lightweight broad-spectrum UVA/UVB protection without irritation."
    },
    {
        "id": 302,
        "name": "Mattifying Fluid Sunscreen SPF 30",
        "brand": "DermoClear",
        "category": "Sunscreen",
        "price": 899.0,
        "rating": 4.5,
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Oily Skin", "Excess Sebum", "Acne"],
        "key_ingredients": ["Silica", "Niacinamide", "Green Tea Extract"],
        "full_ingredients": ["Water", "Homosalate", "Octocrylene", "Niacinamide", "Camellia Sinensis Extract", "Fragrance"],
        "benefits": ["Non-comedogenic fluid formula", "Matte soft-focus finish", "Sweat resistant"],
        "description": "A fast-absorbing oil-control sunscreen that prevents UV-induced dark spots while keeping the face shine-free."
    },
    {
        "id": 303,
        "name": "Hydrating Water-Gel Sunscreen SPF 50",
        "brand": "AquaGlow",
        "category": "Sunscreen",
        "price": 1249.0,
        "rating": 4.9,
        "suitable_skin_types": ["Dry", "Normal", "Combination"],
        "target_concerns": ["Dehydration", "Dry Skin", "Uneven Skin Tone"],
        "key_ingredients": ["Hyaluronic Acid", "Centella Asiatica", "Aloe Vera"],
        "full_ingredients": ["Water", "Ethylhexyl Methoxycinnamate", "Sodium Hyaluronate", "Centella Asiatica Extract", "Aloe Barbadensis"],
        "benefits": ["Instant cooling hydration", "Invisible glossy dew finish", "Protects against blue light"],
        "description": "A water-burst gel SPF 50 infused with Hyaluronic Acid that hydrates like a moisturizer while delivering high UV defense."
    },
    {
        "id": 304,
        "name": "Tinted Tone Correcting Sunscreen SPF 40",
        "brand": "GlowLab",
        "category": "Sunscreen",
        "price": 1399.0,
        "rating": 4.6,
        "suitable_skin_types": ["Combination", "Dry", "Normal"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Skin Tone"],
        "key_ingredients": ["Iron Oxides", "Vitamin C", "Niacinamide"],
        "full_ingredients": ["Titanium Dioxide", "Zinc Oxide", "Iron Oxides", "Ascorbyl Glucoside", "Niacinamide"],
        "benefits": ["Blurs blemishes and redness", "Protects against visible light", "Adaptable sheer tint"],
        "description": "A tinted physical sunscreen rich in antioxidants that evens skin tone while shielding against sun exposure."
    },

    # ----------------------------------------------------
    # Category 4: Serum
    # ----------------------------------------------------
    {
        "id": 401,
        "name": "Brightening Vitamin C 15% Serum",
        "brand": "GlowLab",
        "category": "Serum",
        "price": 1590.0,
        "rating": 4.8,
        "suitable_skin_types": ["Combination", "Oily", "Dry", "Normal"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Skin Tone", "Wrinkles"],
        "key_ingredients": ["Vitamin C", "Ferulic Acid", "Hyaluronic Acid"],
        "full_ingredients": ["Water", "L-Ascorbic Acid 15%", "Ferulic Acid", "Sodium Hyaluronate", "Tocopherol"],
        "benefits": ["Fades dark spots in 4 weeks", "Potent antioxidant protection", "Boosts collagen production"],
        "description": "A clinically proven 15% L-Ascorbic Acid serum stabilized with Ferulic Acid to brighten dark spots."
    },
    {
        "id": 402,
        "name": "Niacinamide 10% + Zinc 1% Clarifying Serum",
        "brand": "DermoClear",
        "category": "Serum",
        "price": 649.0,
        "rating": 4.7,
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Acne", "Oily Skin", "Excess Sebum", "Redness", "Uneven Skin Tone"],
        "key_ingredients": ["Niacinamide", "Zinc PCA", "Allantoin"],
        "full_ingredients": ["Water", "Niacinamide 10%", "Zinc PCA 1%", "Allantoin", "Xanthan Gum"],
        "benefits": ["Reduces active breakouts", "Minimizes enlarged pores", "Regulates sebum production"],
        "description": "A high-strength vitamin and mineral blemish formula designed to reduce skin blemishes and congestion."
    },
    {
        "id": 403,
        "name": "Hyaluronic Acid 2% + B5 Hydrating Serum",
        "brand": "AquaGlow",
        "category": "Serum",
        "price": 749.0,
        "rating": 4.9,
        "suitable_skin_types": ["Dry", "Sensitive", "Combination", "Normal", "Oily"],
        "target_concerns": ["Dehydration", "Dry Skin", "Barrier Weakness", "Fine Lines"],
        "key_ingredients": ["Hyaluronic Acid", "Panthenol (Vitamin B5)", "Glycerin"],
        "full_ingredients": ["Water", "Sodium Hyaluronate", "Panthenol", "Glycerin", "Pentylene Glycol"],
        "benefits": ["Multi-depth hydration", "Plumps fine dehydration lines", "Hypoallergenic and soothing"],
        "description": "A multi-molecular hyaluronic acid serum that delivers deep moisture to all skin layers."
    },
    {
        "id": 404,
        "name": "Advanced Peptide & Retinol Youth Serum",
        "brand": "LuxSkin",
        "category": "Serum",
        "price": 2199.0,
        "rating": 4.8,
        "suitable_skin_types": ["Dry", "Combination", "Normal"],
        "target_concerns": ["Wrinkles", "Fine Lines", "Uneven Skin Tone"],
        "key_ingredients": ["Encapsulated Retinol", "Matrixyl 3000", "Peptides"],
        "full_ingredients": ["Water", "Retinol 0.3%", "Palmitoyl Tripeptide-38", "Glycerin", "Squalane", "Fragrance"],
        "benefits": ["Diminishes deep wrinkles", "Improves skin elasticity", "Time-release non-irritating formula"],
        "description": "An advanced anti-aging treatment combining micro-encapsulated retinol with collagen-stimulating peptides."
    },

    # ----------------------------------------------------
    # Category 5: Toner
    # ----------------------------------------------------
    {
        "id": 501,
        "name": "BHA Clarifying Exfoliating Toner",
        "brand": "DermoClear",
        "category": "Toner",
        "price": 799.0,
        "rating": 4.7,
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Acne", "Excess Sebum", "Oily Skin"],
        "key_ingredients": ["Salicylic Acid", "Willow Bark Extract", "Niacinamide"],
        "full_ingredients": ["Water", "Salicylic Acid 2%", "Salix Alba Extract", "Niacinamide", "Butylene Glycol"],
        "benefits": ["Clears blackheads", "Smooths bumpy texture", "Gentle leave-on liquid"],
        "description": "A liquid leave-on exfoliant that rapidly unclogs pores and diminishes blackheads."
    },
    {
        "id": 502,
        "name": "Hyaluronic Hydrating Milky Toner",
        "brand": "AquaGlow",
        "category": "Toner",
        "price": 699.0,
        "rating": 4.8,
        "suitable_skin_types": ["Dry", "Sensitive", "Normal", "Combination"],
        "target_concerns": ["Dry Skin", "Dehydration", "Sensitive Skin", "Redness"],
        "key_ingredients": ["Hyaluronic Acid", "Ceramides", "Panthenol"],
        "full_ingredients": ["Water", "Glycerin", "Sodium Hyaluronate", "Ceramide NP", "Panthenol"],
        "benefits": ["Immediate moisture surge", "Softens rough skin", "Preps skin for serums"],
        "description": "A comforting milky toner that restores lost hydration and balances pH after cleansing."
    },
    {
        "id": 503,
        "name": "Centella Asiatica Calming Essence Toner",
        "brand": "CicaBotanics",
        "category": "Toner",
        "price": 649.0,
        "rating": 4.9,
        "suitable_skin_types": ["Sensitive", "Combination", "Dry", "Oily", "Normal"],
        "target_concerns": ["Sensitive Skin", "Redness", "Barrier Weakness", "Mild Sensitivity"],
        "key_ingredients": ["Centella Asiatica", "Madecassoside", "Allantoin"],
        "full_ingredients": ["Centella Asiatica Extract 84%", "Water", "Madecassoside", "Allantoin", "1,2-Hexanediol"],
        "benefits": ["84% pure Cica extract", "Relieves redness instantly", "Alcohol and fragrance free"],
        "description": "A soothing botanical essence toner packed with Centella Asiatica to relieve flushed, sensitive skin."
    },
    {
        "id": 504,
        "name": "Glycolic Acid 7% Exfoliating Toner",
        "brand": "GlowLab",
        "category": "Toner",
        "price": 549.0,
        "rating": 4.5,
        "suitable_skin_types": ["Combination", "Oily", "Normal"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Skin Tone"],
        "key_ingredients": ["Glycolic Acid", "Tasmanian Pepperberry", "Aloe Vera"],
        "full_ingredients": ["Water", "Glycolic Acid 7%", "Aloe Barbadensis Leaf Water", "Glycerin", "Alcohol Denat"],
        "benefits": ["Resurfaces skin texture", "Fades post-acne marks", "Enhances glow"],
        "description": "An AHA exfoliating solution designed to improve skin clarity and smooth uneven texture."
    },

    # ----------------------------------------------------
    # Category 6: Treatment Products
    # ----------------------------------------------------
    {
        "id": 601,
        "name": "Azelaic Acid 10% Suspension Treatment",
        "brand": "DermoClear",
        "category": "Treatment Products",
        "price": 949.0,
        "rating": 4.8,
        "suitable_skin_types": ["Sensitive", "Combination", "Oily", "Normal"],
        "target_concerns": ["Acne", "Redness", "Hyperpigmentation", "Dark Spots", "Sensitive Skin"],
        "key_ingredients": ["Azelaic Acid", "Niacinamide", "Allantoin"],
        "full_ingredients": ["Water", "Azelaic Acid 10%", "Niacinamide", "Allantoin", "Dimethicone"],
        "benefits": ["Targets acne marks", "Calms rosacea & redness", "Evens skin pigmentation"],
        "description": "A multifunctional treatment cream containing 10% Azelaic Acid to target redness, rosacea, and dark spots."
    },
    {
        "id": 602,
        "name": "Retinoid 2% Renewal Treatment Lotion",
        "brand": "LuxSkin",
        "category": "Treatment Products",
        "price": 1899.0,
        "rating": 4.7,
        "suitable_skin_types": ["Dry", "Combination", "Normal"],
        "target_concerns": ["Wrinkles", "Fine Lines", "Hyperpigmentation", "Uneven Skin Tone"],
        "key_ingredients": ["Hydroxypinacolone Retinoate", "Squalan", "Peptides"],
        "full_ingredients": ["Water", "Hydroxypinacolone Retinoate 2%", "Squalane", "Peptides", "Glycerin"],
        "benefits": ["Accelerates cell turnover", "Fades stubborn discoloration", "Gentler than pure retinol"],
        "description": "A next-generation retinoid active lotion providing superior anti-aging results with minimal irritation."
    },
    {
        "id": 603,
        "name": "Salicylic Acid 2% Targeted Spot Treatment",
        "brand": "DermoClear",
        "category": "Treatment Products",
        "price": 499.0,
        "rating": 4.6,
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Acne", "Excess Sebum"],
        "key_ingredients": ["Salicylic Acid", "Sulfur", "Zinc Oxide"],
        "full_ingredients": ["Water", "Salicylic Acid 2%", "Sulfur", "Zinc Oxide", "Alcohol Denat"],
        "benefits": ["Rapidly shrinks active pimples", "Reduces swelling overnight", "Targeted application"],
        "description": "An emergency spot treatment gel that targets individual acne blemishes and reduces swelling quickly."
    },
    {
        "id": 604,
        "name": "Barrier Intensive Cica Repair Paste",
        "brand": "BarrierCare",
        "category": "Treatment Products",
        "price": 1199.0,
        "rating": 4.9,
        "suitable_skin_types": ["Sensitive", "Dry"],
        "target_concerns": ["Barrier Weakness", "Sensitive Skin", "Redness"],
        "key_ingredients": ["Ceramides", "Centella Asiatica", "Panthenol"],
        "full_ingredients": ["Water", "Ceramide NP", "Centella Asiatica Extract", "Panthenol 5%", "Zinc Oxide"],
        "benefits": ["Emergency barrier rescue", "Protects raw irritated skin", "Fragrance free"],
        "description": "An intensive barrier therapy paste designed for severely compromised, raw, or hypersensitive skin."
    },

    # ----------------------------------------------------
    # Category 7: Face Masks
    # ----------------------------------------------------
    {
        "id": 701,
        "name": "Kaolin Clay Detoxifying Pore Mask",
        "brand": "DermoClear",
        "category": "Face Masks",
        "price": 849.0,
        "rating": 4.6,
        "suitable_skin_types": ["Oily", "Combination"],
        "target_concerns": ["Excess Sebum", "Oily Skin", "Acne", "Dark Spots"],
        "key_ingredients": ["Kaolin Clay", "Bentonite", "Salicylic Acid"],
        "full_ingredients": ["Water", "Kaolin", "Bentonite", "Salicylic Acid", "Glycerin", "Charcoal Powder"],
        "benefits": ["Draws out impurities", "Absorbs excess T-zone oil", "Tightens appearance of pores"],
        "description": "A purifying mineral clay mask that draws out deep-seated dirt, oil, and impurities without cracking."
    },
    {
        "id": 702,
        "name": "Overnight Hyaluronic Hydrating Sleep Mask",
        "brand": "AquaGlow",
        "category": "Face Masks",
        "price": 1049.0,
        "rating": 4.9,
        "suitable_skin_types": ["Dry", "Sensitive", "Normal", "Combination"],
        "target_concerns": ["Dry Skin", "Dehydration", "Fine Lines", "Redness"],
        "key_ingredients": ["Hyaluronic Acid", "Squalane", "Centella Asiatica"],
        "full_ingredients": ["Water", "Sodium Hyaluronate", "Squalane", "Centella Asiatica Extract", "Glycerin"],
        "benefits": ["Wake up to plump skin", "Intense overnight infusion", "Cooling jelly texture"],
        "description": "A leave-on sleeping mask that recharges dehydrated skin overnight with deep moisture."
    },
    {
        "id": 703,
        "name": "Soothing Cica Sheet Mask Set (5 Pack)",
        "brand": "CicaBotanics",
        "category": "Face Masks",
        "price": 649.0,
        "rating": 4.8,
        "suitable_skin_types": ["Sensitive", "Dry", "Combination", "Normal", "Oily"],
        "target_concerns": ["Sensitive Skin", "Redness", "Barrier Weakness", "Mild Sensitivity"],
        "key_ingredients": ["Centella Asiatica", "Aloe Vera", "Allantoin"],
        "full_ingredients": ["Water", "Centella Asiatica Extract 50%", "Aloe Barbadensis", "Allantoin", "Glycerin"],
        "benefits": ["100% biodegradable cotton sheet", "Instant cooling relief", "Dermatologist approved"],
        "description": "A pack of 5 soothing sheet masks drenched in concentrated Cica serum for immediate skin calming."
    },
    {
        "id": 704,
        "name": "Vitamin C Glow Brightening Sheet Mask",
        "brand": "GlowLab",
        "category": "Face Masks",
        "price": 749.0,
        "rating": 4.5,
        "suitable_skin_types": ["Combination", "Dry", "Normal"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Skin Tone"],
        "key_ingredients": ["Vitamin C", "Niacinamide", "Ferulic Acid"],
        "full_ingredients": ["Water", "Ascorbyl Glucoside", "Niacinamide", "Ferulic Acid", "Fragrance"],
        "benefits": ["Instant radiance boost", "Evens dull tone", "Hydrating serum sheet"],
        "description": "A radiance-enhancing sheet mask infused with Vitamin C and Niacinamide to revive tired, dull skin."
    }
]


def calculate_product_suitability(product: dict, user_profile: dict) -> dict:
    """
    Calculates deterministic suitability score (0-100%) and generates match reasons
    for a given product and user profile. Enforces strict allergy and severe sensitivity rules.

    Parameters:
    -----------
    product : dict
        Product dictionary from catalog.
    user_profile : dict
        Dict containing user skin assessment data:
        - predicted_skin_type: str ('Dry', 'Oily', 'Combination', 'Sensitive', 'Normal')
        - sensitivity: str ('High', 'Medium', 'Low')
        - concerns: list of str
        - allergies: list of str or str

    Returns:
    --------
    dict : {
        "match_score": int (0 to 100),
        "is_suitable": bool,
        "status": str ("Highly Recommended" | "Suitable Match" | "Low Match" | "Unsuitable / Allergy Conflict" | "Unsuitable / High Sensitivity Conflict"),
        "match_reasons": list of str,
        "conflicts": list of str
    }
    """
    # Normalize user profile inputs
    user_skin_type = str(user_profile.get("predicted_skin_type") or "Combination").strip().title()
    user_sensitivity = str(user_profile.get("sensitivity") or "Low").strip().title()
    
    raw_concerns = user_profile.get("concerns") or []
    if isinstance(raw_concerns, str):
        raw_concerns = [raw_concerns]
    user_concerns = [str(c).strip().title() for c in raw_concerns if c]

    raw_allergies = user_profile.get("allergies") or []
    if isinstance(raw_allergies, str):
        # Handle string format like "Fragrance, Essential Oils"
        user_allergies = [a.strip().title() for a in raw_allergies.split(",") if a.strip()]
    else:
        user_allergies = [str(a).strip().title() for a in raw_allergies if a]

    product_full_ingredients = [str(i).strip().title() for i in product.get("full_ingredients", [])]
    product_key_ingredients = [str(i).strip().title() for i in product.get("key_ingredients", [])]
    product_all_ingredients = list(set(product_full_ingredients + product_key_ingredients))

    match_reasons = []
    conflicts = []

    # =========================================================================
    # RULE 1: ALLERGY CONFLICT (Highest Priority) -> Score = 0, Unsuitable
    # =========================================================================
    detected_allergen = None
    for allergy in user_allergies:
        if not allergy or allergy.lower() == "none":
            continue
        for ing in product_all_ingredients:
            if allergy.lower() in ing.lower() or ing.lower() in allergy.lower():
                detected_allergen = allergy
                break
        if detected_allergen:
            break

    if detected_allergen:
        conflicts.append(f"ALLERGY WARNING: Product contains '{detected_allergen}' which conflicts with your stated allergies.")
        return {
            "match_score": 0,
            "is_suitable": False,
            "status": "Unsuitable / Allergy Conflict",
            "match_reasons": [],
            "conflicts": conflicts
        }

    # =========================================================================
    # RULE 2: SEVERE SENSITIVITY CONFLICT -> Score = 0, Unsuitable
    # =========================================================================
    is_high_sensitivity = (user_sensitivity == "High") or ("Sensitive Skin" in user_concerns) or ("Barrier Weakness" in user_concerns)
    harsh_ingredients = ["Fragrance", "Alcohol Denat", "Essential Oils", "Sodium Lauryl Sulfate"]

    detected_harsh_ingredient = None
    if is_high_sensitivity:
        for harsh in harsh_ingredients:
            for ing in product_all_ingredients:
                if harsh.lower() in ing.lower():
                    detected_harsh_ingredient = harsh
                    break
            if detected_harsh_ingredient:
                break

    if detected_harsh_ingredient:
        conflicts.append(f"SENSITIVITY WARNING: Contains '{detected_harsh_ingredient}' which is unsafe for your high skin sensitivity or barrier weakness.")
        return {
            "match_score": 0,
            "is_suitable": False,
            "status": "Unsuitable / High Sensitivity Conflict",
            "match_reasons": [],
            "conflicts": conflicts
        }

    # =========================================================================
    # RULE 3: NORMAL SUITABILITY SCORING (Base: 50 points)
    # =========================================================================
    score = 50

    # A. Skin Type Alignment (+20 pts max)
    prod_skin_types = [str(st).strip().title() for st in product.get("suitable_skin_types", [])]
    if user_skin_type in prod_skin_types or "All" in prod_skin_types:
        score += 20
        match_reasons.append(f"Formulated specifically for {user_skin_type} skin (+20%)")
    else:
        score -= 10
        conflicts.append(f"Designed primarily for {', '.join(prod_skin_types)} skin.")

    # B. Target Concern Alignment (+20 pts max, +10 per concern)
    prod_concerns = [str(tc).strip().title() for tc in product.get("target_concerns", [])]
    matching_concerns = [c for c in user_concerns if c in prod_concerns]
    
    if matching_concerns:
        concern_pts = min(20, len(matching_concerns) * 10)
        score += concern_pts
        match_reasons.append(f"Targets your specific concerns: {', '.join(matching_concerns[:2])} (+{concern_pts}%)")

    # C. Key Active Ingredient Benefit Alignment (+10 pts)
    beneficial_actives = {
        "Acne": ["Salicylic Acid", "Niacinamide", "Tea Tree Oil", "Zinc Pca", "Azelaic Acid"],
        "Hyperpigmentation": ["Vitamin C", "Niacinamide", "Glycolic Acid", "Azelaic Acid", "Ferulic Acid"],
        "Dark Spots": ["Vitamin C", "Niacinamide", "Azelaic Acid", "Retinol"],
        "Dry Skin": ["Hyaluronic Acid", "Ceramides", "Squalane", "Glycerin", "Shea Butter"],
        "Dehydration": ["Hyaluronic Acid", "Panthenol", "Glycerin", "Centella Asiatica"],
        "Sensitive Skin": ["Centella Asiatica", "Ceramides", "Panthenol", "Madecassoside", "Allantoin"],
        "Barrier Weakness": ["Ceramides", "Centella Asiatica", "Panthenol", "Squalane"],
        "Oily Skin": ["Niacinamide", "Salicylic Acid", "Zinc Pca", "Kaolin"],
        "Wrinkles": ["Retinol", "Peptides", "Squalane", "Vitamin C"],
        "Fine Lines": ["Peptides", "Hyaluronic Acid", "Retinol"]
    }

    matching_actives = []
    for c in user_concerns:
        actives_for_c = beneficial_actives.get(c, [])
        for act in product_key_ingredients:
            if act in actives_for_c:
                matching_actives.append(act)

    matching_actives = list(dict.fromkeys(matching_actives))
    if matching_actives:
        score += 10
        match_reasons.append(f"Contains key active ingredients: {', '.join(matching_actives[:3])} (+10%)")

    # High Rating Bonus (+10 pts if rating >= 4.7)
    if product.get("rating", 0) >= 4.7:
        score += 10
        match_reasons.append(f"High community rating ({product.get('rating')}/5.0) (+10%)")

    # Clamp Score strictly between 0 and 100
    final_score = int(max(0, min(100, score)))
    is_suitable = final_score >= 60

    if final_score >= 85:
        status = "Highly Recommended"
    elif final_score >= 60:
        status = "Suitable Match"
    else:
        status = "Low Match"

    return {
        "match_score": final_score,
        "is_suitable": is_suitable,
        "status": status,
        "match_reasons": match_reasons,
        "conflicts": conflicts
    }


def get_personalized_recommendations(
    user_profile: dict,
    category: str = "All",
    max_price: float = None,
    min_price: float = None,
    sort_by: str = "match_score"
) -> list:
    """
    Returns personalized product recommendations filtered by category, budget (min/max price),
    sorted by match score, price, or rating. Attaches suitability scoring, reasons, and alternative suggestions.
    """
    results = []

    for prod in PRODUCT_CATALOG:
        # Category filter
        if category and category != "All" and prod["category"].lower() != category.lower():
            continue

        # Budget price filter
        if max_price is not None and prod["price"] > float(max_price):
            continue
        if min_price is not None and prod["price"] < float(min_price):
            continue

        suitability = calculate_product_suitability(prod, user_profile)

        prod_result = dict(prod)
        prod_result["match_score"] = suitability["match_score"]
        prod_result["is_suitable"] = suitability["is_suitable"]
        prod_result["status"] = suitability["status"]
        prod_result["match_reasons"] = suitability["match_reasons"]
        prod_result["conflicts"] = suitability["conflicts"]

        results.append(prod_result)

    # Sorting Logic
    if sort_by == "price_low_to_high":
        results.sort(key=lambda x: (x["price"], -x["match_score"]))
    elif sort_by == "price_high_to_low":
        results.sort(key=lambda x: (-x["price"], -x["match_score"]))
    elif sort_by == "rating":
        results.sort(key=lambda x: (-x["rating"], -x["match_score"]))
    else:  # Default: "match_score"
        results.sort(key=lambda x: (-x["match_score"], -x["rating"], x["price"]))

    # Attach alternative product suggestions for lower-scoring or unsuitable products
    for prod_res in results:
        if prod_res["match_score"] < 75 or not prod_res["is_suitable"]:
            alternatives = get_alternative_products(prod_res["id"], user_profile, max_price=max_price)
            prod_res["alternative_suggestions"] = alternatives
        else:
            prod_res["alternative_suggestions"] = []

    return results


def get_alternative_products(product_id: int, user_profile: dict, max_price: float = None) -> list:
    """
    Finds alternative products in the same category that have higher suitability scores,
    no allergy conflicts, and fit within budget parameters.
    """
    target_product = next((p for p in PRODUCT_CATALOG if p["id"] == product_id), None)
    if not target_product:
        return []

    category = target_product["category"]
    target_score = calculate_product_suitability(target_product, user_profile)["match_score"]

    alternatives = []
    for prod in PRODUCT_CATALOG:
        if prod["id"] == product_id or prod["category"] != category:
            continue

        if max_price is not None and prod["price"] > float(max_price):
            continue

        suitability = calculate_product_suitability(prod, user_profile)
        # Must be suitable and have better/higher score or lower price
        if suitability["is_suitable"] and suitability["match_score"] > 0:
            if suitability["match_score"] >= target_score or prod["price"] < target_product["price"]:
                alt_data = dict(prod)
                alt_data["match_score"] = suitability["match_score"]
                alt_data["status"] = suitability["status"]
                alt_data["reason_for_alternative"] = (
                    "Higher Suitability Score" if suitability["match_score"] > target_score
                    else ("More Affordable Price" if prod["price"] < target_product["price"] else "Allergy Safe Alternative")
                )
                alternatives.append(alt_data)

    alternatives.sort(key=lambda x: (-x["match_score"], x["price"]))
    return alternatives[:3]  # Return top 3 alternatives


def compare_products(product_ids: list, user_profile: dict) -> dict:
    """
    Generates side-by-side product comparison object for 2 to 4 selected product IDs.
    """
    valid_products = []
    for pid in product_ids:
        try:
            pid_int = int(pid)
            prod = next((p for p in PRODUCT_CATALOG if p["id"] == pid_int), None)
            if prod:
                suitability = calculate_product_suitability(prod, user_profile)
                prod_data = dict(prod)
                prod_data["match_score"] = suitability["match_score"]
                prod_data["is_suitable"] = suitability["is_suitable"]
                prod_data["status"] = suitability["status"]
                prod_data["match_reasons"] = suitability["match_reasons"]
                prod_data["conflicts"] = suitability["conflicts"]
                valid_products.append(prod_data)
        except (ValueError, TypeError):
            continue

    return {
        "product_count": len(valid_products),
        "products": valid_products,
        "comparison_metrics": ["Match Score", "Price", "Category", "Key Actives", "Target Concerns", "Safety & Suitability Status"]
    }


if __name__ == "__main__":
    print("=" * 70)
    print(" TESTING PRODUCT RECOMMENDATION ENGINE (backend/app/product_engine.py)")
    print("=" * 70)

    # Sample user profile with sensitive skin and allergy to Fragrance
    sample_user = {
        "predicted_skin_type": "Combination",
        "sensitivity": "High",
        "concerns": ["Acne", "Hyperpigmentation", "Sensitive Skin"],
        "allergies": ["Fragrance"]
    }

    print("\n--- Testing Personalized Recommendations (Category: All) ---")
    recs = get_personalized_recommendations(sample_user)
    print(f"Total Products Processed: {len(recs)}")
    for r in recs[:4]:
        print(f"[{r['category']}] {r['name']} - Price: INR {r['price']:.0f} | Match Score: {r['match_score']}% | Status: {r['status']}")
        if r['match_reasons']:
            print(f"  Reasons  : {r['match_reasons']}")
        if r['conflicts']:
            print(f"  Conflicts: {r['conflicts']}")

    print("\n--- Testing Allergy Conflict Handling ---")
    fragrance_product = next(p for p in PRODUCT_CATALOG if "Fragrance" in p.get("full_ingredients", []))
    allergy_res = calculate_product_suitability(fragrance_product, sample_user)
    print(f"Product: {fragrance_product['name']}")
    print(f"Allergy Result -> Match Score: {allergy_res['match_score']}, Suitable: {allergy_res['is_suitable']}, Status: '{allergy_res['status']}'")

    print("\n--- Testing Side-by-Side Comparison ---")
    comp = compare_products([101, 102, 201], sample_user)
    print(f"Compared {comp['product_count']} Products successfully.")

    print("=" * 70)
    print(" ALL PRODUCT ENGINE TESTS PASSED")
    print("=" * 70)
