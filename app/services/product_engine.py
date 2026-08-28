import math
from typing import Dict, List, Any, Optional, Tuple

# ============================================================================
# 1. PRODUCT CATEGORIES (7 Core Categories)
# ============================================================================

PRODUCT_CATEGORIES = {
    "face_wash": {
        "id": "face_wash",
        "name": "Face Wash",
        "icon": "🧼",
        "tagline": "Gentle, purifying, and barrier-safe facial cleansers",
        "description": "Essential first step in removing excess sebum, pollutants, makeup, and dead skin cells without stripping natural lipid barriers.",
        "routine_order": 1,
        "step_default": "morning & evening"
    },
    "moisturizer": {
        "id": "moisturizer",
        "name": "Moisturizer",
        "icon": "🧴",
        "tagline": "Hydrating, lipid-restoring creams, lotions & gels",
        "description": "Seals in hydration, restores intercellular ceramides and fatty acids, and defends against transepidermal water loss (TEWL).",
        "routine_order": 5,
        "step_default": "morning & evening"
    },
    "sunscreen": {
        "id": "sunscreen",
        "name": "Sunscreen",
        "icon": "☀️",
        "tagline": "Broad-spectrum UVA/UVB photoprotection fluids & creams",
        "description": "Crucial daily defense against photoaging, hyperpigmentation, collagen degradation, and UV-induced cellular DNA damage.",
        "routine_order": 6,
        "step_default": "morning"
    },
    "serum": {
        "id": "serum",
        "name": "Serum",
        "icon": "💧",
        "tagline": "High-potency concentrated active treatments",
        "description": "Targeted lightweight active delivery formulas addressing specific concerns like dullness, fine lines, dark spots, and dehydration.",
        "routine_order": 3,
        "step_default": "morning & evening"
    },
    "toner": {
        "id": "toner",
        "name": "Toner",
        "icon": "🌿",
        "tagline": "Balancing, soothing essences & gentle clarifying toners",
        "description": "Prepares skin, restores physiological pH post-cleansing, provides hydration priming, and refines pore texture.",
        "routine_order": 2,
        "step_default": "morning & evening"
    },
    "treatment_products": {
        "id": "treatment_products",
        "name": "Treatment Products",
        "icon": "🎯",
        "tagline": "Targeted spot correctors, chemical peels & clinical actives",
        "description": "Intensive dermatological solutions formulated to treat stubborn blemish flare-ups, deep hyperpigmentation, texture, or barrier trauma.",
        "routine_order": 4,
        "step_default": "evening / weekly"
    },
    "face_masks": {
        "id": "face_masks",
        "name": "Face Masks",
        "icon": "✨",
        "tagline": "Clarifying clay, overnight sleeping & soothing sheet masks",
        "description": "Intense supplemental care delivering deep pore detoxification, overnight lipid hydration, or rapid soothing rescue.",
        "routine_order": 7,
        "step_default": "weekly / 2-3x week"
    }
}


# ============================================================================
# 2. CURATED PRODUCT CATALOG (35+ Premium Clinical & Dermatological Products)
# ============================================================================

PRODUCT_CATALOG = [
    # ── 1. FACE WASH (Cleansers) ──
    {
        "id": "cerave-hydrating-facial-cleanser",
        "name": "Hydrating Facial Cleanser",
        "brand": "CeraVe",
        "category": "face_wash",
        "category_name": "Face Wash",
        "price": 1078.17,
        "budget_tier": "budget",
        "rating": 4.8,
        "review_count": 14200,
        "volume": "237 ml / 8 fl oz",
        "gradient_bg": "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
        "tagline": "Non-foaming lotion cleanser with 3 essential ceramides & hyaluronic acid",
        "description": "Formulated with 3 essential ceramides (1, 3, 6-II) and hyaluronic acid using MVE delivery technology to gently cleanse while restoring and reinforcing the natural skin barrier.",
        "key_actives": ["Ceramide NP", "Ceramide AP", "Ceramide EOP", "Hyaluronic Acid", "Glycerin"],
        "full_inci": "Aqua/Water, Glycerin, Cetearyl Alcohol, PEG-40 Stearate, Stearyl Alcohol, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Glyceryl Stearate, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium EDTA, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin.",
        "suitable_skin_types": ["Dry", "Normal", "Sensitive", "Combination"],
        "target_concerns": ["Dryness", "Barrier Damage", "Flaking", "Redness"],
        "texture": "Silky, non-foaming soothing lotion",
        "finish": "Nourished, dewy, hydrated",
        "time_of_day": "morning & evening",
        "benefits": [
            "Cleanses without stripping essential lipids",
            "MVE technology ensures 24-hour continuous moisture release",
            "Fragrance-free, non-comedogenic and accepted by the National Eczema Association"
        ],
        "usage_instructions": "Wet skin with lukewarm water. Massage cleanser into skin in gentle circular motions. Rinse thoroughly and pat dry.",
        "contraindications": "None. Suitable for daily sensitive skin use.",
        "allergen_flags": [],
        "alternative_ids": ["cetaphil-gentle-skin-cleanser", "la-roche-posay-toleriane-hydrating-cleanser"]
    },
    {
        "id": "paulas-choice-pore-normalizing-cleanser",
        "name": "CLEAR Pore Normalizing Cleanser",
        "brand": "Paula's Choice",
        "category": "face_wash",
        "category_name": "Face Wash",
        "price": 1577.00,
        "budget_tier": "mid_range",
        "rating": 4.7,
        "review_count": 5200,
        "volume": "177 ml / 6 fl oz",
        "gradient_bg": "linear-gradient(135deg, #059669 0%, #10b981 100%)",
        "tagline": "Gentle 0.5% Salicylic Acid BHA clarifying gel cleanser",
        "description": "A silky gel cleanser that removes excess sebum, makeup, and dead surface cells while dissolving pore congestion without causing dryness or irritation.",
        "key_actives": ["Salicylic Acid 0.5%", "Arginine", "Provitamin B5 (Panthenol)", "Glycerin"],
        "full_inci": "Water (Aqua), Sodium Lauroyl Sarcosinate, Acrylates/Steareth-20 Methacrylate Copolymer, Glycerin, PEG-200 Hydrogenated Glyceryl Palmate, Sodium Laureth Sulfate, Salicylic Acid, Arginine, Butylene Glycol, PEG-7 Glyceryl Cocoate, Panthenol, Disodium EDTA, Citric Acid, Phenoxyethanol, Caprylyl Glycol.",
        "suitable_skin_types": ["Oily", "Combination", "Acne-Prone", "Normal"],
        "target_concerns": ["Acne", "Large Pores", "Blackheads", "Excess Sebum"],
        "texture": "Refreshing light foaming gel",
        "finish": "Clean, balanced, non-greasy",
        "time_of_day": "morning & evening",
        "benefits": [
            "Decongests pores and prevents micro-comedone formation",
            "Non-stripping formulation preserves skin barrier pH",
            "Soothes redness and calms active breakout inflammation"
        ],
        "usage_instructions": "Apply a nickel-sized amount to wet face. Gently massage for 60 seconds focusing on the T-zone. Rinse thoroughly with lukewarm water.",
        "contraindications": "Contains Salicylic Acid (BHA). Avoid if allergic to aspirin.",
        "allergen_flags": ["salicylic acid"],
        "alternative_ids": ["cerave-hydrating-facial-cleanser", "tatcha-the-rice-wash"]
    },
    {
        "id": "tatcha-the-rice-wash",
        "name": "The Rice Wash Soft Cream Cleanser",
        "brand": "Tatcha",
        "category": "face_wash",
        "category_name": "Face Wash",
        "price": 3320.00,
        "budget_tier": "luxury",
        "rating": 4.9,
        "review_count": 8900,
        "volume": "120 ml / 4.0 fl oz",
        "gradient_bg": "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        "tagline": "Luxury Japanese rice & hyaluronic acid skin-softening wash",
        "description": "An opulent cream cleanser that gently washes away daily impurities with Japanese rice powder and an amino acid base while leaving skin supple, luminous, and deeply hydrated.",
        "key_actives": ["Japanese Rice Powder", "Hadasei-3 Bio-ferment", "Sodium Hyaluronate", "Algae Extract"],
        "full_inci": "Aqua/Water/Eau, Microcrystalline Cellulose, Propanediol, Sodium Cocoyl Glycinate, Glycerin, Acrylates Copolymer, Oryza Sativa (Rice) Powder, Saccharomyces/Camellia Sinensis Leaf/Cladosiphon Okamuranus/Rice Ferment Filtrate, Sodium Hyaluronate, Hydrolyzed Silk, Dipotassium Glycyrrhizate, Phenoxyethanol, Ethylhexylglycerin.",
        "suitable_skin_types": ["Normal", "Dry", "Combination", "Sensitive"],
        "target_concerns": ["Dullness", "Uneven Texture", "Dehydration", "Aging"],
        "texture": "Rich, micro-cushioning whipped cream",
        "finish": "Soft, luminous, velvety",
        "time_of_day": "morning & evening",
        "benefits": [
            "Polishes skin texture gently without micro-tears",
            "Hadasei-3 proprietary trinity of green tea, rice, and algae replenishes skin radiance",
            "pH-neutral formulation leaves skin cushiony and hydrated"
        ],
        "usage_instructions": "Begin with wet hands and face. Squeeze a dime-sized amount into palms and rub together to create a creamy foam. Massage gently, then rinse.",
        "contraindications": "None.",
        "allergen_flags": [],
        "alternative_ids": ["cerave-hydrating-facial-cleanser", "paulas-choice-pore-normalizing-cleanser"]
    },
    {
        "id": "cetaphil-gentle-skin-cleanser",
        "name": "Gentle Skin Cleanser",
        "brand": "Cetaphil",
        "category": "face_wash",
        "category_name": "Face Wash",
        "price": 829.17,
        "budget_tier": "budget",
        "rating": 4.6,
        "review_count": 18500,
        "volume": "250 ml / 8.5 fl oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
        "tagline": "Hypoallergenic daily cleanser with Niacinamide & Panthenol",
        "description": "Clinically proven creamy formula that defends against 5 signs of skin sensitivity: weakened skin barrier, irritation, roughness, tightness, and dryness.",
        "key_actives": ["Niacinamide (Vitamin B3)", "Panthenol (Pro-Vitamin B5)", "Glycerin"],
        "full_inci": "Water, Glycerin, Cetearyl Alcohol, Panthenol, Niacinamide, Pantolactone, Xanthan Gum, Sodium Cocoyl Isethionate, Sodium Benzoate, Citric Acid.",
        "suitable_skin_types": ["Sensitive", "Dry", "Normal"],
        "target_concerns": ["Redness", "Sensitivities", "Dryness", "Barrier Damage"],
        "texture": "Milky, non-foaming calming gel-lotion",
        "finish": "Comfortable, calm, non-tight",
        "time_of_day": "morning & evening",
        "benefits": [
            "100% soap-free, fragrance-free, paraben-free and hypoallergenic",
            "Enriched with dermatologist-backed blend of Vitamin B3 and B5",
            "Can be rinsed off or removed with a soft cotton cloth"
        ],
        "usage_instructions": "Apply to skin and massage gently. Rinse with water or remove excess with a soft towel.",
        "contraindications": "None.",
        "allergen_flags": ["niacinamide"],
        "alternative_ids": ["cerave-hydrating-facial-cleanser", "la-roche-posay-toleriane-hydrating-cleanser"]
    },
    {
        "id": "la-roche-posay-toleriane-hydrating-cleanser",
        "name": "Toleriane Hydrating Gentle Cleanser",
        "brand": "La Roche-Posay",
        "category": "face_wash",
        "category_name": "Face Wash",
        "price": 1493.17,
        "budget_tier": "mid_range",
        "rating": 4.8,
        "review_count": 9400,
        "volume": "400 ml / 13.5 fl oz",
        "gradient_bg": "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)",
        "tagline": "Prebiotic thermal water cleanser with Ceramide-3 & Niacinamide",
        "description": "Formulated with La Roche-Posay Prebiotic Thermal Water, Ceramide-3, and Niacinamide to preserve the skin's natural protective barrier and microbiome balance.",
        "key_actives": ["Ceramide-3 (Ceramide NP)", "Niacinamide", "Prebiotic Thermal Spring Water", "Glycerin"],
        "full_inci": "Aqua/Water/Eau, Glycerin, Pentaerythrityl Tetraethylhexanoate, Propylene Glycol, Ammonium Polyacryloyldimethyl Taurate, Polysorbate 60, Ceramide NP, Niacinamide, Sodium Chloride, Coco-Betaine, Disodium EDTA, Caprylyl Glycol, Panthenol, Tocopherol.",
        "suitable_skin_types": ["Normal", "Dry", "Sensitive"],
        "target_concerns": ["Barrier Damage", "Dryness", "Sensitivities", "Redness"],
        "texture": "Comforting milky emulsion",
        "finish": "Supple, soft, deeply hydrated",
        "time_of_day": "morning & evening",
        "benefits": [
            "Maintains natural skin pH and preserves the skin microbiome",
            "Non-comedogenic, fragrance-free, sulfate-free and oil-free",
            "Generous size offering exceptional dermatological value"
        ],
        "usage_instructions": "Wet skin with lukewarm water. Pump cleanser into hands and work into a milky lather. Massage gently on face, then rinse thoroughly.",
        "contraindications": "None.",
        "allergen_flags": ["niacinamide"],
        "alternative_ids": ["cerave-hydrating-facial-cleanser", "cetaphil-gentle-skin-cleanser"]
    },

    # ── 2. TONER (Essences & Clarifiers) ──
    {
        "id": "cosrx-propolis-synergy-toner",
        "name": "Full Fit Propolis Synergy Toner",
        "brand": "COSRX",
        "category": "toner",
        "category_name": "Toner",
        "price": 1203.50,
        "budget_tier": "budget",
        "rating": 4.8,
        "review_count": 8700,
        "volume": "150 ml / 5.07 fl oz",
        "gradient_bg": "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
        "tagline": "72.6% Black Bee Propolis Extract & Honey essence toner",
        "description": "Rich nourishing toner containing 72.6% Black Bee Propolis Extract and 10% Honey Extract to boost glow, calm redness, and deliver antibacterial hydration.",
        "key_actives": ["Propolis Extract 72.6%", "Honey Extract 10%", "Sodium Hyaluronate", "Panthenol"],
        "full_inci": "Propolis Extract, Honey Extract, Butylene Glycol, 1,2-Hexanediol, Glycerin, Betaine, Cassia Obtusifolia Seed Extract, Panthenol, Polyglyceryl-10 Laurate, Polyglyceryl-10 Myristate, Ethylhexylglycerin, Sodium Hyaluronate, Hydroxyethylcellulose, Carbomer, Arginine.",
        "suitable_skin_types": ["Dry", "Combination", "Normal", "Sensitive", "Acne-Prone"],
        "target_concerns": ["Dullness", "Dehydration", "Redness", "Acne Scars"],
        "texture": "Viscous, essence-like liquid",
        "finish": "Glass-skin glow, deeply plump",
        "time_of_day": "morning & evening",
        "benefits": [
            "Potent antibacterial and anti-inflammatory propolis accelerates healing",
            "Instantly restores moisture bounce without tackiness",
            "Alcohol-free and suitable for sensitive, inflamed skin"
        ],
        "usage_instructions": "Pour an appropriate amount onto palms or a cotton pad. Gently pat into the face and neck until fully absorbed.",
        "contraindications": "Avoid if allergic to bee venom or honey.",
        "allergen_flags": ["propolis"],
        "alternative_ids": ["klairs-supple-preparation-facial-toner", "anua-heartleaf-77-soothing-toner"]
    },
    {
        "id": "klairs-supple-preparation-facial-toner",
        "name": "Supple Preparation Unscented Toner",
        "brand": "Dear, Klairs",
        "category": "toner",
        "category_name": "Toner",
        "price": 1826.00,
        "budget_tier": "mid_range",
        "rating": 4.9,
        "review_count": 11300,
        "volume": "180 ml / 6.08 fl oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
        "tagline": "Essential oil-free, deep hydration phyto-complex toner",
        "description": "Formulated with Centella Asiatica, Phyto-Oligo, and Hyaluronic Acid, this unscented cult toner calms irritation, regulates pH, and locks in deep epidermal hydration.",
        "key_actives": ["Centella Asiatica Extract", "Sodium Hyaluronate", "Phyto-Oligo", "Licorice Root Extract", "Panthenol"],
        "full_inci": "Water, Butylene Glycol, Dimethyl Sulfone, Betaine, Caprylic/Capric Triglyceride, Natto Gum, Sodium Hyaluronate, Disodium EDTA, Centella Asiatica Extract, Glycyrrhiza Glabra (Licorice) Root Extract, Polyquaternium-51, Chlorphenesin, Tocopheryl Acetate, Carbomer, Panthenol, Arginine, Luffa Cylindrica Fruit/Leaf/Stem Extract, Beta-Glucan, Althaea Rosea Flower Extract, Aloe Barbadensis Leaf Extract, Hydroxyethylcellulose, Portulaca Oleracea Extract, Lysine HCl, Proline, Sodium Ascorbyl Phosphate, Acetyl Methionine, Theanine, Copper Tripeptide-1.",
        "suitable_skin_types": ["Sensitive", "Dry", "Normal", "Combination", "Oily"],
        "target_concerns": ["Sensitivities", "Redness", "Dryness", "Barrier Damage"],
        "texture": "Hydrating, silky slip liquid",
        "finish": "Plump, calm, non-sticky",
        "time_of_day": "morning & evening",
        "benefits": [
            "100% essential oil-free and fragrance-free for zero irritation",
            "Multi-layer hydration with Phyto-Oligo complex",
            "Accelerates barrier recovery after exfoliation"
        ],
        "usage_instructions": "After cleansing, apply toner across face using hands. Layer 2-3 times ('7 skin method') for intense hydration boost.",
        "contraindications": "None.",
        "allergen_flags": [],
        "alternative_ids": ["cosrx-propolis-synergy-toner", "skinceuticals-equalizing-toner"]
    },
    {
        "id": "skinceuticals-equalizing-toner",
        "name": "Equalizing Toner",
        "brand": "SkinCeuticals",
        "category": "toner",
        "category_name": "Toner",
        "price": 3652.00,
        "budget_tier": "luxury",
        "rating": 4.7,
        "review_count": 3100,
        "volume": "200 ml / 6.8 fl oz",
        "gradient_bg": "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
        "tagline": "Clinical botanical PHA/AHA exfoliating & balancing toner",
        "description": "Alcohol-free botanical toner formulated with fruit acid extracts (Glycolic, Citric, Malic, Tartaric) and botanical extracts to gently balance skin pH, decongest pores, and restore clarity.",
        "key_actives": ["Fruit Acid Complex (Glycolic Acid, Citric Acid)", "Witch Hazel Extract", "Thyme & Cucumber Extracts", "Aloe Vera"],
        "full_inci": "Aqua/Water/Eau, Aloe Barbadensis Leaf Juice, Hamamelis Virginiana (Witch Hazel) Water, Vaccinium Myrtillus Fruit Extract, Saccharum Officinarum (Sugarcane) Extract, Citrus Aurantium Dulcis (Orange) Fruit Extract, Citrus Limon (Lemon) Fruit Extract, Acer Saccharum (Sugar Maple) Extract, Thymus Vulgaris (Thyme) Extract, Cucumis Sativus (Cucumber) Fruit Extract, Rosmarinus Officinalis (Rosemary) Leaf Extract, Chamomilla Recutita (Matricaria) Flower Extract, Phenoxyethanol, Sodium Benzoate.",
        "suitable_skin_types": ["Normal", "Combination", "Oily"],
        "target_concerns": ["Large Pores", "Dullness", "Uneven Texture", "Excess Sebum"],
        "texture": "Weightless clarifying liquid",
        "finish": "Refined, matte-radiant, clean",
        "time_of_day": "morning & evening",
        "benefits": [
            "Gentle micro-exfoliation without stinging or drying",
            "Botanical astringents tighten pores and rebalance pH",
            "Prepares skin for optimal absorption of medical-grade antioxidant serums"
        ],
        "usage_instructions": "Moisten a cotton round and smooth over face, neck, and chest. Follow with your antioxidant serum.",
        "contraindications": "Contains gentle fruit acids. Wear SPF daily.",
        "allergen_flags": ["essential oils", "botanical extracts"],
        "alternative_ids": ["klairs-supple-preparation-facial-toner", "cosrx-propolis-synergy-toner"]
    },
    {
        "id": "anua-heartleaf-77-soothing-toner",
        "name": "Heartleaf 77% Soothing Toner",
        "brand": "Anua",
        "category": "toner",
        "category_name": "Toner",
        "price": 1452.50,
        "budget_tier": "mid_range",
        "rating": 4.8,
        "review_count": 9900,
        "volume": "250 ml / 8.45 fl oz",
        "gradient_bg": "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
        "tagline": "77% Houttuynia Cordata extract for acne & redness relief",
        "description": "Formulated with 77% Heartleaf extract harvested from Korea, this hypoallergenic calming toner regulates sebum, soothes inflammatory acne, and prevents irritation.",
        "key_actives": ["Houttuynia Cordata (Heartleaf) Extract 77%", "Centella Asiatica", "Panthenol", "Sugarcane Extract", "Chamomile"],
        "full_inci": "Houttuynia Cordata Extract (77%), Purified Water, 1,2-Hexanediol, Glycerin, Betaine, Panthenol, Saccharum Officinarum (Sugarcane) Extract, Portulaca Oleracea Extract, Butylene Glycol, Vitex Agnus-Castus Extract, Chamomilla Recutita (Matricaria) Flower Extract, Arctium Lappa Root Extract, Phellinus Linteus Extract, Vitis Vinifera (Grape) Fruit Extract, Apple Fruit Extract, Centella Asiatica Extract, Isopentyldiol, Methylpropanediol, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Tromethamine, Disodium EDTA.",
        "suitable_skin_types": ["Sensitive", "Acne-Prone", "Oily", "Combination"],
        "target_concerns": ["Acne", "Redness", "Sensitivities", "Inflammation"],
        "texture": "Lightweight, watery soothing toner",
        "finish": "Calm, fresh, redness-free",
        "time_of_day": "morning & evening",
        "benefits": [
            "Cools down skin temperature and calms red, angry blemishes",
            "Balances sub-surface oil and water moisture levels",
            "Tested non-comedogenic for acne-prone skin"
        ],
        "usage_instructions": "Pat into skin with hands or soak cotton pads and place on irritated cheeks as a 5-minute calming pack.",
        "contraindications": "None.",
        "allergen_flags": [],
        "alternative_ids": ["cosrx-propolis-synergy-toner", "klairs-supple-preparation-facial-toner"]
    },

    # ── 3. SERUM (Targeted Concentrates) ──
    {
        "id": "the-ordinary-niacinamide-10-zinc-1",
        "name": "Niacinamide 10% + Zinc 1%",
        "brand": "The Ordinary",
        "category": "serum",
        "category_name": "Serum",
        "price": 539.50,
        "budget_tier": "budget",
        "rating": 4.6,
        "review_count": 32000,
        "volume": "30 ml / 1.0 fl oz",
        "gradient_bg": "linear-gradient(135deg, #475569 0%, #94a3b8 100%)",
        "tagline": "High-strength sebum-regulating & blemish clarifying serum",
        "description": "A high-concentration vitamin and mineral blemish formula with 10% pure Niacinamide and 1% Zinc PCA to balance visible sebum activity, tighten enlarged pores, and fade post-acne pigmentation.",
        "key_actives": ["Niacinamide (Vitamin B3) 10%", "Zinc PCA 1%", "Tamarindus Indica Seed Gum"],
        "full_inci": "Aqua (Water), Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin.",
        "suitable_skin_types": ["Oily", "Combination", "Acne-Prone", "Normal"],
        "target_concerns": ["Acne", "Large Pores", "Hyperpigmentation", "Excess Sebum"],
        "texture": "Clear, slightly viscous water-based serum",
        "finish": "Matte, clear, oil-controlled",
        "time_of_day": "morning & evening",
        "benefits": [
            "Regulates sebaceous gland hyperactivity and reduces shine",
            "Fades stubborn post-inflammatory hyperpigmentation (PIH)",
            "Unbeatable budget value with clinical purity"
        ],
        "usage_instructions": "Apply a few drops to the entire face in the morning and evening before heavier creams.",
        "contraindications": "Do not mix directly in same step with high-strength L-Ascorbic Acid (Vitamin C).",
        "allergen_flags": ["niacinamide"],
        "alternative_ids": ["beauty-of-joseon-glow-serum-propolis-niacinamide", "skinceuticals-ce-ferulic"]
    },
    {
        "id": "paulas-choice-c15-super-booster",
        "name": "C15 Super Booster (15% Vitamin C)",
        "brand": "Paula's Choice",
        "category": "serum",
        "category_name": "Serum",
        "price": 4565.00,
        "budget_tier": "luxury",
        "rating": 4.8,
        "review_count": 6400,
        "volume": "20 ml / 0.67 fl oz",
        "gradient_bg": "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
        "tagline": "15% Pure L-Ascorbic Acid + Vitamin E + Ferulic Acid antioxidant cocktail",
        "description": "Potent dermatological antioxidant serum with 15% pure Vitamin C, Ferulic Acid, and Ergothioneine to dramatically brighten dark spots, boost collagen synthesis, and neutralize free radical damage.",
        "key_actives": ["L-Ascorbic Acid (Pure Vitamin C) 15%", "Ferulic Acid 0.5%", "Vitamin E (Tocopherol)", "Ergothioneine", "Hyaluronic Acid"],
        "full_inci": "Water (Aqua), Ascorbic Acid, Butylene Glycol, Ethoxydiglycol, Glycerin, PPG-26-Buteth-26, PEG-40 Hydrogenated Castor Oil, Pentylene Glycol, Tocopherol, Sodium Hyaluronate, Hexanoyl Dipeptide-3 Norleucine Acetate, Lecithin, Ferulic Acid, Panthenol, Bisabolol, Ergothioneine, Phenoxyethanol, Ethylhexylglycerin.",
        "suitable_skin_types": ["Normal", "Combination", "Oily", "Dry"],
        "target_concerns": ["Hyperpigmentation", "Dullness", "Aging", "Dark Spots", "Sun Damage"],
        "texture": "Weightless, feather-light liquid",
        "finish": "Instant radiant glow, fast absorbing",
        "time_of_day": "morning",
        "benefits": [
            "Ferulic acid and Vitamin E stabilize Vitamin C to maximize antioxidant photoprotection",
            "Visibly diminishes stubborn UV pigmentation and melasma",
            "Firms skin and reduces fine line depth"
        ],
        "usage_instructions": "Dispense 2-3 drops into palm and apply evenly to face and neck every morning. Always follow with broad-spectrum SPF 30+.",
        "contraindications": "Do not layer directly with Retinoids in the same morning routine.",
        "allergen_flags": ["vitamin c"],
        "alternative_ids": ["skinceuticals-ce-ferulic", "the-ordinary-hyaluronic-acid-2-b5"]
    },
    {
        "id": "skinceuticals-ce-ferulic",
        "name": "C E Ferulic Combination Antioxidant",
        "brand": "SkinCeuticals",
        "category": "serum",
        "category_name": "Serum",
        "price": 4850.00,
        "budget_tier": "luxury",
        "rating": 4.9,
        "review_count": 12800,
        "volume": "30 ml / 1.0 fl oz",
        "gradient_bg": "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
        "tagline": "The patented medical-grade gold standard antioxidant serum",
        "description": "Duke University patented synergy featuring 15% pure L-Ascorbic Acid, 1% Alpha Tocopherol, and 0.5% Ferulic Acid delivering 8x advanced environmental photoprotection.",
        "key_actives": ["L-Ascorbic Acid 15%", "Alpha Tocopherol 1%", "Ferulic Acid 0.5%", "Hyaluronic Acid"],
        "full_inci": "Aqua/Water/Eau, Dipropylene Glycol, Ascorbic Acid, Glycerin, Laureth-23, Phenoxyethanol, Tocopherol, Ferulic Acid, Sodium Hyaluronate.",
        "suitable_skin_types": ["Dry", "Normal", "Combination", "Aging"],
        "target_concerns": ["Aging", "Hyperpigmentation", "Dullness", "Sun Damage", "Loss of Firmness"],
        "texture": "Aqueous clinical elixir",
        "finish": "Luminous, protective shield",
        "time_of_day": "morning",
        "benefits": [
            "Reduces combined oxidative damage by up to 41%",
            "Improves firmness, wrinkles, and brightens complexion",
            "Remains effective on skin for a minimum of 72 hours once absorbed"
        ],
        "usage_instructions": "In the morning after cleansing, apply 4-5 drops to a dry face, neck, and chest before other anti-aging skincare products.",
        "contraindications": "May cause tingling on compromised skin barriers. Store in dark cool area.",
        "allergen_flags": ["vitamin c"],
        "alternative_ids": ["paulas-choice-c15-super-booster", "the-ordinary-niacinamide-10-zinc-1"]
    },
    {
        "id": "the-ordinary-hyaluronic-acid-2-b5",
        "name": "Hyaluronic Acid 2% + B5",
        "brand": "The Ordinary",
        "category": "serum",
        "category_name": "Serum",
        "price": 738.70,
        "budget_tier": "budget",
        "rating": 4.7,
        "review_count": 28500,
        "volume": "30 ml / 1.0 fl oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
        "tagline": "Multi-molecular weight hydration with Provitamin B5",
        "description": "Combines low, medium, and high molecular weight hyaluronic acid with a next-generation HA crosspolymer at a combined concentration of 2% for multi-depth hydration and surface plumping.",
        "key_actives": ["Sodium Hyaluronate (Multi-MW)", "Sodium Hyaluronate Crosspolymer", "Panthenol (Vitamin B5)", "Ahnfeltia Concinna Extract"],
        "full_inci": "Aqua (Water), Sodium Hyaluronate, Pentylene Glycol, Propanediol, Sodium Hyaluronate Crosspolymer, Panthenol, Ahnfeltia Concinna Extract, Glycerin, Trisodium Ethylenediamine Disuccinate, Citric Acid, Isoceteth-20, Ethoxydiglycol, Ethylhexylglycerin, Hexylene Glycol, 1,2-Hexanediol, Caprylyl Glycol, Phenoxyethanol.",
        "suitable_skin_types": ["Dry", "Dehydrated", "Sensitive", "Combination", "Oily", "Normal"],
        "target_concerns": ["Dryness", "Dehydration", "Fine Lines", "Barrier Damage"],
        "texture": "Clear, plush quenching gel serum",
        "finish": "Bouncy, plump, dewy",
        "time_of_day": "morning & evening",
        "benefits": [
            "Delivers multi-depth hydration across epidermis layers",
            "Panthenol enhances surface hydration and repairs barrier",
            "Safe to pair with any active ingredient in any routine"
        ],
        "usage_instructions": "Apply a few drops to damp face morning and night before moisturizers to seal in hydration.",
        "contraindications": "None.",
        "allergen_flags": [],
        "alternative_ids": ["beauty-of-joseon-glow-serum-propolis-niacinamide", "the-ordinary-niacinamide-10-zinc-1"]
    },
    {
        "id": "beauty-of-joseon-glow-serum-propolis-niacinamide",
        "name": "Glow Serum: Propolis + Niacinamide",
        "brand": "Beauty of Joseon",
        "category": "serum",
        "category_name": "Serum",
        "price": 1411.00,
        "budget_tier": "mid_range",
        "rating": 4.9,
        "review_count": 16400,
        "volume": "30 ml / 1.01 fl oz",
        "gradient_bg": "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
        "tagline": "60% Hanbang Propolis & 2% Niacinamide honey glow serum",
        "description": "Inspired by traditional Korean Hanbang medicine, this honey-like serum calms acne-prone and inflamed skin with 60% Propolis Extract and 2% Niacinamide to refine pores and impart a glass-skin honey glow.",
        "key_actives": ["Propolis Extract 60%", "Niacinamide 2%", "Tamanu Oil", "Betaine Salicylate 0.5%", "Lotus Coriculatus Seed Extract"],
        "full_inci": "Propolis Extract, Dipropylene Glycol, Glycerin, Butylene Glycol, Water, Niacinamide, 1,2-Hexanediol, Melia Azadirachta Flower Extract, Melia Azadirachta Leaf Extract, Sodium Hyaluronate, Curcuma Longa (Turmeric) Root Extract, Ocimum Sanctum Leaf Extract, Theobroma Cacao (Cocoa) Seed Extract, Melaleuca Alternifolia (Tea Tree) Extract, Centella Asiatica Extract, Corallina Officinalis Extract, Lotus Corniculatus Seed Extract, Calophyllum Inophyllum Seed Oil, Betaine Salicylate, Sodium Polyacryloyldimethyl Taurate, Tromethamine, Polyglyceryl-10 Laurate, Caprylyl Glycol, Ethylhexylglycerin, Dextrin, Pentylene Glycol, Octanediol, Tocopherol, Xanthan Gum, Carbomer.",
        "suitable_skin_types": ["Acne-Prone", "Combination", "Sensitive", "Oily", "Dry"],
        "target_concerns": ["Acne", "Large Pores", "Redness", "Dullness"],
        "texture": "Silky, honey-like viscous fluid",
        "finish": "Dewy, glass-skin glow",
        "time_of_day": "morning & evening",
        "benefits": [
            "Propolis delivers natural antibacterial protection against breakout bacteria",
            "Niacinamide and Betaine Salicylate regulate pore sebum",
            "Non-sticky finish leaves skin radiant and calmed"
        ],
        "usage_instructions": "Apply 2-3 drops onto face and gently pat to aid absorption.",
        "contraindications": "Avoid if allergic to propolis or bee products.",
        "allergen_flags": ["propolis", "niacinamide"],
        "alternative_ids": ["the-ordinary-niacinamide-10-zinc-1", "paulas-choice-c15-super-booster"]
    },

    # ── 4. MOISTURIZER (Creams, Lotions & Gels) ──
    {
        "id": "cerave-moisturizing-cream",
        "name": "Moisturizing Cream (Barrier Repair)",
        "brand": "CeraVe",
        "category": "moisturizer",
        "category_name": "Moisturizer",
        "price": 1327.17,
        "budget_tier": "mid_range",
        "rating": 4.9,
        "review_count": 45000,
        "volume": "453 g / 16 oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        "tagline": "3 Essential Ceramides, Hyaluronic Acid & MVE 24-hr barrier repair",
        "description": "Rich, non-greasy barrier cream formulated with 3 essential ceramides and hyaluronic acid to lock in moisture, repair cracked lipid layers, and provide 24-hour hydration.",
        "key_actives": ["Ceramide NP", "Ceramide AP", "Ceramide EOP", "Hyaluronic Acid", "Cholesterol", "Phytosphingosine"],
        "full_inci": "Aqua/Water/Eau, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Cetyl Alcohol, Ceteareth-20, Petrolatum, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Dimethicone, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium EDTA, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin.",
        "suitable_skin_types": ["Dry", "Very Dry", "Sensitive", "Compromised Barrier", "Normal"],
        "target_concerns": ["Dryness", "Barrier Damage", "Flaking", "Redness"],
        "texture": "Rich, cushiony barrier cream",
        "finish": "Velvety, protective, non-greasy",
        "time_of_day": "morning & evening",
        "benefits": [
            "MVE Delivery Technology releases moisturizing ingredients over 24 hours",
            "Replenishes cellular lipid matrix to stop transepidermal water loss",
            "Fragrance-free, allergy-tested, non-comedogenic"
        ],
        "usage_instructions": "Apply liberally to face and neck as often as needed, or after applying treatment serums.",
        "contraindications": "May feel heavy on very oily skin in high humidity.",
        "allergen_flags": [],
        "alternative_ids": ["the-ordinary-natural-moisturizing-factors-ha", "la-roche-posay-cicaplast-baume-b5"]
    },
    {
        "id": "the-ordinary-natural-moisturizing-factors-ha",
        "name": "Natural Moisturizing Factors + HA",
        "brand": "The Ordinary",
        "category": "moisturizer",
        "category_name": "Moisturizer",
        "price": 639.10,
        "budget_tier": "budget",
        "rating": 4.6,
        "review_count": 21000,
        "volume": "100 ml / 3.3 fl oz",
        "gradient_bg": "linear-gradient(135deg, #64748b 0%, #cbd5e1 100%)",
        "tagline": "Surface hydration formula with 11 Amino Acids, Lipids & HA",
        "description": "Delivers non-greasy hydration that acts as a direct topical supplement of Natural Moisturizing Factor components (amino acids, fatty acids, ceramides, hyaluronic acid).",
        "key_actives": ["11 Amino Acids", "Phospholipids", "Ceramides", "Hyaluronic Acid", "Urea", "Glycerin"],
        "full_inci": "Aqua (Water), Caprylic/Capric Triglyceride, Cetyl Alcohol, Propanediol, Stearyl Alcohol, Glycerin, Sodium Hyaluronate, Arginine, Aspartic Acid, Glycine, Alanine, Serine, Valine, Isoleucine, Proline, Threonine, Histidine, Phenylalanine, Glucose, Maltose, Fructose, Trehalose, Sodium PCA, PCA, Sodium Lactate, Urea, Allantoin, Linoleic Acid, Oleic Acid, Phytosteryl Canola Glycerides, Palmitic Acid, Stearic Acid, Lecithin, Triolein, Tocopherol, Carbomer, Isoceteth-20, Polysorbate 60, Sodium Chloride, Citric Acid, Trisodium Ethylenediamine Disuccinate, Pentylene Glycol, Triethanolamine, Phenoxyethanol, Chlorphenesin.",
        "suitable_skin_types": ["Normal", "Combination", "Oily", "Dry", "Sensitive"],
        "target_concerns": ["Dehydration", "Dryness", "Barrier Damage"],
        "texture": "Lightweight, matte-comfort cream",
        "finish": "Natural matte, zero shine",
        "time_of_day": "morning & evening",
        "benefits": [
            "Replicates the skin's natural moisturizing factors",
            "Non-greasy, non-comedogenic and fast absorbing",
            "Superb baseline daily moisturizer for all budgets"
        ],
        "usage_instructions": "Apply after serums as needed for effective surface hydration.",
        "contraindications": "None.",
        "allergen_flags": [],
        "alternative_ids": ["cerave-moisturizing-cream", "neutrogena-hydro-boost-water-gel"]
    },
    {
        "id": "neutrogena-hydro-boost-water-gel",
        "name": "Hydro Boost Water Gel",
        "brand": "Neutrogena",
        "category": "moisturizer",
        "category_name": "Moisturizer",
        "price": 1659.17,
        "budget_tier": "mid_range",
        "rating": 4.7,
        "review_count": 36000,
        "volume": "50 g / 1.7 oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
        "tagline": "Oil-free Hyaluronic Acid & Trehalose ultra-quenching gel",
        "description": "Award-winning water gel with purified Hyaluronic Acid and botanical Trehalose that absorbs instantly to quench dehydrated skin and lock in moisture for 48 hours without oiliness.",
        "key_actives": ["Purified Hyaluronic Acid", "Trehalose", "Dimethicone", "Glycerin"],
        "full_inci": "Water, Dimethicone, Glycerin, Dimethicone/Vinyl Dimethicone Crosspolymer, Phenoxyethanol, Polyacrylamide, Cetearyl Olivate, Sorbitan Olivate, Dimethiconol, C13-14 Isoparaffin, Dimethicone Crosspolymer, Chlorphenesin, Carbomer, Sodium Hyaluronate, Ethylhexylglycerin, Fragrance, C9-11 Pareth-6, Sodium Hydroxide, Blue 1.",
        "suitable_skin_types": ["Oily", "Combination", "Dehydrated", "Normal"],
        "target_concerns": ["Dehydration", "Excess Sebum", "Large Pores"],
        "texture": "Cooling, ultra-refreshing water gel",
        "finish": "Weightless, hydrated, smooth",
        "time_of_day": "morning & evening",
        "benefits": [
            "Absorbs in seconds with zero greasy residue",
            "Instantly plumps dehydration lines",
            "Ideal summer moisturizer and under-makeup primer"
        ],
        "usage_instructions": "Apply evenly to cleansed face and neck daily, alone or under makeup.",
        "contraindications": "Contains light fragrance. Sensitive skin can opt for the fragrance-free Gel-Cream edition.",
        "allergen_flags": ["fragrance"],
        "alternative_ids": ["the-ordinary-natural-moisturizing-factors-ha", "augustinus-bader-the-rich-cream"]
    },
    {
        "id": "augustinus-bader-the-rich-cream",
        "name": "The Rich Cream (TFC8 Cellular Renewal)",
        "brand": "Augustinus Bader",
        "category": "moisturizer",
        "category_name": "Moisturizer",
        "price": 5000.00,
        "budget_tier": "luxury",
        "rating": 4.9,
        "review_count": 4800,
        "volume": "50 ml / 1.7 fl oz",
        "gradient_bg": "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
        "tagline": "Epigenetic TFC8 cellular renewal & anti-aging lipid matrix",
        "description": "Powered by 30+ years of stem cell research and patented TFC8 (Trigger Factor Complex), this luxury anti-aging cream guides key nutrients and natural ingredients to skin cells to dramatically rejuvenate skin elasticity, reduce deep wrinkles, and heal barrier damage.",
        "key_actives": ["TFC8 (Trigger Factor Complex)", "Evening Primrose Oil", "Hyaluronic Acid", "Hydrolyzed Rice Protein", "Argan Oil", "Vitamin E"],
        "full_inci": "Aqua/Water/Eau, Helianthus Annuus (Sunflower) Seed Oil, Pentylene Glycol, Squalane, Octyldodecanol, Argania Spinosa Kernel Oil, Ethylhexyl Stearate, Persea Gratissima (Avocado) Oil, Polyglyceryl-3 Polyricinoleate, Sorbitan Oleate, Butyrospermum Parkii (Shea) Butter, Sorbitol, Oenothera Biennis (Evening Primrose) Oil, Tocopheryl Acetate, TFC-8, Sodium Hyaluronate, Hydrolyzed Rice Protein, Brassica Alba Seed Extract, Camellia Sinensis Leaf Extract, Hydrogenated Castor Oil, Cera Alba/Beeswax/Cire d'abeille, Dextrin Palmitate, Magnesium Sulfate, Zinc PCA, Phenoxyethanol, Sodium Hydroxide.",
        "suitable_skin_types": ["Dry", "Mature", "Aging", "Normal"],
        "target_concerns": ["Aging", "Deep Wrinkles", "Loss of Firmness", "Dryness", "Barrier Damage"],
        "texture": "Decadent, deeply nourishing rich cream",
        "finish": "Plump, luminous, ultra-youthful",
        "time_of_day": "morning & evening",
        "benefits": [
            "TFC8 triggers cellular turnover and matrix self-repair",
            "Clinically proven to reduce fine lines and hyperpigmentation in 4 weeks",
            "Formulated without fragrance, parabens, or mineral oils"
        ],
        "usage_instructions": "Massage 2 pumps across face, neck, and décolleté in upward sweeping motions.",
        "contraindications": "Heavy lipid profile not recommended for active cystic acne.",
        "allergen_flags": [],
        "alternative_ids": ["cerave-moisturizing-cream", "the-ordinary-natural-moisturizing-factors-ha"]
    },

    # ── 5. SUNSCREEN (Photoprotection) ──
    {
        "id": "beauty-of-joseon-relief-sun-rice-probiotics",
        "name": "Relief Sun: Rice + Probiotics (SPF 50+ PA++++)",
        "brand": "Beauty of Joseon",
        "category": "sunscreen",
        "category_name": "Sunscreen",
        "price": 1328.00,
        "budget_tier": "mid_range",
        "rating": 4.9,
        "review_count": 38000,
        "volume": "50 ml / 1.69 fl oz",
        "gradient_bg": "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
        "tagline": "30% Rice Extract & Grain Probiotics organic chemical sunscreen",
        "description": "Globally viral Korean sunscreen featuring 30% Rice Extract and Grain Fermented Extracts that applies like a light moisturizing lotion with zero white cast, zero stickiness, and radiant SPF 50+ PA++++ protection.",
        "key_actives": ["Rice Extract 30%", "Grain Ferment Probiotics", "Niacinamide 2%", "Modern Chemical UV Filters (Uvinul A Plus, Tinosorb S)"],
        "full_inci": "Water, Oryza Sativa (Rice) Extract (30%), Dibutyl Adipate, Propanediol, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Polymethylsilsesquioxane, Ethylhexyl Triazone, Methylene Bis-Benzotriazolyl Tetramethylbutylphenol, Niacinamide, Coco-Caprylate/Caprate, Caprylyl Methicone, Diethylhexyl Butamido Triazone, Glycerin, Butylene Glycol, Oryza Sativa (Rice) Germ Extract, Camellia Sinensis Leaf Extract, Lactobacillus/Rice Ferment, Aspergillus Ferment, Saccharomyces/Rice Ferment Filtrate, Saccharum Officinarum (Sugarcane) Extract, Centella Asiatica Extract, Tocopherol, Adenosine.",
        "suitable_skin_types": ["Normal", "Dry", "Combination", "Sensitive"],
        "target_concerns": ["Sun Damage", "Hyperpigmentation", "Dullness", "Aging"],
        "texture": "Moisturizing serum-lotion",
        "finish": "Dewy, glass-skin, transparent (zero white cast)",
        "time_of_day": "morning",
        "benefits": [
            "Broad spectrum SPF 50+ PA++++ tested in Korean and Spanish labs",
            "Zero white cast on all Fitzpatrick skin types (I - VI)",
            "Nourishes skin with rice bio-ferments while protecting against photoaging"
        ],
        "usage_instructions": "Apply generously 15 minutes before sun exposure (two finger lengths for face and neck). Reapply every 2 hours.",
        "contraindications": "None.",
        "allergen_flags": ["niacinamide"],
        "alternative_ids": ["eltamd-uv-clear-broad-spectrum-spf-46", "skin-aqua-super-moisture-gel-spf-50"]
    },
    {
        "id": "eltamd-uv-clear-broad-spectrum-spf-46",
        "name": "UV Clear Broad-Spectrum SPF 46",
        "brand": "EltaMD",
        "category": "sunscreen",
        "category_name": "Sunscreen",
        "price": 3403.00,
        "budget_tier": "luxury",
        "rating": 4.9,
        "review_count": 24000,
        "volume": "48 g / 1.7 oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        "tagline": "Dermatologist #1 choice for acne, rosacea & hyperpigmentation",
        "description": "Oil-free mineral & chemical hybrid sunscreen formulated with 9.0% transparent Zinc Oxide, 5% Niacinamide, and Hyaluronic Acid to calm acne, reduce redness, and guard against UVA/UVB rays.",
        "key_actives": ["Zinc Oxide 9.0%", "Niacinamide 5%", "Hyaluronic Acid", "Tocopheryl Acetate", "Octinoxate 7.5%"],
        "full_inci": "Active: Zinc Oxide 9.0%, Octinoxate 7.5%. Inactive: Purified Water, Cyclopentasiloxane, Niacinamide, Octyldodecyl Neopentanoate, Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer, Polyisobutene, PEG-7 Trimethylolpropane Coconut Ether, Sodium Hyaluronate, Tocopheryl Acetate, Lactic Acid, Oleth-3 Phosphate, Phenoxyethanol, Butylene Glycol, Iodopropynyl Butylcarbamate, Triethoxycaprylylsilane.",
        "suitable_skin_types": ["Acne-Prone", "Sensitive", "Rosacea", "Oily", "Combination"],
        "target_concerns": ["Acne", "Redness", "Hyperpigmentation", "Sun Damage", "Large Pores"],
        "texture": "Weightless, silky fluid lotion",
        "finish": "Invisible, calm, semi-matte",
        "time_of_day": "morning",
        "benefits": [
            "Zinc oxide calms inflammation and soothes rosacea/erythema",
            "5% Niacinamide clears blemish marks while protecting skin",
            "100% oil-free, non-comedogenic, fragrance-free"
        ],
        "usage_instructions": "Apply liberally to face and neck 15 minutes before sun exposure. Reapply at least every 2 hours.",
        "contraindications": "Contains Octinoxate (chemical filter).",
        "allergen_flags": ["niacinamide"],
        "alternative_ids": ["beauty-of-joseon-relief-sun-rice-probiotics", "supergoop-unseen-sunscreen-spf-40"]
    },
    {
        "id": "supergoop-unseen-sunscreen-spf-40",
        "name": "Unseen Sunscreen SPF 40",
        "brand": "Supergoop!",
        "category": "sunscreen",
        "category_name": "Sunscreen",
        "price": 3154.00,
        "budget_tier": "luxury",
        "rating": 4.8,
        "review_count": 17800,
        "volume": "50 ml / 1.7 fl oz",
        "gradient_bg": "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        "tagline": "100% Invisible, weightless, oil-free primer sunscreen",
        "description": "Totally invisible, weightless, scentless formula with a velvety primer finish that grips makeup while providing broad-spectrum chemical SPF 40 and blue light filtration.",
        "key_actives": ["Avobenzone 3%", "Homosalate 8%", "Octisalate 5%", "Octocrylene 4%", "Red Algae", "Meadowfoam Seed Complex"],
        "full_inci": "Active: Avobenzone 3%, Homosalate 8%, Octisalate 5%, Octocrylene 4%. Inactive: Isododecane, Dimethicone Crosspolymer, Dimethicone/Bis-Isobutyl PPG-20 Crosspolymer, Polymethylsilsesquioxane, Silica, Isoamyl p-Methoxycinnamate, Butyloctyl Salicylate, C12-15 Alkyl Benzoate, Dimethicone, Dicaprylyl Carbonate, Caprylic/Capric Triglyceride, Mauritia Flexuosa Fruit Oil, Limnanthes Alba (Meadowfoam) Seed Oil, Helianthus Annuus (Sunflower) Seed Oil, Tocopherol, Shea Butter Ethyl Esters.",
        "suitable_skin_types": ["Oily", "Combination", "Normal", "Dark Skin Tones"],
        "target_concerns": ["Excess Sebum", "Large Pores", "Sun Damage", "Dullness"],
        "texture": "Velvety, clear silicone gel",
        "finish": "Natural matte, gripping primer finish",
        "time_of_day": "morning",
        "benefits": [
            "100% invisible on all skin tones with zero cast or flashback",
            "Filters blue light from digital screens and UV radiation",
            "Controls shine and acts as the perfect makeup primer"
        ],
        "usage_instructions": "Apply a nickel-sized amount as the last step in your skincare routine and before makeup.",
        "contraindications": "Avoid if sensitive to chemical sunscreen filters or silicone textures.",
        "allergen_flags": [],
        "alternative_ids": ["beauty-of-joseon-relief-sun-rice-probiotics", "eltamd-uv-clear-broad-spectrum-spf-46"]
    },
    {
        "id": "skin-aqua-super-moisture-gel-spf-50",
        "name": "Super Moisture Gel (SPF 50+ PA++++)",
        "brand": "Rohto Mentholatum Skin Aqua",
        "category": "sunscreen",
        "category_name": "Sunscreen",
        "price": 954.50,
        "budget_tier": "budget",
        "rating": 4.8,
        "review_count": 15600,
        "volume": "110 g / 3.8 oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
        "tagline": "Japanese water-light gel with 2 types of Hyaluronic Acid",
        "description": "Ultra-lightweight Japanese water-based sunscreen with encapsulated UV filters, 2 types of Hyaluronic Acid, Collagen, and Amino Acids for invisible, sweat-resistant daily defense.",
        "key_actives": ["Super Hyaluronic Acid", "Sodium Hyaluronate", "Hydrolyzed Collagen", "Amino Acids", "Modern UV Filters"],
        "full_inci": "Water, Alcohol, Ethylhexyl Methoxycinnamate, Dipropylene Glycol, Glycerin, Glycol Dimethacrylate Crosspolymer, Butylene Glycol, Sodium Hyaluronate, Sodium Acetylated Hyaluronate, Hydrolyzed Collagen, Arginine, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Ethylhexyl Triazone, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, TEA, Bis-PEG-18 Methyl Ether Dimethyl Silane, Polystyrene, Disodium EDTA, Xanthan Gum, Polyvinyl Alcohol, Methylparaben.",
        "suitable_skin_types": ["Oily", "Combination", "Normal"],
        "target_concerns": ["Sun Damage", "Excess Sebum", "Dehydration"],
        "texture": "Water-burst cooling gel",
        "finish": "Invisible, weightless, zero residue",
        "time_of_day": "morning",
        "benefits": [
            "Water-light texture vanishes on skin in seconds",
            "Resistant to water and sweat (80 minutes)",
            "Huge 110g bottle offering maximum budget value"
        ],
        "usage_instructions": "Smooth liberally over face and body before sun exposure. Reapply frequently.",
        "contraindications": "Contains cosmetic alcohol for fast dry-down. Very dry skin may prefer cream sunscreens.",
        "allergen_flags": [],
        "alternative_ids": ["beauty-of-joseon-relief-sun-rice-probiotics", "eltamd-uv-clear-broad-spectrum-spf-46"]
    },

    # ── 6. TREATMENT PRODUCTS (Clinical Actives & Balms) ──
    {
        "id": "the-ordinary-azelaic-acid-suspension-10",
        "name": "Azelaic Acid Suspension 10%",
        "brand": "The Ordinary",
        "category": "treatment_products",
        "category_name": "Treatment Products",
        "price": 921.30,
        "budget_tier": "budget",
        "rating": 4.6,
        "review_count": 19400,
        "volume": "30 ml / 1.0 fl oz",
        "gradient_bg": "linear-gradient(135deg, #be123c 0%, #fb7185 100%)",
        "tagline": "Multi-functional brightening, redness & anti-blemish cream-gel",
        "description": "Formulated with 10% high-purity Azelaic Acid to brighten skin tone, visibly improve skin texture evenness, calm rosacea-related erythema, and suppress acne-causing bacteria.",
        "key_actives": ["Azelaic Acid 10%", "Vitamin E", "Dimethicone"],
        "full_inci": "Aqua (Water), Isodecyl Neopentanoate, Dimethicone, Azelaic Acid, Dimethicone/Bis-Isobutyl PPG-20 Crosspolymer, Dimethyl Isosorbide, Cetearyl Alcohol, Glyceryl Stearate, PEG-100 Stearate, Ceteareth-20, Polysilicone-11, Tocopherol, Trisodium Ethylenediamine Disuccinate, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin.",
        "suitable_skin_types": ["Acne-Prone", "Rosacea", "Sensitive", "Combination", "Oily", "Normal"],
        "target_concerns": ["Redness", "Rosacea", "Acne", "Hyperpigmentation", "Uneven Texture"],
        "texture": "Silky cream-gel suspension",
        "finish": "Soft-focus semi-matte",
        "time_of_day": "morning & evening",
        "benefits": [
            "Inhibits tyrosinase to clear post-inflammatory erythema (PIE) and dark spots",
            "Dermatologist-acclaimed for calming rosacea flare-ups",
            "Gentle antibacterial action without bacterial resistance"
        ],
        "usage_instructions": "Apply to face AM and/or PM to improve visible brightness and skin texture. Avoid contact with eyes and mouth.",
        "contraindications": "May cause mild initial tingling in the first week. Use SPF in the morning.",
        "allergen_flags": ["azelaic acid"],
        "alternative_ids": ["paulas-choice-skin-perfecting-2-bha-liquid", "la-roche-posay-cicaplast-baume-b5"]
    },
    {
        "id": "paulas-choice-skin-perfecting-2-bha-liquid",
        "name": "Skin Perfecting 2% BHA Liquid Exfoliant",
        "brand": "Paula's Choice",
        "category": "treatment_products",
        "category_name": "Treatment Products",
        "price": 2905.00,
        "budget_tier": "luxury",
        "rating": 4.9,
        "review_count": 52000,
        "volume": "118 ml / 4.0 fl oz",
        "gradient_bg": "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        "tagline": "The #1 award-winning Salicylic Acid pore unclogging liquid",
        "description": "Clinically proven leave-on exfoliant with 2% Salicylic Acid and Green Tea that penetrates deep into pore linings to dissolve trapped sebum, clear blackheads, and shed dead skin layers.",
        "key_actives": ["Salicylic Acid (BHA) 2%", "Green Tea (Camellia Oleifera) Extract", "Methylpropanediol"],
        "full_inci": "Water (Aqua), Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera (Green Tea) Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA.",
        "suitable_skin_types": ["Oily", "Combination", "Acne-Prone", "Normal"],
        "target_concerns": ["Acne", "Large Pores", "Blackheads", "Uneven Texture", "Dullness"],
        "texture": "Weightless, fast-absorbing clear liquid",
        "finish": "Smooth, refined, glowing",
        "time_of_day": "evening (2-3x / week or daily)",
        "benefits": [
            "Clears stubborn blackheads and shrinks enlarged pore appearance",
            "Green tea antioxidants calm redness and reduce blemish inflammation",
            "Enhances skin turnover to reveal radiant, smooth skin"
        ],
        "usage_instructions": "Apply once or twice daily after cleansing and toning. Lightly soak a cotton pad or apply with fingers over face. Do not rinse.",
        "contraindications": "Contains Salicylic Acid (BHA). Avoid if allergic to aspirin. Always wear SPF.",
        "allergen_flags": ["salicylic acid"],
        "alternative_ids": ["the-ordinary-azelaic-acid-suspension-10", "the-ordinary-aha-30-bha-2-peeling-solution"]
    },
    {
        "id": "la-roche-posay-cicaplast-baume-b5",
        "name": "Cicaplast Baume B5+ Soothing Barrier Balm",
        "brand": "La Roche-Posay",
        "category": "treatment_products",
        "category_name": "Treatment Products",
        "price": 1410.17,
        "budget_tier": "mid_range",
        "rating": 4.9,
        "review_count": 31000,
        "volume": "40 ml / 1.35 fl oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
        "tagline": "Tribioma, 5% Panthenol & Madecassoside intensive barrier rescue",
        "description": "Multi-purpose emergency soothing balm with Madecassoside, 5% Panthenol (Vitamin B5), and prebiotic Tribioma to immediately relieve compromised skin barriers, post-procedure irritation, and intense flaking.",
        "key_actives": ["Panthenol (Vitamin B5) 5%", "Madecassoside (Centella Asiatica)", "Tribioma Prebiotic Complex", "Copper-Zinc-Manganese Mineral Complex", "Shea Butter"],
        "full_inci": "Aqua/Water/Eau, Hydrogenated Polyisobutene, Dimethicone, Glycerin, Butyrospermum Parkii (Shea) Butter, Panthenol, Zea Mays Starch/Corn Starch, Propanediol, Butylene Glycol, Cetyl PEG/PPG-10/1 Dimethicone, Trihydroxystearin, Centella Asiatica Leaf Extract, Polymnia Sonchifolia Root Juice, Zinc Gluconate, Madecassoside, Manganese Gluconate, Alpha-Glucan Oligosaccharide, Silica, Aluminum Hydroxide, Magnesium Sulfate, Mannose, Capryloyl Glycine, Caprylyl Glycol, Vitreoscilla Ferment, Citric Acid, Trisodium Ethylenediamine Disuccinate, Lactobacillus, Acetylated Glycol Stearate, Tocopherol.",
        "suitable_skin_types": ["Sensitive", "Compromised Barrier", "Dry", "All Skin Types (for emergency spot treatment)"],
        "target_concerns": ["Barrier Damage", "Redness", "Flaking", "Sensitivities", "Post-Treatment"],
        "texture": "Rich, comforting, protective barrier balm",
        "finish": "Protective, calming moisture seal",
        "time_of_day": "morning & evening",
        "benefits": [
            "Accelerates epidermal repair by up to 2x",
            "Immediate soothing relief for burns, retinoid irritation, and dry patches",
            "100% fragrance-free, hypoallergenic, pediatric tested"
        ],
        "usage_instructions": "Apply twice daily to pre-washed and dried skin. Can be applied in a generous layer ('slugging') over irritated areas.",
        "contraindications": "Rich shea butter base may be too heavy for full-face application on very oily skin.",
        "allergen_flags": [],
        "alternative_ids": ["cerave-moisturizing-cream", "the-ordinary-azelaic-acid-suspension-10"]
    },
    {
        "id": "the-ordinary-aha-30-bha-2-peeling-solution",
        "name": "AHA 30% + BHA 2% Peeling Solution",
        "brand": "The Ordinary",
        "category": "treatment_products",
        "category_name": "Treatment Products",
        "price": 788.50,
        "budget_tier": "budget",
        "rating": 4.7,
        "review_count": 48000,
        "volume": "30 ml / 1.0 fl oz",
        "gradient_bg": "linear-gradient(135deg, #881337 0%, #e11d48 100%)",
        "tagline": "10-minute weekly clinical chemical peel for deep exfoliation",
        "description": "High-strength exfoliating treatment with 30% Alpha Hydroxy Acids (Glycolic, Lactic, Tartaric, Citric) and 2% Beta Hydroxy Acid with Tasmanian Pepperberry to dramatically smooth skin texture and clear pore congestion.",
        "key_actives": ["Glycolic Acid", "Lactic Acid", "Salicylic Acid 2%", "Tasmanian Pepperberry", "Hyaluronic Acid Crosspolymer"],
        "full_inci": "Glycolic Acid, Aqua (Water), Aloe Barbadensis Leaf Water, Sodium Hydroxide, Daucus Carota Sativa Extract, Propanediol, Cocamidopropyl Dimethylamine, Salicylic Acid, Lactic Acid, Tartaric Acid, Citric Acid, Panthenol, Sodium Hyaluronate Crosspolymer, Tasmannia Lanceolata Fruit/Leaf Extract, Glycerin, Pentylene Glycol, Xanthan Gum, Polysorbate 20, Trisodium Ethylenediamine Disuccinate, Potassium Sorbate, Sodium Benzoate, Ethylhexylglycerin, 1,2-Hexanediol, Caprylyl Glycol.",
        "suitable_skin_types": ["Resilient", "Oily", "Combination", "Experienced Acid Users"],
        "target_concerns": ["Uneven Texture", "Dullness", "Hyperpigmentation", "Acne Scars"],
        "texture": "Deep red liquid peel",
        "finish": "Smooth, glass-skin, renewed",
        "time_of_day": "evening (1x / week max)",
        "benefits": [
            "Professional-strength chemical peel for at-home use",
            "Tasmanian Pepperberry reduces irritation associated with high acid use",
            "Eliminates rough dead skin cells in 10 minutes"
        ],
        "usage_instructions": "Apply evenly across dry face after cleansing. Leave on for no more than 10 minutes. Rinse thoroughly with lukewarm water. Use maximum once per week.",
        "contraindications": "DO NOT use on sensitive, peeling, or compromised skin. Not for beginners. Requires strict daily SPF.",
        "allergen_flags": ["salicylic acid", "glycolic acid"],
        "alternative_ids": ["paulas-choice-skin-perfecting-2-bha-liquid", "the-ordinary-azelaic-acid-suspension-10"]
    },

    # ── 7. FACE MASKS (Detox, Hydration & Soothing) ──
    {
        "id": "innisfree-super-volcanic-pore-clay-mask",
        "name": "Super Volcanic Pore Clay Mask 2X",
        "brand": "Innisfree",
        "category": "face_masks",
        "category_name": "Face Masks",
        "price": 1328.00,
        "budget_tier": "mid_range",
        "rating": 4.8,
        "review_count": 14500,
        "volume": "100 ml / 3.38 fl oz",
        "gradient_bg": "linear-gradient(135deg, #44403c 0%, #78716c 100%)",
        "tagline": "Jeju Volcanic Clusters & AHA deep pore detoxifying clay mask",
        "description": "Formulated with Jeju Volcanic Clusters and AHA, this multi-action clay mask absorbs 98% excess sebum, deep cleanses pores, exfoliates dead skin, and cools skin on contact.",
        "key_actives": ["Jeju Volcanic Clusters (Volcanic Ash)", "Kaolin & Bentonite Clay", "Lactic Acid (AHA)", "Walnut Shell Powder", "Trehalose"],
        "full_inci": "Water/Aqua/Eau, Butylene Glycol, Titanium Dioxide (CI 77891), Silica, Glycerin, Caprylic/Capric Triglyceride, Trehalose, Volcanic Ash (Jeju), Cetearyl Alcohol, Stearic Acid, Glyceryl Stearate, Bentonite, Zinc Oxide, Polysorbate 60, Camellia Sinensis Leaf Extract, Citrus Unshiu Peel Extract, Opuntia Coccinellifera Fruit Extract, Orchid Extract, Camellia Japonica Leaf Extract, Cryptomeria Japonica Leaf Extract, Bambusa Vulgaris Extract, Theobroma Cacao (Cocoa) Extract, Kaolin, Lactic Acid, Juglans Regia (Walnut) Shell Powder, Polyvinyl Alcohol, Hydrogenated Vegetable Oil, Dextrin, PEG-100 Stearate, Sorbitan Stearate, Cellulose Gum, Xanthan Gum, Lactic Acid/Glycolic Acid Copolymer, Triethoxycaprylylsilane, Aluminum Hydroxide, Disodium EDTA, Ethylhexylglycerin, Phenoxyethanol, Iron Oxides (CI 77499).",
        "suitable_skin_types": ["Oily", "Combination", "Large Pores", "Acne-Prone"],
        "target_concerns": ["Excess Sebum", "Large Pores", "Blackheads", "Acne"],
        "texture": "Smooth, creamy volcanic cooling clay",
        "finish": "Ultra-clean, clarified, non-greasy matte",
        "time_of_day": "evening (1-2x / week)",
        "benefits": [
            "Absorbs excess sebum and deeply purifies congested pores",
            "Cools and contracts enlarged pores",
            "AHA gently dissolves surface flakiness"
        ],
        "usage_instructions": "After cleansing, apply onto dry face, avoiding eye and lip area. After 10-15 minutes, gently massage with fingertips while rinsing off with lukewarm water. Use 1-2 times a week.",
        "contraindications": "Do not leave on until bone dry if you have sensitive or dry skin.",
        "allergen_flags": [],
        "alternative_ids": ["laneige-water-sleeping-mask", "cosrx-ultimate-nourishing-rice-overnight-spa-mask"]
    },
    {
        "id": "laneige-water-sleeping-mask",
        "name": "Water Sleeping Mask (Probiotic Complex)",
        "brand": "Laneige",
        "category": "face_masks",
        "category_name": "Face Masks",
        "price": 2822.00,
        "budget_tier": "mid_range",
        "rating": 4.9,
        "review_count": 22000,
        "volume": "70 ml / 2.3 fl oz",
        "gradient_bg": "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
        "tagline": "Sleeping Micro-Biome & Squalane overnight intensive hydration mask",
        "description": "An overnight leave-on mask infused with a Sleeping Micro-Biome Probiotic Complex and Squalane to intensely recharge dull, fatigued, dehydrated skin while you sleep.",
        "key_actives": ["Probiotic-Derived Complex (23.8 Billion Probiotics)", "Squalane", "Trehalose", "Beta-Glucan", "Hyaluronic Acid"],
        "full_inci": "Water/Aqua/Eau, Butylene Glycol, Glycerin, Trehalose, Methyl Trimethicone, 1,2-Hexanediol, Squalane, Phenyl Trimethicone, PCA Dimethicone, Caprylyl Methicone, Ammonium Acryloyldimethyltaurate/VP Copolymer, Lactobacillus Ferment Lysate, Carbomer, Propanediol, Tromethamine, Acrylates/C10-30 Alkyl Acrylate Crosspolymer, Glyceryl Caprylate, Ethylhexylglycerin, Disodium EDTA, Raffinose, Stearyl Behenate, Malachite Extract, Fragrance/Parfum, Polyglyceryl-3 Methylglucose Distearate, Inulin Lauryl Carbamate, Tranexamic Acid, Tryptophan, Hydroxypropyl Bispalmitamide MEA, Beta-Glucan, Limonene, Acorus Gramineus Extract, Linalool, Tocopherol.",
        "suitable_skin_types": ["Dehydrated", "Dry", "Combination", "Normal", "Dull"],
        "target_concerns": ["Dehydration", "Dullness", "Barrier Damage", "Dryness"],
        "texture": "Cooling, cushiony aqua gel",
        "finish": "Deeply hydrated, glowing, bouncy morning skin",
        "time_of_day": "evening (2-3x / week overnight)",
        "benefits": [
            "Rebalances skin microbiome during overnight sleep cycle",
            "Squalane locks in deep hydration without clogging pores",
            "Wake up with visibly rested, bright, glass skin"
        ],
        "usage_instructions": "Apply evenly across face as the final step of your nighttime routine. Leave on overnight and rinse off in the morning.",
        "contraindications": "Contains mild calming fragrance.",
        "allergen_flags": ["fragrance"],
        "alternative_ids": ["cosrx-ultimate-nourishing-rice-overnight-spa-mask", "innisfree-super-volcanic-pore-clay-mask"]
    },
    {
        "id": "cosrx-ultimate-nourishing-rice-overnight-spa-mask",
        "name": "Ultimate Nourishing Rice Overnight Spa Mask",
        "brand": "COSRX",
        "category": "face_masks",
        "category_name": "Face Masks",
        "price": 1244.17,
        "budget_tier": "budget",
        "rating": 4.7,
        "review_count": 11200,
        "volume": "60 ml / 2.02 fl oz",
        "gradient_bg": "linear-gradient(135deg, #d97706 0%, #fde68a 100%)",
        "tagline": "68% Rice Extract 3-in-1 spa mask for intense glow & nourishment",
        "description": "Enriched with more than 68% Rice Extract, this 3-in-1 mask can be used as an overnight sleeping pack, a wash-off mask, or a rich morning moisturizer to brighten uneven skin tone.",
        "key_actives": ["Oryza Sativa (Rice) Extract 68.9%", "Niacinamide 2%", "Sunflower Seed Oil", "Betaine", "Allantoin"],
        "full_inci": "Oryza Sativa (Rice) Extract, Butylene Glycol, Glycerin, Helianthus Annuus (Sunflower) Seed Oil, Betaine, Niacinamide, Dimethicone, 1,2-Hexanediol, Cetearyl Olivate, Sorbitan Olivate, Elaeis Guineensis (Palm) Oil, Elaeis Guineensis (Palm) Kernel Oil, Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer, Cetearyl Alcohol, Ethylhexylglycerin, Arginine, Carbomer, Allantoin, Xanthan Gum.",
        "suitable_skin_types": ["Dry", "Dull", "Normal", "Sensitive"],
        "target_concerns": ["Dullness", "Dryness", "Hyperpigmentation", "Uneven Texture"],
        "texture": "Silky, creamy spa pudding",
        "finish": "Nourished, luminous, velvety",
        "time_of_day": "evening (overnight) or morning",
        "benefits": [
            "Rice extract naturally refines and brightens skin tone",
            "Niacinamide boosts barrier clarity",
            "Fragrance-free and suitable for sensitive skin"
        ],
        "usage_instructions": "As an overnight mask: Apply a generous layer before bed. As a wash-off mask: Apply generously, leave on for 15 minutes, then rinse off.",
        "contraindications": "None.",
        "allergen_flags": ["niacinamide"],
        "alternative_ids": ["laneige-water-sleeping-mask", "dr-jart-cicapair-calming-serum-mask"]
    },
    {
        "id": "dr-jart-cicapair-calming-serum-mask",
        "name": "Cicapair Tiger Grass Calming Sheet Mask",
        "brand": "Dr. Jart+",
        "category": "face_masks",
        "category_name": "Face Masks",
        "price": 747.00,
        "budget_tier": "budget",
        "rating": 4.8,
        "review_count": 9100,
        "volume": "1 Sheet / 25 g",
        "gradient_bg": "linear-gradient(135deg, #15803d 0%, #4ade80 100%)",
        "tagline": "Centella Asiatica Tiger Grass rapid redness relief sheet mask",
        "description": "An adhesive 100% plant-derived cellulose sheet mask saturated with a rich Centella Asiatica (Tiger Grass) serum to instantly calm red, inflamed, sensitized, or stressed skin.",
        "key_actives": ["Centella Asiatica (Tiger Grass) Extract", "Madecassoside", "Allantoin", "Chamomile Oil", "Niacinamide"],
        "full_inci": "Water/Aqua/Eau, Butylene Glycol, Niacinamide, Glycerin, Centella Asiatica Extract, Diglycerin, Carbomer, Tromethamine, 1,2-Hexanediol, Polyglyceryl-10 Laurate, Hydroxyacetophenone, Trehalose, Allantoin, Ethylhexylglycerin, Xanthan Gum, Adenosine, Disodium EDTA, Melia Azadirachta Leaf Extract, Melia Azadirachta Flower Extract, Theobroma Cacao (Cocoa) Extract, Dextrin, Madecassoside, Chamomilla Recutita (Matricaria) Flower Oil, Citrus Aurantium Bergamia (Bergamot) Fruit Oil, Rosmarinus Officinalis (Rosemary) Leaf Oil, Lavandula Angustifolia (Lavender) Oil.",
        "suitable_skin_types": ["Sensitive", "Rosacea", "Acne-Prone", "Irritated", "All Skin Types"],
        "target_concerns": ["Redness", "Sensitivities", "Inflammation", "Barrier Damage"],
        "texture": "Ultra-soft cooling cellulose sheet saturated with calming essence",
        "finish": "Instantly cooled, redness-free, calm",
        "time_of_day": "anytime (15-20 min soak)",
        "benefits": [
            "Immediate visible cooling and erythema reduction",
            "Madecassoside accelerates wound recovery and barrier defense",
            "Wraps facial contours tightly to lock in soothing actives"
        ],
        "usage_instructions": "Cleanse and tone face. Unfold mask and apply firmly to facial contours. Leave on for 15-20 minutes. Remove and pat remaining serum into skin.",
        "contraindications": "Contains gentle natural essential oils.",
        "allergen_flags": ["essential oils", "niacinamide"],
        "alternative_ids": ["laneige-water-sleeping-mask", "cosrx-ultimate-nourishing-rice-overnight-spa-mask"]
    }
]


# ============================================================================
# 3. PRODUCT SUITABILITY SCORING ENGINE (Vector / Multi-Factor Pointwise Ranker)
# ============================================================================

def normalize_text_list(val: Any) -> List[str]:
    """Helper to safely parse comma or list inputs into lower-case clean tokens."""
    if not val:
        return []
    if isinstance(val, list):
        return [str(x).strip().lower() for x in val if str(x).strip()]
    if isinstance(val, str):
        cleaned = val.replace(";", ",").replace("/", ",")
        return [x.strip().lower() for x in cleaned.split(",") if x.strip()]
    return []


def calculate_product_suitability(
    product: Dict[str, Any],
    skin_type: str = "Normal",
    concerns: List[str] = None,
    allergies: str = "",
    sensitivities: str = "",
    skin_health_score: int = 70,
    current_season: str = "Summer"
) -> Dict[str, Any]:
    """
    Calculates dermatologically calibrated suitability score (0-100%) for a product
    against a user's clinical skin profile.
    
    Score Components:
    1. Skin Type Compatibility (Max 25 pts)
    2. Skin Concern Alignment (Max 35 pts)
    3. Allergy & Sensitivities Safety Gate (Max 20 pts / with penalty disqualification)
    4. Skin Barrier & Health Score Need (Max 10 pts)
    5. Climate & Seasonal Synergy (Max 10 pts)
    """
    skin_type_clean = (skin_type or "Normal").strip()
    skin_type_lower = skin_type_clean.lower()
    
    concern_tokens = [c.lower() for c in (concerns or [])]
    allergies_text = f"{allergies or ''} {sensitivities or ''}".lower()
    
    score = 0
    max_score = 100
    score_breakdown = {
        "skin_type_score": 0,
        "concern_score": 0,
        "safety_score": 0,
        "barrier_score": 0,
        "season_score": 0
    }
    match_reasons = []
    caution_alerts = []
    
    # ── 1. Skin Type Alignment (Max 25 pts) ──
    product_types = [t.lower() for t in product.get("suitable_skin_types", [])]
    type_matched = False
    
    if "all skin types" in product_types:
        score_breakdown["skin_type_score"] = 25
        type_matched = True
        match_reasons.append(f"Universal biocompatibility formulated for all skin profiles including {skin_type_clean} skin.")
    elif any(t in skin_type_lower for t in product_types) or any(skin_type_lower in t for t in product_types):
        score_breakdown["skin_type_score"] = 25
        type_matched = True
        match_reasons.append(f"Specifically formulated for {skin_type_clean} skin with matching lipid balance and texture.")
    elif "combination" in skin_type_lower and ("oily" in product_types or "dry" in product_types):
        score_breakdown["skin_type_score"] = 18
        type_matched = True
        match_reasons.append(f"Compatible with combination T-zone / cheek regional needs.")
    else:
        score_breakdown["skin_type_score"] = 8
        caution_alerts.append(f"Product is optimized for {', '.join(product.get('suitable_skin_types', []))} skin types rather than {skin_type_clean}.")

    # ── 2. Skin Concern Alignment (Max 35 pts) ──
    prod_concerns = [c.lower() for c in product.get("target_concerns", [])]
    matched_concerns = []
    
    for user_c in concern_tokens:
        for p_c in prod_concerns:
            if user_c in p_c or p_c in user_c:
                if p_c not in matched_concerns:
                    matched_concerns.append(p_c)
                    
    if matched_concerns:
        # Scale score based on number of user concerns addressed
        overlap_ratio = min(1.0, len(matched_concerns) / max(1, len(concern_tokens)))
        pts = int(round(20 + 15 * overlap_ratio))
        score_breakdown["concern_score"] = min(35, pts)
        match_reasons.append(f"Directly targets {len(matched_concerns)} of your key priorities: {', '.join([c.title() for c in matched_concerns])}.")
    else:
        if not concern_tokens:
            # Baseline maintenance
            score_breakdown["concern_score"] = 20
            match_reasons.append("Maintains optimal skin homeostasis and barrier prevention.")
        else:
            score_breakdown["concern_score"] = 10
            
    # ── 3. Allergy & Sensitivity Safety Gate (Max 20 pts) ──
    has_allergy_clash = False
    clashing_allergens = []
    
    if allergies_text and allergies_text not in ["", "none", "no", "n/a"]:
        # Check active ingredients and allergen flags
        full_inci_lower = product.get("full_inci", "").lower()
        flags = [f.lower() for f in product.get("allergen_flags", [])]
        
        # Test common allergen substrings
        test_allergens = [a.strip() for a in allergies_text.replace(";", ",").split(",") if a.strip()]
        for allergen in test_allergens:
            if len(allergen) < 3:
                continue
            if allergen in full_inci_lower or any(allergen in f for f in flags):
                has_allergy_clash = True
                clashing_allergens.append(allergen.title())
                
    is_user_sensitive = "sensitive" in skin_type_lower or bool(sensitivities and sensitivities.lower() not in ["", "none", "no"])
    has_fragrance = "fragrance" in product.get("allergen_flags", []) or "fragrance" in product.get("full_inci", "").lower()
    
    if has_allergy_clash:
        score_breakdown["safety_score"] = -40  # Massive penalty
        caution_alerts.append(f"⚠️ ALLERGEN WARNING: Contains {', '.join(clashing_allergens)} which matches your reported allergies/sensitivities.")
    elif is_user_sensitive:
        if has_fragrance or "essential oils" in product.get("allergen_flags", []):
            score_breakdown["safety_score"] = 5
            caution_alerts.append("Contains fragrance or botanical oils that may trigger reactive sensitive skin.")
        else:
            score_breakdown["safety_score"] = 20
            match_reasons.append("Fragrance-free, non-comedogenic and verified safe for reactive sensitive skin.")
    else:
        score_breakdown["safety_score"] = 20
        match_reasons.append("Clean formulation passing clinical tolerance thresholds.")

    # ── 4. Skin Barrier & Health Score Need (Max 10 pts) ──
    actives_text = " ".join(product.get("key_actives", [])).lower()
    has_barrier_repair = any(k in actives_text for k in ["ceramide", "panthenol", "hyaluronic", "centella", "madecassoside", "squalane", "probiotic"])
    
    if skin_health_score < 70:
        if has_barrier_repair:
            score_breakdown["barrier_score"] = 10
            match_reasons.append(f"Rich in barrier-fortifying actives to help elevate your skin health score ({skin_health_score}/100).")
        else:
            score_breakdown["barrier_score"] = 4
    else:
        score_breakdown["barrier_score"] = 8
        if has_barrier_repair:
            match_reasons.append("Reinforces intercellular lipid health to sustain high barrier resilience.")

    # ── 5. Climate & Seasonal Synergy (Max 10 pts) ──
    cat = product.get("category", "")
    texture = product.get("texture", "").lower()
    
    if current_season.lower() == "summer":
        if cat == "sunscreen" or "gel" in texture or "fluid" in texture or "water" in texture:
            score_breakdown["season_score"] = 10
            match_reasons.append("Lightweight texture providing optimal summer breathability and UV defense.")
        else:
            score_breakdown["season_score"] = 7
    elif current_season.lower() == "winter":
        if "cream" in texture or "balm" in texture or "rich" in texture or cat == "moisturizer":
            score_breakdown["season_score"] = 10
            match_reasons.append("Nourishing lipid texture ideal for defending against dry winter weather.")
        else:
            score_breakdown["season_score"] = 7
    else:
        score_breakdown["season_score"] = 8

    # Calculate total suitability score
    raw_total = sum(score_breakdown.values())
    final_score = max(5, min(100, raw_total))
    if has_allergy_clash:
        final_score = min(25, final_score)
        
    # Determine Rating Label & Badge Color
    if has_allergy_clash:
        rating_tier = "Allergen Warning"
        rating_badge = "🚫 Allergen Alert"
        badge_color = "rose"
    elif final_score >= 90:
        rating_tier = "Perfect Match"
        rating_badge = "🌟 90%+ Perfect Match"
        badge_color = "emerald"
    elif final_score >= 75:
        rating_tier = "Highly Recommended"
        rating_badge = "✨ Highly Recommended"
        badge_color = "indigo"
    elif final_score >= 60:
        rating_tier = "Good Match"
        rating_badge = "👍 Good Match"
        badge_color = "blue"
    elif final_score >= 45:
        rating_tier = "Moderate Match"
        rating_badge = "⚠️ Moderate Match"
        badge_color = "amber"
    else:
        rating_tier = "Low Suitability"
        rating_badge = "❌ Low Suitability"
        badge_color = "slate"

    return {
        "suitability_score": int(round(final_score)),
        "rating_tier": rating_tier,
        "rating_badge": rating_badge,
        "badge_color": badge_color,
        "score_breakdown": score_breakdown,
        "matched_concerns": matched_concerns,
        "match_reasons": match_reasons[:3],
        "caution_alerts": caution_alerts,
        "has_allergy_clash": has_allergy_clash,
        "clashing_allergens": clashing_allergens
    }


# ============================================================================
# 4. RECOMMENDATIONS ENGINE (Catalog Ranking & Top Picks)
# ============================================================================

def get_personalized_recommendations(
    skin_type: str = "Normal",
    concerns: List[str] = None,
    allergies: str = "",
    sensitivities: str = "",
    skin_health_score: int = 70,
    current_season: str = "Summer",
    budget_tier: Optional[str] = None,
    category: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates a full personalized recommendation report with ranked products,
    category best-picks, and dynamic scores.
    """
    scored_products = []
    
    for prod in PRODUCT_CATALOG:
        # Category filter if provided
        if category and category != "all" and prod["category"] != category:
            continue
            
        # Budget tier filter if provided
        if budget_tier and budget_tier != "all" and prod["budget_tier"] != budget_tier:
            continue
            
        suitability = calculate_product_suitability(
            product=prod,
            skin_type=skin_type,
            concerns=concerns,
            allergies=allergies,
            sensitivities=sensitivities,
            skin_health_score=skin_health_score,
            current_season=current_season
        )
        
        prod_copy = dict(prod)
        prod_copy.update(suitability)
        scored_products.append(prod_copy)

    # Sort descending by suitability score, then by rating
    scored_products.sort(key=lambda x: (x["suitability_score"], x["rating"]), reverse=True)
    
    # Category Best Picks (Pick #1 top-scoring item per each of the 7 categories)
    category_best_picks = {}
    for cat_key, cat_meta in PRODUCT_CATEGORIES.items():
        cat_items = [p for p in scored_products if p["category"] == cat_key and not p.get("has_allergy_clash")]
        if cat_items:
            category_best_picks[cat_key] = cat_items[0]
            
    # Calculate Summary Stats
    avg_score = int(round(sum(p["suitability_score"] for p in scored_products) / max(1, len(scored_products)))) if scored_products else 0
    top_match = scored_products[0] if scored_products else None
    
    return {
        "user_profile_summary": {
            "skin_type": skin_type,
            "concerns": concerns or [],
            "skin_health_score": skin_health_score,
            "current_season": current_season,
            "has_allergies": bool(allergies or sensitivities)
        },
        "total_products_evaluated": len(scored_products),
        "average_suitability": avg_score,
        "top_match": top_match,
        "category_best_picks": category_best_picks,
        "recommended_products": scored_products
    }


# ============================================================================
# 5. SIDE-BY-SIDE PRODUCT COMPARISON ENGINE (With AI Dermatological Verdict)
# ============================================================================

def compare_products_side_by_side(
    product_ids: List[str],
    skin_type: str = "Normal",
    concerns: List[str] = None,
    allergies: str = "",
    sensitivities: str = "",
    skin_health_score: int = 70,
    current_season: str = "Summer"
) -> Dict[str, Any]:
    """
    Compares 2-3 products side-by-side across formulation, cost metrics, active ingredients,
    safety, suitability scores, and synthesizes an intelligent dermatological comparison verdict.
    """
    catalog_map = {p["id"]: p for p in PRODUCT_CATALOG}
    compared_items = []
    
    for pid in product_ids:
        prod = catalog_map.get(pid)
        if prod:
            suitability = calculate_product_suitability(
                product=prod,
                skin_type=skin_type,
                concerns=concerns,
                allergies=allergies,
                sensitivities=sensitivities,
                skin_health_score=skin_health_score,
                current_season=current_season
            )
            item = dict(prod)
            item.update(suitability)
            compared_items.append(item)

    if not compared_items:
        return {"status": "error", "message": "No valid products found for comparison."}

    # Rank compared products to identify the winner
    sorted_items = sorted(compared_items, key=lambda x: (x["suitability_score"], -x["price"]), reverse=True)
    winner = sorted_items[0]
    
    # Synthesize AI Dermatological Verdict
    verdict_title = f"AI Verdict: {winner['name']} is your best choice ({winner['suitability_score']}% Match)"
    verdict_paragraphs = []
    
    if len(compared_items) >= 2:
        other = sorted_items[1]
        score_diff = winner["suitability_score"] - other["suitability_score"]
        price_diff = winner["price"] - other["price"]
        
        if score_diff > 10:
            verdict_paragraphs.append(
                f"**Clinical Recommendation:** **{winner['brand']} {winner['name']}** significantly outperforms **{other['brand']} {other['name']}** (+{score_diff}% suitability advantage) for your {skin_type.lower()} skin. It provides superior targeted coverage for your concerns ({', '.join(winner.get('matched_concerns', [])) or 'skin barrier maintenance'})."
            )
        elif abs(score_diff) <= 10:
            if price_diff < 0:
                verdict_paragraphs.append(
                    f"**Value & Performance Win:** While both products perform closely ({winner['suitability_score']}% vs {other['suitability_score']}%), **{winner['brand']} {winner['name']}** delivers equivalent clinical efficacy at a **₹{abs(round(price_diff, 2))} savings**, making it the smarter choice for your daily regimen."
                )
            else:
                verdict_paragraphs.append(
                    f"**Close Match Analysis:** Both formulas are well-suited for your profile ({winner['suitability_score']}% vs {other['suitability_score']}%). Choose **{winner['name']}** if you prioritize {winner['key_actives'][0]}, or **{other['name']}** if you prefer a {other['texture'].lower()} texture."
                )
                
        # Safety / Allergen note in verdict
        if any(p.get("has_allergy_clash") for p in compared_items):
            flagged = [p["name"] for p in compared_items if p.get("has_allergy_clash")]
            verdict_paragraphs.append(
                f"⚠️ **Safety Note:** {', '.join(flagged)} triggered an allergy warning for your profile and is not recommended."
            )
    else:
        verdict_paragraphs.append(
            f"**Evaluation:** **{winner['name']}** is scored at {winner['suitability_score']}% suitability for your current {skin_type.lower()} skin profile."
        )

    return {
        "products": compared_items,
        "winner": {
            "id": winner["id"],
            "name": winner["name"],
            "brand": winner["brand"],
            "score": winner["suitability_score"],
            "category": winner["category"]
        },
        "ai_verdict": {
            "title": verdict_title,
            "summary": " ".join(verdict_paragraphs),
            "paragraphs": verdict_paragraphs
        },
        "comparison_metrics": {
            "prices": {p["name"]: f"₹{p['price']:.2f}" for p in compared_items},
            "suitability_scores": {p["name"]: f"{p['suitability_score']}%" for p in compared_items},
            "key_actives": {p["name"]: p["key_actives"] for p in compared_items},
            "textures": {p["name"]: p["texture"] for p in compared_items},
            "target_concerns": {p["name"]: p["target_concerns"] for p in compared_items}
        }
    }


# ============================================================================
# 6. ALTERNATIVE PRODUCT SUGGESTIONS (Dupes, Mild Swaps & Upgrades)
# ============================================================================

def get_product_alternatives(
    product_id: str,
    skin_type: str = "Normal",
    concerns: List[str] = None,
    allergies: str = "",
    sensitivities: str = ""
) -> Dict[str, Any]:
    """
    Finds smart alternative products for a specific item categorized into:
    - 💰 Budget Dupe / Affordable Alternative (lower price, same category & actives)
    - 🛡️ Sensitive Skin Alternative (fragrance-free / milder)
    - ⚡ High-Potency / Clinical Upgrade (higher concentration / premium formulation)
    """
    catalog_map = {p["id"]: p for p in PRODUCT_CATALOG}
    target = catalog_map.get(product_id)
    if not target:
        return {"status": "error", "message": "Product not found."}
        
    cat_items = [p for p in PRODUCT_CATALOG if p["category"] == target["category"] and p["id"] != target["id"]]
    
    budget_dupes = []
    sensitive_alternatives = []
    premium_upgrades = []
    
    for p in cat_items:
        scored = calculate_product_suitability(
            product=p,
            skin_type=skin_type,
            concerns=concerns,
            allergies=allergies,
            sensitivities=sensitivities
        )
        item = dict(p)
        item.update(scored)
        
        # Budget Dupe criteria
        if item["price"] < target["price"]:
            budget_dupes.append(item)
            
        # Sensitive Skin alternative criteria (fragrance-free, soothing actives)
        if "fragrance" not in item.get("allergen_flags", []) and any(k in " ".join(item.get("key_actives", [])).lower() for k in ["centella", "ceramide", "panthenol", "allantoin"]):
            sensitive_alternatives.append(item)
            
        # Premium Upgrade criteria
        if item["price"] > target["price"] or item["budget_tier"] == "luxury":
            premium_upgrades.append(item)

    # Sort each list by suitability score
    budget_dupes.sort(key=lambda x: (x["suitability_score"], -x["price"]), reverse=True)
    sensitive_alternatives.sort(key=lambda x: (x["suitability_score"]), reverse=True)
    premium_upgrades.sort(key=lambda x: (x["suitability_score"]), reverse=True)

    return {
        "target_product": target,
        "budget_dupes": budget_dupes[:3],
        "sensitive_alternatives": sensitive_alternatives[:3],
        "premium_upgrades": premium_upgrades[:3],
        "all_category_alternatives": [p for p in cat_items if p["id"] in target.get("alternative_ids", [])]
    }


# ============================================================================
# 7. BUDGET ROUTINE OPTIMIZER (Knapsack Dynamic Program / Bounded Builder)
# ============================================================================

def build_budget_optimized_routine(
    max_budget: float = 5000.0,
    routine_scope: str = "essential",  # 'essential' (3-step), 'balanced' (5-step), 'complete' (7-step)
    skin_type: str = "Normal",
    concerns: List[str] = None,
    allergies: str = "",
    sensitivities: str = "",
    skin_health_score: int = 70,
    current_season: str = "Summer"
) -> Dict[str, Any]:
    """
    Constructs an optimized routine across required skincare categories within a strict
    maximum total budget limit while maximizing overall clinical suitability.
    
    Scopes:
    - 'essential' (3 steps): Face Wash + Moisturizer + Sunscreen
    - 'balanced' (5 steps): Face Wash + Toner + Serum + Moisturizer + Sunscreen
    - 'complete' (7 steps): All 7 categories (+ Treatment Products + Face Mask)
    """
    if routine_scope == "essential":
        required_categories = ["face_wash", "moisturizer", "sunscreen"]
    elif routine_scope == "balanced":
        required_categories = ["face_wash", "toner", "serum", "moisturizer", "sunscreen"]
    else:  # 'complete'
        required_categories = ["face_wash", "toner", "serum", "treatment_products", "moisturizer", "sunscreen", "face_masks"]

    # Gather & score available products per required category (ignoring allergen clashes)
    category_pools = {}
    for cat in required_categories:
        pool = []
        for p in PRODUCT_CATALOG:
            if p["category"] == cat:
                scored = calculate_product_suitability(
                    product=p,
                    skin_type=skin_type,
                    concerns=concerns,
                    allergies=allergies,
                    sensitivities=sensitivities,
                    skin_health_score=skin_health_score,
                    current_season=current_season
                )
                if not scored.get("has_allergy_clash"):
                    item = dict(p)
                    item.update(scored)
                    pool.append(item)
                    
        # Sort pool by suitability score descending, then price ascending
        pool.sort(key=lambda x: (x["suitability_score"], -x["price"]), reverse=True)
        category_pools[cat] = pool

    # Greedy Knapsack selection starting with top suitability and stepping down if budget exceeded
    # 1. Start with the cheapest valid item in each category to get minimum floor
    current_selection = {}
    for cat in required_categories:
        items = category_pools.get(cat, [])
        if items:
            cheapest = min(items, key=lambda x: x["price"])
            current_selection[cat] = cheapest
        else:
            return {"status": "error", "message": f"No allergy-safe products found for category: {cat}"}

    min_possible_cost = sum(item["price"] for item in current_selection.values())
    if max_budget < min_possible_cost:
        # Budget is lower than cheapest combination; return baseline cheapest with notice
        selected_list = list(current_selection.values())
        total_cost = round(min_possible_cost, 2)
        avg_score = int(round(sum(p["suitability_score"] for p in selected_list) / len(selected_list)))
        return {
            "status": "budget_exceeded_floor",
            "message": f"Target budget (₹{max_budget:.2f}) is below the baseline minimum cost (₹{min_possible_cost:.2f}) for a {routine_scope} routine. Optimized for lowest-cost options.",
            "target_budget": max_budget,
            "total_cost": total_cost,
            "savings": 0.0,
            "average_suitability": avg_score,
            "routine_scope": routine_scope,
            "steps_count": len(selected_list),
            "routine_products": selected_list
        }

    # 2. Iteratively upgrade items to maximize suitability while remaining <= max_budget
    upgraded = True
    while upgraded:
        upgraded = False
        best_upgrade_cat = None
        best_upgrade_item = None
        best_efficiency = 0.0
        
        current_total = sum(item["price"] for item in current_selection.values())
        
        for cat in required_categories:
            current_item = current_selection[cat]
            for candidate in category_pools[cat]:
                if candidate["id"] != current_item["id"]:
                    score_gain = candidate["suitability_score"] - current_item["suitability_score"]
                    cost_increase = candidate["price"] - current_item["price"]
                    
                    if score_gain > 0 and cost_increase > 0:
                        if current_total + cost_increase <= max_budget:
                            efficiency = score_gain / cost_increase
                            if efficiency > best_efficiency:
                                best_efficiency = efficiency
                                best_upgrade_cat = cat
                                best_upgrade_item = candidate

        if best_upgrade_cat and best_upgrade_item:
            current_selection[best_upgrade_cat] = best_upgrade_item
            upgraded = True

    selected_list = [current_selection[cat] for cat in required_categories]
    # Sort routine steps by logical order (cleanser -> toner -> serum -> treatment -> moisturizer -> sunscreen -> mask)
    order_map = {
        "face_wash": 1,
        "toner": 2,
        "serum": 3,
        "treatment_products": 4,
        "moisturizer": 5,
        "sunscreen": 6,
        "face_masks": 7
    }
    selected_list.sort(key=lambda x: order_map.get(x["category"], 99))
    
    total_cost = round(sum(p["price"] for p in selected_list), 2)
    avg_score = int(round(sum(p["suitability_score"] for p in selected_list) / len(selected_list)))
    savings = round(max(0.0, max_budget - total_cost), 2)
    
    return {
        "status": "success",
        "target_budget": max_budget,
        "total_cost": total_cost,
        "savings": savings,
        "average_suitability": avg_score,
        "routine_scope": routine_scope,
        "steps_count": len(selected_list),
        "routine_products": selected_list
    }

