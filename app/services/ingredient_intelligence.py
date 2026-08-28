import re
from typing import Dict, List, Any, Optional, Tuple, Set

# ============================================================================
# 1. CORE INGREDIENT CATEGORIES (The 8 Primary Pillars)
# ============================================================================

INGREDIENT_CATEGORIES = {
    "retinoids": {
        "id": "retinoids",
        "name": "Retinoids",
        "icon": "🧬",
        "tagline": "The gold standard for cellular turnover, collagen synthesis & anti-aging",
        "summary": "Vitamin A derivatives that accelerate epidermal cell turnover, stimulate collagen production, refine skin texture, and decongest pores.",
        "key_ingredients": [
            "Retinol",
            "Tretinoin",
            "Adapalene",
            "Retinaldehyde (Retinal)",
            "Granactive Retinoid (Hydroxypinacolone Retinoate)",
            "Retinyl Palmitate",
            "Bakuchiol (Natural Alternative)"
        ],
        "primary_benefits": [
            "Accelerates cellular renewal & turnover",
            "Stimulates deep collagen and elastin synthesis",
            "Reduces fine lines, wrinkles, and photoaging",
            "Fades stubborn hyperpigmentation and post-acne marks",
            "Prevents comedones and breakouts"
        ],
        "suitable_for": ["Aging", "Acne", "Hyperpigmentation", "Uneven Texture", "Large Pores"],
        "skin_types": ["Normal", "Oily", "Combination", "Dry (with buffer)"],
        "caution_skin_types": ["Sensitive", "Compromised Skin Barrier", "Rosacea"],
        "best_time": "Evening (Night Care)",
        "optimal_ph": "5.5 - 6.5",
        "usage_tips": "Start 1-2 nights a week (the sandwich method: moisturizer - retinoid - moisturizer). Always wear broad-spectrum SPF 50+ in the morning as retinoids increase photosensitivity.",
        "do_not_mix_with": ["AHAs/BHAs (same routine)", "Pure Vitamin C / L-Ascorbic Acid (same routine)", "Benzoyl Peroxide"],
        "synergies": ["Ceramides", "Hyaluronic Acid", "Niacinamide", "Peptides"]
    },
    "niacinamide": {
        "id": "niacinamide",
        "name": "Niacinamide",
        "icon": "🛡️",
        "tagline": "The multi-tasking barrier shield, pore refiner & soothing powerhouse",
        "summary": "Water-soluble Vitamin B3 that fortifies the lipid barrier, regulates excess sebum production, calms erythema/redness, and fades discoloration.",
        "key_ingredients": [
            "Niacinamide (Vitamin B3)",
            "Nicotinamide"
        ],
        "primary_benefits": [
            "Regulates and balances sebaceous gland activity",
            "Strengthens the ceramide lipid barrier",
            "Calms inflammation and facial redness/rosacea",
            "Minimizes enlarged pore appearance",
            "Inhibits melanosome transfer to brighten dark spots"
        ],
        "suitable_for": ["Acne", "Large Pores", "Redness", "Hyperpigmentation", "Barrier Damage", "Dullness"],
        "skin_types": ["Oily", "Combination", "Dry", "Sensitive", "Normal"],
        "caution_skin_types": [],
        "best_time": "Morning & Evening",
        "optimal_ph": "5.0 - 7.0",
        "usage_tips": "Highly versatile and well-tolerated. 2% to 5% concentration is the dermatological sweet spot for maximum efficacy without irritation.",
        "do_not_mix_with": ["High-concentration unbuffered acidic L-Ascorbic Acid directly (if sensitive to flushing)"],
        "synergies": ["Salicylic Acid", "Zinc PCA", "Hyaluronic Acid", "Ceramides", "Retinol"]
    },
    "vitamin_c": {
        "id": "vitamin_c",
        "name": "Vitamin C",
        "icon": "🍊",
        "tagline": "Potent antioxidant shield for collagen synthesis & luminous radiance",
        "summary": "A quintessential dermatological antioxidant that neutralizes free radicals, suppresses melanin hyperproduction, and boosts dermal collagen.",
        "key_ingredients": [
            "L-Ascorbic Acid",
            "Sodium Ascorbyl Phosphate (SAP)",
            "Magnesium Ascorbyl Phosphate (MAP)",
            "Ascorbyl Glucoside",
            "3-O-Ethyl Ascorbic Acid",
            "Tetrahexyldecyl Ascorbate (THD)"
        ],
        "primary_benefits": [
            "Neutralizes oxidative stress from UV radiation and pollution",
            "Inhibits tyrosinase to fade dark spots and melasma",
            "Stimulates collagen biosynthesis for firm skin",
            "Brightens dull complexion and restores natural glow"
        ],
        "suitable_for": ["Dullness", "Hyperpigmentation", "Dark Spots", "Aging", "Sun Damage"],
        "skin_types": ["Normal", "Combination", "Oily", "Dry"],
        "caution_skin_types": ["Very Sensitive (opt for Ascorbyl Glucoside or SAP instead of pure L-Ascorbic Acid)"],
        "best_time": "Morning (under sunscreen for synergistic photoprotection)",
        "optimal_ph": "2.8 - 3.5 (for pure L-Ascorbic Acid) / 5.5 - 7.0 (for derivatives)",
        "usage_tips": "Store pure L-Ascorbic Acid formulas in dark, airtight bottles away from heat and light. Pair with Vitamin E and Ferulic Acid to increase stability by up to 8x.",
        "do_not_mix_with": ["Retinoids (same routine - use Vitamin C AM, Retinoid PM)", "Copper Peptides", "High-strength AHAs/BHAs directly"],
        "synergies": ["Ferulic Acid", "Vitamin E (Tocopherol)", "Hyaluronic Acid", "Sunscreen (SPF)"]
    },
    "hyaluronic_acid": {
        "id": "hyaluronic_acid",
        "name": "Hyaluronic Acid",
        "icon": "💧",
        "tagline": "The supreme moisture magnet holding up to 1,000x its molecular weight",
        "summary": "A glycosaminoglycan humectant naturally found in skin that draws moisture from the atmosphere into the extracellular matrix for intense hydration and plumpness.",
        "key_ingredients": [
            "Hyaluronic Acid",
            "Sodium Hyaluronate",
            "Hydrolyzed Hyaluronic Acid",
            "Sodium Acetylated Hyaluronate",
            "Sodium Hyaluronate Crosspolymer"
        ],
        "primary_benefits": [
            "Instantly quenches dehydrated skin",
            "Plumps fine dehydration lines and restores bounce",
            "Maintains optimum moisture balance in the epidermal layer",
            "Soothes irritated or stressed skin"
        ],
        "suitable_for": ["Dryness", "Dehydration", "Flakiness", "Fine Lines", "Compromised Barrier"],
        "skin_types": ["Dry", "Sensitive", "Combination", "Oily", "Normal"],
        "caution_skin_types": [],
        "best_time": "Morning & Evening",
        "optimal_ph": "5.0 - 7.0",
        "usage_tips": "Apply directly onto damp skin post-cleansing, then seal immediately with a ceramide-rich moisturizer or oil to prevent trans-epidermal water loss (TEWL) in dry climates.",
        "do_not_mix_with": [],
        "synergies": ["Ceramides", "Glycerin", "Panthenol (B5)", "Peptides", "All actives"]
    },
    "salicylic_acid": {
        "id": "salicylic_acid",
        "name": "Salicylic Acid (BHA)",
        "icon": "🌿",
        "tagline": "The oil-soluble keratolytic that deep-cleans pores & clears blemishes",
        "summary": "A lipid-soluble Beta Hydroxy Acid that penetrates inside the pore lining to dissolve trapped sebum, shed dead epithelial cells, and soothe inflammation.",
        "key_ingredients": [
            "Salicylic Acid",
            "Beta Hydroxy Acid (BHA)",
            "Betaine Salicylate",
            "Salix Alba (Willow) Bark Extract"
        ],
        "primary_benefits": [
            "Penetrates deep into sebaceous follicles to dissolve blackheads and whiteheads",
            "Exfoliates pore walls to prevent acne congestion",
            "Provides anti-inflammatory and soothing benefits",
            "Smoothes rough, bumpy skin texture (keratosis pilaris)"
        ],
        "suitable_for": ["Acne", "Blackheads", "Whiteheads", "Large Pores", "Excess Oil", "Rough Texture"],
        "skin_types": ["Oily", "Acne-Prone", "Combination"],
        "caution_skin_types": ["Extremely Dry", "Sensitive/Eczema-Prone", "Aspirin/Salicylate Allergy (Strict Avoidance)"],
        "best_time": "Evening or Morning (1-3 times weekly or daily in low wash-off %)",
        "optimal_ph": "3.0 - 4.0",
        "usage_tips": "Leave-on 0.5% to 2% is ideal for acne control. Do not overuse; begin 2-3 times per week before increasing frequency.",
        "do_not_mix_with": ["Retinoids (same evening)", "High-strength Glycolic/Lactic Acid (risk of over-exfoliation)"],
        "synergies": ["Niacinamide", "Centella Asiatica", "Hyaluronic Acid", "Zinc PCA"]
    },
    "ceramides": {
        "id": "ceramides",
        "name": "Ceramides",
        "icon": "🧱",
        "tagline": "The essential mortar that repairs and seals the skin moisture barrier",
        "summary": "Sphingolipids that make up over 50% of the skin's natural intercellular matrix, preventing water evaporation and shielding against environmental aggressors.",
        "key_ingredients": [
            "Ceramide NP",
            "Ceramide AP",
            "Ceramide EOP",
            "Ceramide NS",
            "Ceramide EOS",
            "Phytosphingosine",
            "Sphingosine"
        ],
        "primary_benefits": [
            "Restores and fortifies damaged stratum corneum barrier",
            "Locks in vital moisture and halts trans-epidermal water loss (TEWL)",
            "Protects skin from environmental pollutants, allergens, and pathogens",
            "Soothes redness, flaking, tightness, and micro-tears"
        ],
        "suitable_for": ["Compromised Barrier", "Dryness", "Eczema/Flaking", "Redness", "Over-exfoliated Skin"],
        "skin_types": ["Dry", "Sensitive", "Normal", "Combination", "Oily (lightweight lotions)"],
        "caution_skin_types": [],
        "best_time": "Morning & Evening",
        "optimal_ph": "5.5 - 6.5",
        "usage_tips": "Ideal in a golden physiological ratio with Cholesterol and Fatty Acids (3:1:1) to accelerate skin barrier repair after strong acids or retinoid use.",
        "do_not_mix_with": [],
        "synergies": ["Hyaluronic Acid", "Fatty Acids", "Cholesterol", "Retinoids", "AHAs/BHAs (to buffer irritation)"]
    },
    "peptides": {
        "id": "peptides",
        "name": "Peptides",
        "icon": "🔗",
        "tagline": "Cell-signaling messengers that stimulate structural remodeling & firming",
        "summary": "Short chains of amino acids that signal fibroblasts to synthesize new collagen, elastin, and structural proteins, visibly firming and smoothing the skin.",
        "key_ingredients": [
            "Palmitoyl Tripeptide-1",
            "Palmitoyl Tetrapeptide-7 (Matrixyl)",
            "Acetyl Hexapeptide-8 (Argireline)",
            "Copper Tripeptide-1 (GHK-Cu)",
            "Palmitoyl Tripeptide-38 (Matrixyl Synthe'6)",
            "Oligopeptides"
        ],
        "primary_benefits": [
            "Signals collagen and elastin production for firmer, resilient skin",
            "Relaxes dynamic facial expression lines (Argireline peptide)",
            "Supports wound healing, tissue repair, and skin elasticity",
            "Strengthens the dermal-epidermal junction"
        ],
        "suitable_for": ["Aging", "Loss of Elasticity", "Fine Lines", "Wrinkles", "Barrier Weakness"],
        "skin_types": ["Normal", "Dry", "Combination", "Sensitive", "Oily"],
        "caution_skin_types": [],
        "best_time": "Morning & Evening",
        "optimal_ph": "5.0 - 7.0",
        "usage_tips": "Gentle, non-irritating, and compatible with most active routines. Great for delicate eye and neck contours.",
        "do_not_mix_with": ["Copper Peptides should NOT be combined with Direct Strong Acids (AHAs/BHAs) or Pure L-Ascorbic Acid (causes chelation)"],
        "synergies": ["Hyaluronic Acid", "Ceramides", "Niacinamide", "Retinoids"]
    },
    "ahas_bhas": {
        "id": "ahas_bhas",
        "name": "AHAs & BHAs (Chemical Exfoliants)",
        "icon": "✨",
        "tagline": "Surface and pore exfoliants for luminous clarity & refined texture",
        "summary": "Alpha Hydroxy Acids (water-soluble, surface exfoliants) and Beta Hydroxy Acids (oil-soluble, pore exfoliants) that dissolve desmosomal bonds to shed dull cells.",
        "key_ingredients": [
            "Glycolic Acid (AHA)",
            "Lactic Acid (AHA)",
            "Mandelic Acid (AHA)",
            "Salicylic Acid (BHA)",
            "Malic Acid (AHA)",
            "Tartaric Acid (AHA)",
            "Gluconolactone (PHA)",
            "Lactobionic Acid (PHA)"
        ],
        "primary_benefits": [
            "Dissolves dull dead stratum corneum cells",
            "Evens out skin tone and fades superficial dark spots",
            "Smooths rough, bumpy texture and fine surface lines",
            "Enhances the absorption of subsequent serums and moisturizers"
        ],
        "suitable_for": ["Dullness", "Hyperpigmentation", "Rough Texture", "Uneven Tone", "Clogged Pores"],
        "skin_types": ["Normal", "Combination", "Oily", "Dry (Lactic/Mandelic Acid)"],
        "caution_skin_types": ["Very Sensitive (use PHA or Mandelic)", "Active Eczema", "Active Barrier Breakdown"],
        "best_time": "Evening (1 to 3 times per week)",
        "optimal_ph": "3.5 - 4.2",
        "usage_tips": "Do not combine multiple strong acid products in the same routine. Always apply sunscreen next morning because AHAs increase UV vulnerability.",
        "do_not_mix_with": ["Retinoids (same routine)", "Pure Vitamin C (same routine)", "Copper Peptides"],
        "synergies": ["Hyaluronic Acid", "Ceramides", "Centella Asiatica", "Panthenol"]
    }
}


# ============================================================================
# 2. INCI SYNONYMS & INGREDIENT KNOWLEDGE BASE
# ============================================================================

INGREDIENT_DATABASE = {
    # ── RETINOIDS ──
    "retinol": {
        "canonical_name": "Retinol",
        "category": "retinoids",
        "aliases": ["retinol", "pure retinol", "microencapsulated retinol"],
        "comedogenic_rating": 0,
        "irritation_potential": "Medium",
        "functions": ["Cellular turnover", "Anti-aging", "Collagen booster", "Texture refiner"],
        "suitable_types": ["Normal", "Oily", "Combination", "Dry"],
        "concerns": ["Aging", "Hyperpigmentation", "Acne", "Large Pores", "Dullness"],
        "time_of_day": "Evening",
        "ph_range": "5.5 - 6.5"
    },
    "tretinoin": {
        "canonical_name": "Tretinoin (Retinoic Acid)",
        "category": "retinoids",
        "aliases": ["tretinoin", "retinoic acid", "all-trans retinoic acid", "retin-a"],
        "comedogenic_rating": 0,
        "irritation_potential": "High",
        "functions": ["Prescription anti-acne", "Deep collagen remodeling", "Photoaging reversal"],
        "suitable_types": ["Oily", "Combination", "Normal"],
        "concerns": ["Acne", "Aging", "Hyperpigmentation"],
        "time_of_day": "Evening",
        "ph_range": "5.0 - 6.5"
    },
    "adapalene": {
        "canonical_name": "Adapalene",
        "category": "retinoids",
        "aliases": ["adapalene", "differin"],
        "comedogenic_rating": 0,
        "irritation_potential": "Medium-High",
        "functions": ["Targeted anti-acne", "Anti-inflammatory", "Cellular turnover"],
        "suitable_types": ["Oily", "Acne-Prone", "Combination"],
        "concerns": ["Acne", "Clogged Pores", "Hyperpigmentation"],
        "time_of_day": "Evening",
        "ph_range": "5.0 - 6.5"
    },
    "retinal": {
        "canonical_name": "Retinaldehyde (Retinal)",
        "category": "retinoids",
        "aliases": ["retinal", "retinaldehyde"],
        "comedogenic_rating": 0,
        "irritation_potential": "Medium",
        "functions": ["Fast-acting Vitamin A", "Antibacterial anti-acne", "Collagen renewal"],
        "suitable_types": ["Normal", "Oily", "Combination", "Dry"],
        "concerns": ["Aging", "Acne", "Hyperpigmentation"],
        "time_of_day": "Evening",
        "ph_range": "5.5 - 6.5"
    },
    "hydroxypinacolone_retinoate": {
        "canonical_name": "Granactive Retinoid (Hydroxypinacolone Retinoate)",
        "category": "retinoids",
        "aliases": ["hydroxypinacolone retinoate", "granactive retinoid", "hpr"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Low-irritation anti-aging", "Direct retinoid receptor binding"],
        "suitable_types": ["Normal", "Dry", "Combination", "Sensitive", "Oily"],
        "concerns": ["Aging", "Fine Lines", "Dullness"],
        "time_of_day": "Evening",
        "ph_range": "5.0 - 6.5"
    },
    "retinyl_palmitate": {
        "canonical_name": "Retinyl Palmitate",
        "category": "retinoids",
        "aliases": ["retinyl palmitate", "vitamin a palmitate"],
        "comedogenic_rating": 1,
        "irritation_potential": "Low",
        "functions": ["Mild antioxidant", "Gentle retinoid precursor"],
        "suitable_types": ["Dry", "Normal", "Sensitive"],
        "concerns": ["Aging", "Early Fine Lines"],
        "time_of_day": "Evening",
        "ph_range": "5.5 - 6.5"
    },
    "bakuchiol": {
        "canonical_name": "Bakuchiol",
        "category": "retinoids",
        "aliases": ["bakuchiol", "psoralea corylifolia extract"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Plant-based retinoid alternative", "Antioxidant", "Collagen support", "Anti-inflammatory"],
        "suitable_types": ["Sensitive", "Dry", "Normal", "Combination", "Oily"],
        "concerns": ["Aging", "Fine Lines", "Redness", "Hyperpigmentation"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },

    # ── NIACINAMIDE ──
    "niacinamide": {
        "canonical_name": "Niacinamide (Vitamin B3)",
        "category": "niacinamide",
        "aliases": ["niacinamide", "nicotinamide", "vitamin b3"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Barrier restoration", "Sebum control", "Pore tightening", "Brightening", "Anti-inflammatory"],
        "suitable_types": ["Oily", "Combination", "Dry", "Normal", "Sensitive"],
        "concerns": ["Acne", "Large Pores", "Redness", "Hyperpigmentation", "Dullness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },

    # ── VITAMIN C ──
    "ascorbic_acid": {
        "canonical_name": "L-Ascorbic Acid",
        "category": "vitamin_c",
        "aliases": ["ascorbic acid", "l-ascorbic acid", "pure vitamin c"],
        "comedogenic_rating": 0,
        "irritation_potential": "Medium-High (at low pH)",
        "functions": ["Potent antioxidant", "Tyrosinase inhibitor", "Collagen booster", "Photoprotection booster"],
        "suitable_types": ["Normal", "Combination", "Oily", "Dry"],
        "concerns": ["Hyperpigmentation", "Dark Spots", "Dullness", "Aging"],
        "time_of_day": "Morning",
        "ph_range": "2.8 - 3.5"
    },
    "ascorbyl_glucoside": {
        "canonical_name": "Ascorbyl Glucoside",
        "category": "vitamin_c",
        "aliases": ["ascorbyl glucoside", "vitamin c glucoside"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Stable brightening", "Gentle antioxidant", "Collagen support"],
        "suitable_types": ["Sensitive", "Normal", "Dry", "Combination", "Oily"],
        "concerns": ["Hyperpigmentation", "Dullness", "Uneven Tone"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.5 - 7.0"
    },
    "ethyl_ascorbic_acid": {
        "canonical_name": "3-O-Ethyl Ascorbic Acid",
        "category": "vitamin_c",
        "aliases": ["ethyl ascorbic acid", "3-o-ethyl ascorbic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low-Medium",
        "functions": ["High-penetration brightening", "Anti-inflammatory antioxidant", "Dark spot fading"],
        "suitable_types": ["Normal", "Combination", "Oily", "Dry"],
        "concerns": ["Hyperpigmentation", "Dark Spots", "Dullness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "4.5 - 6.0"
    },
    "sodium_ascorbyl_phosphate": {
        "canonical_name": "Sodium Ascorbyl Phosphate (SAP)",
        "category": "vitamin_c",
        "aliases": ["sodium ascorbyl phosphate", "sap"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Antimicrobial anti-acne", "Stable antioxidant", "Gentle brightening"],
        "suitable_types": ["Acne-Prone", "Oily", "Sensitive", "Normal"],
        "concerns": ["Acne", "Hyperpigmentation", "Dullness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "6.0 - 7.0"
    },
    "magnesium_ascorbyl_phosphate": {
        "canonical_name": "Magnesium Ascorbyl Phosphate (MAP)",
        "category": "vitamin_c",
        "aliases": ["magnesium ascorbyl phosphate", "map"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Hydrating antioxidant", "Pigment correction", "Collagen boost"],
        "suitable_types": ["Dry", "Sensitive", "Normal"],
        "concerns": ["Dryness", "Hyperpigmentation", "Dullness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "6.0 - 7.5"
    },
    "tetrahexyldecyl_ascorbate": {
        "canonical_name": "Tetrahexyldecyl Ascorbate (THD)",
        "category": "vitamin_c",
        "aliases": ["tetrahexyldecyl ascorbate", "ascorbyl tetraisopalmitate", "thd ascorbate"],
        "comedogenic_rating": 1,
        "irritation_potential": "Low",
        "functions": ["Lipid-soluble deep penetration", "Potent collagen stimulation", "Photoprotection"],
        "suitable_types": ["Dry", "Normal", "Combination", "Sensitive"],
        "concerns": ["Aging", "Loss of Firmness", "Hyperpigmentation"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 6.5"
    },

    # ── HYALURONIC ACID & HUMECTANTS ──
    "sodium_hyaluronate": {
        "canonical_name": "Sodium Hyaluronate",
        "category": "hyaluronic_acid",
        "aliases": ["sodium hyaluronate", "hyaluronic acid", "hyaluronate"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Intensive hydration", "Moisture retention", "Plumping", "Barrier support"],
        "suitable_types": ["Dry", "Sensitive", "Oily", "Combination", "Normal"],
        "concerns": ["Dryness", "Dehydration", "Fine Lines", "Flakiness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },
    "hydrolyzed_hyaluronic_acid": {
        "canonical_name": "Hydrolyzed Hyaluronic Acid (Low Molecular Weight)",
        "category": "hyaluronic_acid",
        "aliases": ["hydrolyzed hyaluronic acid", "hydrolyzed sodium hyaluronate", "micro hyaluronic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Deep epidermal hydration", "Elasticity boosting", "Fine line smoothing"],
        "suitable_types": ["Dry", "Dehydrated", "Aging", "Normal", "Combination"],
        "concerns": ["Dehydration", "Fine Lines", "Aging"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },
    "sodium_hyaluronate_crosspolymer": {
        "canonical_name": "Sodium Hyaluronate Crosspolymer",
        "category": "hyaluronic_acid",
        "aliases": ["sodium hyaluronate crosspolymer", "cross-linked hyaluronic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Time-released sustained hydration", "Protective moisture network"],
        "suitable_types": ["Dry", "Sensitive", "Normal", "Combination"],
        "concerns": ["Dehydration", "Dryness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },

    # ── SALICYLIC ACID (BHA) ──
    "salicylic_acid": {
        "canonical_name": "Salicylic Acid",
        "category": "salicylic_acid",
        "aliases": ["salicylic acid", "bha", "beta hydroxy acid", "2-hydroxybenzoic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Medium",
        "functions": ["Pore decongestion", "Comedolytic", "Sebum breakdown", "Anti-inflammatory"],
        "suitable_types": ["Oily", "Acne-Prone", "Combination"],
        "concerns": ["Acne", "Blackheads", "Large Pores", "Rough Texture"],
        "time_of_day": "Evening or Morning",
        "ph_range": "3.0 - 4.0"
    },
    "betaine_salicylate": {
        "canonical_name": "Betaine Salicylate",
        "category": "salicylic_acid",
        "aliases": ["betaine salicylate"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low-Medium",
        "functions": ["Gentle BHA exfoliation", "Hydrating pore clearing"],
        "suitable_types": ["Sensitive", "Combination", "Acne-Prone"],
        "concerns": ["Acne", "Large Pores", "Texture"],
        "time_of_day": "Evening or Morning",
        "ph_range": "3.5 - 4.5"
    },
    "willow_bark_extract": {
        "canonical_name": "Willow Bark Extract",
        "category": "salicylic_acid",
        "aliases": ["salix alba bark extract", "willow bark extract", "salix nigra bark extract"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Natural salicin soothing", "Gentle astringent", "Anti-inflammatory"],
        "suitable_types": ["Oily", "Sensitive", "Combination"],
        "concerns": ["Acne", "Redness", "Excess Oil"],
        "time_of_day": "Morning & Evening",
        "ph_range": "4.5 - 6.5"
    },

    # ── CERAMIDES ──
    "ceramide_np": {
        "canonical_name": "Ceramide NP (Ceramide 3)",
        "category": "ceramides",
        "aliases": ["ceramide np", "ceramide 3"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Lipid barrier repair", "TEWL reduction", "Cellular cohesion", "Soothing"],
        "suitable_types": ["Dry", "Sensitive", "Normal", "Combination", "Oily"],
        "concerns": ["Dryness", "Compromised Barrier", "Redness", "Flaking"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.5 - 6.5"
    },
    "ceramide_ap": {
        "canonical_name": "Ceramide AP (Ceramide 6-II)",
        "category": "ceramides",
        "aliases": ["ceramide ap", "ceramide 6-ii"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Epidermal moisture lock", "Barrier reinforcement", "Desquamation normalization"],
        "suitable_types": ["Dry", "Sensitive", "Normal"],
        "concerns": ["Barrier Damage", "Dryness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.5 - 6.5"
    },
    "ceramide_eop": {
        "canonical_name": "Ceramide EOP (Ceramide 1)",
        "category": "ceramides",
        "aliases": ["ceramide eop", "ceramide 1"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Stratum corneum lipid linkage", "Moisture barrier seal"],
        "suitable_types": ["Dry", "Sensitive", "Compromised Barrier"],
        "concerns": ["Barrier Damage", "Severe Dryness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.5 - 6.5"
    },
    "phytosphingosine": {
        "canonical_name": "Phytosphingosine",
        "category": "ceramides",
        "aliases": ["phytosphingosine"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Ceramide precursor", "Natural antimicrobial against acne", "Anti-inflammatory"],
        "suitable_types": ["Acne-Prone", "Sensitive", "Dry", "Combination"],
        "concerns": ["Acne", "Compromised Barrier", "Redness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 6.5"
    },

    # ── PEPTIDES ──
    "matrixyl_3000": {
        "canonical_name": "Matrixyl 3000 (Palmitoyl Tripeptide-1 & Tetrapeptide-7)",
        "category": "peptides",
        "aliases": ["matrixyl 3000", "palmitoyl tripeptide-1", "palmitoyl tetrapeptide-7", "matrixyl"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Collagen synthesis signaling", "Extracellular matrix repair", "Wrinkle reduction"],
        "suitable_types": ["Aging", "Dry", "Normal", "Combination", "Sensitive"],
        "concerns": ["Aging", "Fine Lines", "Loss of Firmness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },
    "argireline": {
        "canonical_name": "Argireline (Acetyl Hexapeptide-8)",
        "category": "peptides",
        "aliases": ["argireline", "acetyl hexapeptide-8", "acetyl hexapeptide-3"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Dynamic expression line relaxation (Botox-like effect)", "Skin smoothing"],
        "suitable_types": ["Aging", "All Skin Types"],
        "concerns": ["Expression Lines", "Crow's Feet", "Forehead Lines"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.5 - 7.0"
    },
    "copper_peptides": {
        "canonical_name": "Copper Tripeptide-1 (GHK-Cu)",
        "category": "peptides",
        "aliases": ["copper tripeptide-1", "ghk-cu", "copper peptides"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low-Medium",
        "functions": ["Tissue remodeling", "Wound healing", "Antioxidant enzyme activation", "Collagen/elastin boost"],
        "suitable_types": ["Aging", "Dry", "Combination", "Normal"],
        "concerns": ["Aging", "Loss of Elasticity", "Scars/Texture"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.5 - 7.0"
    },
    "matrixyl_synthe6": {
        "canonical_name": "Palmitoyl Tripeptide-38 (Matrixyl Synthe'6)",
        "category": "peptides",
        "aliases": ["palmitoyl tripeptide-38", "matrixyl synthe 6"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Rebuilds 6 major structural components of the skin matrix and dermal-epidermal junction"],
        "suitable_types": ["Aging", "Dry", "Normal"],
        "concerns": ["Deep Wrinkles", "Loss of Firmness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },

    # ── AHAs / BHAs / PHAs ──
    "glycolic_acid": {
        "canonical_name": "Glycolic Acid (AHA)",
        "category": "ahas_bhas",
        "aliases": ["glycolic acid", "hydroxyacetic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Medium-High",
        "functions": ["Smallest molecule AHA", "Deep surface exfoliation", "Hyperpigmentation fading", "Collagen boost"],
        "suitable_types": ["Normal", "Oily", "Combination"],
        "concerns": ["Hyperpigmentation", "Dullness", "Uneven Texture", "Aging"],
        "time_of_day": "Evening (1-3x/week)",
        "ph_range": "3.5 - 4.0"
    },
    "lactic_acid": {
        "canonical_name": "Lactic Acid (AHA)",
        "category": "ahas_bhas",
        "aliases": ["lactic acid", "2-hydroxypropanoic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low-Medium",
        "functions": ["Hydrating AHA exfoliation", "Gentle surface renewal", "Skin smoothing", "Humectant"],
        "suitable_types": ["Dry", "Normal", "Combination", "Mildly Sensitive"],
        "concerns": ["Dryness", "Dullness", "Uneven Texture", "Hyperpigmentation"],
        "time_of_day": "Evening",
        "ph_range": "3.5 - 4.2"
    },
    "mandelic_acid": {
        "canonical_name": "Mandelic Acid (AHA)",
        "category": "ahas_bhas",
        "aliases": ["mandelic acid", "amygdalic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Large molecule gentle AHA", "Antibacterial", "Safe for sensitive & melasma-prone skin"],
        "suitable_types": ["Sensitive", "Acne-Prone", "Darker Fitzpatrick Skin Tones", "Combination"],
        "concerns": ["Acne", "Hyperpigmentation", "Dullness", "Sensitive Skin"],
        "time_of_day": "Evening",
        "ph_range": "3.5 - 4.5"
    },
    "gluconolactone": {
        "canonical_name": "Gluconolactone (PHA)",
        "category": "ahas_bhas",
        "aliases": ["gluconolactone", "pha", "polyhydroxy acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Very Low",
        "functions": ["Ultra-gentle PHA exfoliation", "Antioxidant shield", "Deep humectant hydration"],
        "suitable_types": ["Sensitive", "Rosacea-Prone", "Dry", "All Types"],
        "concerns": ["Redness", "Sensitivity", "Dehydration", "Dullness"],
        "time_of_day": "Morning or Evening",
        "ph_range": "3.8 - 4.5"
    },

    # ── SUPPORTING SOOTHING / BARRIER / ANTIOXIDANT INGREDIENTS ──
    "centella_asiatica": {
        "canonical_name": "Centella Asiatica (Cica / Madecassoside)",
        "category": "soothing",
        "aliases": ["centella asiatica", "cica", "madecassoside", "asiaticoside", "asiatic acid", "gotu kola"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Potent wound healing", "Anti-inflammatory", "Erythema reduction", "Barrier repair"],
        "suitable_types": ["Sensitive", "Acne-Prone", "All Skin Types"],
        "concerns": ["Redness", "Irritation", "Acne", "Barrier Damage"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },
    "azelaic_acid": {
        "canonical_name": "Azelaic Acid",
        "category": "treatment",
        "aliases": ["azelaic acid", "potassium azeloyl diglycinate"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low-Medium",
        "functions": ["Rosacea treatment", "Tyrosinase inhibition", "Antimicrobial against C. acnes", "Redness reduction"],
        "suitable_types": ["Sensitive", "Acne-Prone", "Rosacea-Prone", "Combination", "Oily"],
        "concerns": ["Redness", "Acne", "Hyperpigmentation", "Rosacea"],
        "time_of_day": "Morning & Evening",
        "ph_range": "4.0 - 5.5"
    },
    "panthenol": {
        "canonical_name": "Panthenol (Pro-Vitamin B5)",
        "category": "soothing",
        "aliases": ["panthenol", "provitamin b5", "dexpanthenol"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Deep hydration", "Wound healing acceleration", "Anti-inflammatory soothing"],
        "suitable_types": ["Sensitive", "Dry", "Compromised Barrier", "All Skin Types"],
        "concerns": ["Redness", "Irritation", "Barrier Damage", "Dryness"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },
    "zinc_pca": {
        "canonical_name": "Zinc PCA",
        "category": "treatment",
        "aliases": ["zinc pca", "zinc pyrrolidone carboxylic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["5-alpha reductase inhibitor (sebum reduction)", "Antibacterial", "Hydrating PCA salt"],
        "suitable_types": ["Oily", "Acne-Prone", "Combination"],
        "concerns": ["Acne", "Excess Sebum", "Large Pores"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 6.5"
    },
    "squalane": {
        "canonical_name": "Squalane",
        "category": "hydrating_lipid",
        "aliases": ["squalane", "plant squalane", "olive squalane"],
        "comedogenic_rating": 1,
        "irritation_potential": "Low",
        "functions": ["Biomimetic emollient", "Non-comedogenic moisture seal", "Antioxidant"],
        "suitable_types": ["Dry", "Normal", "Combination", "Sensitive", "Oily"],
        "concerns": ["Dryness", "Dehydration", "Compromised Barrier"],
        "time_of_day": "Morning & Evening",
        "ph_range": "N/A (Anhydrous)"
    },
    "tocopherol": {
        "canonical_name": "Vitamin E (Tocopherol)",
        "category": "antioxidants",
        "aliases": ["tocopherol", "tocopheryl acetate", "vitamin e"],
        "comedogenic_rating": 2,
        "irritation_potential": "Low",
        "functions": ["Lipid antioxidant", "Free radical scavenger", "Moisturizing emollient"],
        "suitable_types": ["Dry", "Normal", "Aging"],
        "concerns": ["Aging", "Dryness", "Oxidative Stress"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },
    "ferulic_acid": {
        "canonical_name": "Ferulic Acid",
        "category": "antioxidants",
        "aliases": ["ferulic acid"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Plant antioxidant", "Stabilizes Vitamin C & E", "Doubles photoprotective efficacy"],
        "suitable_types": ["Normal", "Combination", "Oily", "Dry"],
        "concerns": ["Aging", "Hyperpigmentation", "Sun Damage"],
        "time_of_day": "Morning",
        "ph_range": "3.0 - 4.5"
    },
    "tranexamic_acid": {
        "canonical_name": "Tranexamic Acid",
        "category": "treatment",
        "aliases": ["tranexamic acid", "txa"],
        "comedogenic_rating": 0,
        "irritation_potential": "Low",
        "functions": ["Inhibits plasmin-induced melanogenesis", "Fades melasma and post-inflammatory erythema (PIE)"],
        "suitable_types": ["All Skin Types", "Sensitive", "Melasma-Prone"],
        "concerns": ["Hyperpigmentation", "Melasma", "Redness", "PIE"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.5 - 7.0"
    },
    "benzoyl_peroxide": {
        "canonical_name": "Benzoyl Peroxide",
        "category": "treatment",
        "aliases": ["benzoyl peroxide", "bpo"],
        "comedogenic_rating": 0,
        "irritation_potential": "High",
        "functions": ["Releases reactive oxygen species to kill Cutibacterium acnes", "Keratolytic"],
        "suitable_types": ["Oily", "Severe Acne-Prone"],
        "concerns": ["Acne", "Inflammatory Papules/Pustules"],
        "time_of_day": "Morning or Evening",
        "ph_range": "4.5 - 6.0"
    },
    # ── HYDRATING SOLVENTS & COMMON CARRIERS ──
    "water": {
        "canonical_name": "Water / Aqua",
        "category": "carrier",
        "aliases": ["water", "aqua", "eau", "purified water", "deionized water", "water/aqua/eau", "aqua/water/eau"],
        "comedogenic_rating": 0,
        "irritation_potential": "None",
        "functions": ["Primary cosmetic solvent", "Hydrating delivery vehicle"],
        "suitable_types": ["All Skin Types"],
        "concerns": [],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.5 - 7.0"
    },
    "glycerin": {
        "canonical_name": "Glycerin",
        "category": "hyaluronic_acid",
        "aliases": ["glycerin", "glycerol", "vegetable glycerin"],
        "comedogenic_rating": 0,
        "irritation_potential": "None",
        "functions": ["Gold standard humectant", "Aquaporin channel hydration", "Stratum corneum restoration"],
        "suitable_types": ["All Skin Types", "Dry", "Sensitive", "Dehydrated"],
        "concerns": ["Dryness", "Dehydration", "Barrier Damage"],
        "time_of_day": "Morning & Evening",
        "ph_range": "5.0 - 7.0"
    },
    "allantoin": {
        "canonical_name": "Allantoin",
        "category": "soothing",
        "aliases": ["allantoin"],
        "comedogenic_rating": 0,
        "irritation_potential": "None",
        "functions": ["Skin protectant", "Erythema soothing", "Cellular proliferation"],
        "suitable_types": ["Sensitive", "All Skin Types"],
        "concerns": ["Redness", "Irritation"],
        "time_of_day": "Morning & Evening",
        "ph_range": "4.5 - 6.5"
    },
    "dimethicone": {
        "canonical_name": "Dimethicone",
        "category": "emollient",
        "aliases": ["dimethicone", "polydimethylsiloxane"],
        "comedogenic_rating": 1,
        "irritation_potential": "None",
        "functions": ["Silicone protective shield", "TEWL reduction", "Silk-smooth texture enhancer"],
        "suitable_types": ["All Skin Types", "Dry", "Compromised Barrier"],
        "concerns": ["Dryness", "Moisture Loss"],
        "time_of_day": "Morning & Evening",
        "ph_range": "N/A"
    },
    "shea_butter": {
        "canonical_name": "Shea Butter (Butyrospermum Parkii)",
        "category": "emollient",
        "aliases": ["butyrospermum parkii", "shea butter", "butyrospermum parkii butter"],
        "comedogenic_rating": 1,
        "irritation_potential": "Low",
        "functions": ["Rich lipid nourishment", "Fatty acid replenishment (stearic/oleic)", "Emollient barrier"],
        "suitable_types": ["Dry", "Very Dry", "Normal"],
        "concerns": ["Dryness", "Flaking"],
        "time_of_day": "Evening",
        "ph_range": "N/A"
    },
    "jojoba_oil": {
        "canonical_name": "Jojoba Seed Oil (Simmondsia Chinensis)",
        "category": "emollient",
        "aliases": ["simmondsia chinensis", "jojoba oil", "jojoba seed oil", "simmondsia chinensis seed oil"],
        "comedogenic_rating": 2,
        "irritation_potential": "Low",
        "functions": ["Biomimetic wax ester", "Natural sebum balancer", "Antioxidant lipid"],
        "suitable_types": ["Normal", "Dry", "Combination", "Oily"],
        "concerns": ["Dryness", "Dehydration"],
        "time_of_day": "Morning & Evening",
        "ph_range": "N/A"
    },
    "rosehip_oil": {
        "canonical_name": "Rosehip Seed Oil (Rosa Canina)",
        "category": "emollient",
        "aliases": ["rosa canina", "rosehip oil", "rosehip seed oil", "rosa canina seed oil"],
        "comedogenic_rating": 1,
        "irritation_potential": "Low",
        "functions": ["Pro-Vitamin A / Trans-retinoic acid trace", "Linoleic acid lipid", "Scar brightening"],
        "suitable_types": ["Normal", "Dry", "Aging", "Combination"],
        "concerns": ["Aging", "Hyperpigmentation", "Dullness"],
        "time_of_day": "Evening",
        "ph_range": "N/A"
    },
    "coconut_oil": {
        "canonical_name": "Coconut Oil (Cocos Nucifera)",
        "category": "emollient",
        "aliases": ["cocos nucifera", "coconut oil", "cocos nucifera oil"],
        "comedogenic_rating": 4,
        "irritation_potential": "Low",
        "functions": ["High lauric acid heavy occlusive emollient"],
        "suitable_types": ["Extremely Dry Body Skin (Contraindicated on Acne-Prone Face)"],
        "concerns": ["Dryness"],
        "time_of_day": "Evening",
        "ph_range": "N/A"
    },
    "isopropyl_myristate": {
        "canonical_name": "Isopropyl Myristate",
        "category": "emollient",
        "aliases": ["isopropyl myristate", "ipm"],
        "comedogenic_rating": 5,
        "irritation_potential": "Low",
        "functions": ["Penetration enhancer", "Ester solvent (High Comedogenic Index)"],
        "suitable_types": ["Non-Acneic Dry Skin"],
        "concerns": [],
        "time_of_day": "Morning & Evening",
        "ph_range": "N/A"
    }
}


# ============================================================================
# 3. ALLERGY & SENSITIZING INGREDIENT TRIGGERS
# ============================================================================

ALLERGEN_CATEGORIES = {
    "salicylates": {
        "name": "Salicylate / Aspirin Allergy",
        "triggers": ["salicylic acid", "salicylate", "salix alba", "willow bark", "betaine salicylate", "acetylsalicylic acid", "wintergreen"],
        "risk_level": "Severe",
        "advice": "Strictly avoid Salicylic Acid (BHA), Willow Bark extracts, and Betaine Salicylate due to cross-reactivity with Aspirin."
    },
    "fragrance": {
        "name": "Synthetic Fragrance & Perfume",
        "triggers": ["fragrance", "parfum", "perfume", "aroma", "flavour", "flavor"],
        "risk_level": "Medium-High",
        "advice": "Fragrance is one of the leading causes of contact dermatitis and sensitization in skincare."
    },
    "essential_oils": {
        "name": "Volatile Essential Oils & Terpenes",
        "triggers": [
            "limonene", "linalool", "geraniol", "citronellol", "eugenol", "citral", "farnesol",
            "lavandula angustifolia", "lavender oil", "melaleuca alternifolia", "tea tree oil",
            "citrus limon", "lemon peel oil", "citrus aurantium", "orange peel oil", "bergamot oil",
            "mentha piperita", "peppermint oil", "eucalyptus globulus", "eucalyptus oil"
        ],
        "risk_level": "Medium",
        "advice": "Natural essential oils contain volatile fragrance allergens that can trigger contact allergies and photosensitivity."
    },
    "drying_alcohols": {
        "name": "Harsh Drying Alcohols",
        "triggers": ["alcohol denat", "sd alcohol", "isopropyl alcohol", "ethanol", "denatured alcohol", "alcohol denat."],
        "risk_level": "Medium",
        "advice": "High concentrations strip the skin's lipid barrier, leading to dehydration and reactive oil overproduction."
    },
    "harsh_sulfates": {
        "name": "Harsh Sulfate Surfactants",
        "triggers": ["sodium lauryl sulfate", "sls", "ammonium lauryl sulfate", "sodium laureth sulfate"],
        "risk_level": "Medium",
        "advice": "Strong surfactants can disrupt the stratum corneum barrier and cause tightness and irritation."
    },
    "nut_allergens": {
        "name": "Nut & Seed Allergens",
        "triggers": [
            "prunus amygdalus dulcis", "almond oil", "macadamia integrifolia", "macadamia oil",
            "arachis hypogaea", "peanut oil", "juglans regia", "walnut extract", "hazelnut oil",
            "sesamum indicum", "sesame seed oil"
        ],
        "risk_level": "Severe",
        "advice": "May trigger severe allergic reactions in individuals with diagnosed tree nut or peanut allergies."
    },
    "sensitizing_preservatives": {
        "name": "Sensitizing Preservatives",
        "triggers": [
            "methylisothiazolinone", "methylchloroisothiazolinone", "dmdm hydantoin",
            "diazolidinyl urea", "imidazolidinyl urea", "quaternium-15", "bronopol"
        ],
        "risk_level": "High",
        "advice": "Known formaldehye-releasing or highly sensitizing preservatives with elevated contact allergy rates."
    }
}


# ============================================================================
# 4. BIOCHEMICAL INTERACTION & CONFLICT MATRIX
# ============================================================================

INTERACTION_RULES = [
    # --- HIGH CONFLICTS (Severe Barrier Damage / Neutralization) ---
    {
        "pair": ("retinoids", "ahas_bhas"),
        "type": "Conflict",
        "severity": "High",
        "title": "Retinoids + Direct Chemical Exfoliants (AHAs/BHAs)",
        "explanation": "Layering Retinoids and direct acids (Glycolic, Salicylic, Lactic) in the same routine over-taxes the stratum corneum, compromising the lipid barrier and causing severe erythema, peeling, and chemical irritation.",
        "recommendation": "Separate by time of day or alternate evenings (e.g., AHAs/BHAs on Monday/Wednesday, Retinoid on Tuesday/Thursday/Friday, with barrier repair nights in between)."
    },
    {
        "pair": ("retinoids", "salicylic_acid"),
        "type": "Conflict",
        "severity": "High",
        "title": "Retinoids + Salicylic Acid (BHA)",
        "explanation": "Both accelerate cellular shedding and follicular clearance. Direct simultaneous layering can cause intense dryness and micro-tears.",
        "recommendation": "Use Salicylic Acid in the Morning (or on alternate nights) and Retinoid in the Evening."
    },
    {
        "pair": ("retinoids", "ascorbic_acid"),
        "type": "Conflict",
        "severity": "Medium-High",
        "title": "Retinoids + Pure L-Ascorbic Acid (Vitamin C)",
        "explanation": "Pure L-Ascorbic Acid requires a very low acidic pH (under 3.5) to penetrate, while Retinol functions best at neutral skin pH (5.5 - 6.5). Combining them simultaneously destabilizes retinoid conversion and spikes skin irritation.",
        "recommendation": "Dermatological Golden Rule: Apply Vitamin C in the Morning (for antioxidant photoprotection) and Retinoid in the Evening (for overnight cellular turnover)."
    },
    {
        "pair": ("retinoids", "benzoyl_peroxide"),
        "type": "Conflict",
        "severity": "High",
        "title": "Retinol / Tretinoin + Benzoyl Peroxide",
        "explanation": "Benzoyl Peroxide is an oxidizing agent that chemically oxidizes and deactivates pure Retinol and Tretinoin molecules, rendering both ineffective while excessively drying the skin (Note: Adapalene is stable with BPO).",
        "recommendation": "Use Benzoyl Peroxide in the Morning and Retinoid in the Evening."
    },
    {
        "pair": ("copper_peptides", "ascorbic_acid"),
        "type": "Conflict",
        "severity": "Medium-High",
        "title": "Copper Peptides + Pure Vitamin C (L-Ascorbic Acid)",
        "explanation": "Copper ions (Cu2+) interact with ascorbic acid, causing mutual chelation and oxidation. This reduces antioxidant capacity and can cause skin discoloration.",
        "recommendation": "Use Vitamin C in the Morning and Copper Peptides in the Evening."
    },
    {
        "pair": ("copper_peptides", "ahas_bhas"),
        "type": "Conflict",
        "severity": "Medium",
        "title": "Copper Peptides + Direct Acids (AHAs/BHAs)",
        "explanation": "Strong acidic environments (low pH below 4.0) break down the peptide bonds and alter the copper complex.",
        "recommendation": "Use direct acids in a separate routine or alternate nights."
    },
    {
        "pair": ("salicylic_acid", "glycolic_acid"),
        "type": "Conflict",
        "severity": "Medium",
        "title": "Multiple Chemical Exfoliants Layering (BHA + AHA)",
        "explanation": "Layering multiple strong leave-on chemical exfoliants simultaneously dramatically increases the risk of acid burns and stratum corneum stripping.",
        "recommendation": "Choose a pre-formulated balanced blend, or use BHA on T-zone for pores and AHA on cheeks on alternate days."
    },

    # --- SYNERGIES (Clinically Proven Power Combos) ---
    {
        "pair": ("vitamin_c", "ferulic_acid"),
        "type": "Synergy",
        "severity": "Positive",
        "title": "Vitamin C + Ferulic Acid (+ Vitamin E)",
        "explanation": "Ferulic Acid stabilizes L-Ascorbic Acid and doubles its photoprotective capability against solar UV damage and atmospheric pollution.",
        "recommendation": "Ideal morning antioxidant cocktail under sunscreen."
    },
    {
        "pair": ("niacinamide", "salicylic_acid"),
        "type": "Synergy",
        "severity": "Positive",
        "title": "Niacinamide + Salicylic Acid (BHA)",
        "explanation": "Salicylic Acid clears deep follicular debris while Niacinamide soothes transient inflammation, regulates sebum production, and visibly tightens pore walls.",
        "recommendation": "Highly recommended for acne-prone, oily, and congested skin."
    },
    {
        "pair": ("hyaluronic_acid", "ceramides"),
        "type": "Synergy",
        "severity": "Positive",
        "title": "Hyaluronic Acid + Ceramides",
        "explanation": "Hyaluronic acid draws high water content into the stratum corneum, and ceramides lock it in by sealing the intercellular lipid matrix.",
        "recommendation": "Apply HA on damp skin first, followed immediately by Ceramide cream."
    },
    {
        "pair": ("retinoids", "ceramides"),
        "type": "Synergy",
        "severity": "Positive",
        "title": "Retinoids + Ceramides / Barrier Lipids",
        "explanation": "Ceramides, cholesterol, and fatty acids buffer retinoid-induced dryness and peeling (retinization), accelerating tolerance building.",
        "recommendation": "Use the 'sandwich method' (Moisturizer -> Retinoid -> Moisturizer) during initial weeks."
    },
    {
        "pair": ("niacinamide", "ceramides"),
        "type": "Synergy",
        "severity": "Positive",
        "title": "Niacinamide + Ceramides",
        "explanation": "Niacinamide stimulates the natural synthesis of ceramides inside the epidermis, creating a compounding barrier-repair effect.",
        "recommendation": "Excellent for sensitive, dry, or barrier-compromised skin."
    },
    {
        "pair": ("retinoids", "peptides"),
        "type": "Synergy",
        "severity": "Positive",
        "title": "Retinoids + Peptides (Matrixyl / Signal Peptides)",
        "explanation": "Retinoids accelerate cellular turnover while signal peptides stimulate deep collagen remodeling from complementary biological pathways.",
        "recommendation": "Great nightly anti-aging regimen."
    },
    {
        "pair": ("vitamin_c", "hyaluronic_acid"),
        "type": "Synergy",
        "severity": "Positive",
        "title": "Vitamin C + Hyaluronic Acid",
        "explanation": "Hyaluronic acid replenishes hydration that can sometimes be depleted by low-pH Vitamin C serums, leaving skin dewy and protected.",
        "recommendation": "Apply Vitamin C serum, allow 1-2 minutes to absorb, then apply Hyaluronic Acid."
    }
]


# ============================================================================
# 5. CORE HELPER FUNCTIONS & ENGINE LOGIC
# ============================================================================

def tokenize_ingredients(raw_text: str) -> List[str]:
    """
    Parses a raw INCI ingredient list string into cleaned, normalized tokens.
    Handles comma separated, semicolon separated, bullet points, and parentheticals.
    """
    if not raw_text or not isinstance(raw_text, str):
        return []

    cleaned = raw_text.strip()
    cleaned = re.sub(r'[\r\n\t•·▪]+', ',', cleaned)
    tokens = re.split(r'[,;|\n]', cleaned)
    
    result = []
    for t in tokens:
        item = t.strip()
        item = re.sub(r'^\d+[\.\)]\s*', '', item)
        if len(item) >= 2:
            result.append(item)
            
    return result


def find_ingredient_match(token: str) -> Optional[Tuple[str, Dict[str, Any]]]:
    """
    Matches an ingredient token against the database using canonical names, keys, and aliases.
    Handles parentheticals, concentrations, and formatting variants.
    """
    if not token or not isinstance(token, str):
        return None

    raw_lower = token.lower().strip()

    # 1. Direct key match (e.g. 'ascorbic_acid', 'copper_peptides', 'salicylic_acid')
    if raw_lower in INGREDIENT_DATABASE:
        return raw_lower, INGREDIENT_DATABASE[raw_lower]

    raw_with_spaces = raw_lower.replace('_', ' ')

    # 2. Normalize token: strip percentages, brackets, extra symbols
    cleaned = re.sub(r'\b\d+(\.\d+)?\s*%\b', '', raw_lower)
    cleaned = re.sub(r'[\(\)\[\]\/\\\|\+]+', ' ', cleaned)
    cleaned = re.sub(r'[^a-z0-9\s\-]', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    if not cleaned:
        return None

    if cleaned in INGREDIENT_DATABASE:
        return cleaned, INGREDIENT_DATABASE[cleaned]

    cleaned_underscore = cleaned.replace(' ', '_')
    if cleaned_underscore in INGREDIENT_DATABASE:
        return cleaned_underscore, INGREDIENT_DATABASE[cleaned_underscore]

    # 3. Check aliases and canonical names
    for key, data in INGREDIENT_DATABASE.items():
        canonical_clean = re.sub(r'[^a-z0-9\s\-]', '', data.get("canonical_name", "").lower()).strip()
        if cleaned == canonical_clean or raw_with_spaces == canonical_clean:
            return key, data

        for alias in data.get("aliases", []):
            clean_alias = re.sub(r'[^a-z0-9\s\-]', '', alias.lower()).strip()
            if not clean_alias:
                continue
            if clean_alias == cleaned or clean_alias == raw_lower or clean_alias == raw_with_spaces:
                return key, data
            # Word-boundary or substring check for distinctive multi-word or long tokens
            if len(clean_alias) >= 4:
                if f" {clean_alias} " in f" {cleaned} " or clean_alias == cleaned:
                    return key, data
                if len(cleaned) >= 5 and (f" {cleaned} " in f" {clean_alias} " or cleaned == clean_alias):
                    return key, data

    return None


def analyze_ingredient_list(ingredients: List[str]) -> Dict[str, Any]:
    """
    Analyzes an ingredient token list, detects core categories, and computes safety metrics.
    """
    matched_ingredients = []
    category_counts = {cat_id: 0 for cat_id in INGREDIENT_CATEGORIES}
    detected_categories = set()
    all_functions = set()
    
    max_comedogenic = 0
    high_irritation_count = 0
    medium_irritation_count = 0

    for token in ingredients:
        match = find_ingredient_match(token)
        if match:
            key, data = match
            cat = data.get("category")
            if cat in category_counts:
                category_counts[cat] += 1
                detected_categories.add(cat)
            
            comedogenic = data.get("comedogenic_rating", 0)
            if comedogenic > max_comedogenic:
                max_comedogenic = comedogenic
                
            irritation = data.get("irritation_potential", "Low")
            if "High" in irritation:
                high_irritation_count += 1
            elif "Medium" in irritation:
                medium_irritation_count += 1

            for f in data.get("functions", []):
                all_functions.add(f)

            matched_ingredients.append({
                "raw_token": token,
                "key": key,
                "canonical_name": data.get("canonical_name", token),
                "category": cat,
                "category_info": INGREDIENT_CATEGORIES.get(cat, {}),
                "comedogenic_rating": comedogenic,
                "irritation_potential": irritation,
                "functions": data.get("functions", []),
                "time_of_day": data.get("time_of_day", "Morning & Evening"),
                "concerns": data.get("concerns", []),
                "suitable_types": data.get("suitable_types", [])
            })
        else:
            # Unmatched token (carrier, standard binder, etc.)
            matched_ingredients.append({
                "raw_token": token,
                "key": None,
                "canonical_name": token.title(),
                "category": "other",
                "category_info": None,
                "comedogenic_rating": 0,
                "irritation_potential": "Low",
                "functions": ["Formulation base / functional additive"],
                "time_of_day": "Morning & Evening",
                "concerns": [],
                "suitable_types": ["All Skin Types"]
            })

    # Overall comedogenic risk label
    if max_comedogenic >= 4:
        comedogenic_risk = "High (Likely to clog pores)"
    elif max_comedogenic >= 2:
        comedogenic_risk = "Moderate (May cause congestion on acne-prone skin)"
    else:
        comedogenic_risk = "Low / Non-Comedogenic (Safe for acne-prone skin)"

    # Overall irritation risk label
    if high_irritation_count >= 2 or (high_irritation_count >= 1 and medium_irritation_count >= 2):
        irritation_risk = "High (Strong active concentration - introduce slowly)"
    elif high_irritation_count == 1 or medium_irritation_count >= 2:
        irritation_risk = "Moderate (May cause mild tingling or dryness)"
    else:
        irritation_risk = "Low / Gentle (Well tolerated by most skin barriers)"

    return {
        "total_ingredients_count": len(ingredients),
        "identified_actives_count": len([i for i in matched_ingredients if i["key"]]),
        "detected_categories": list(detected_categories),
        "detected_category_details": [
            INGREDIENT_CATEGORIES[c] for c in detected_categories if c in INGREDIENT_CATEGORIES
        ],
        "category_counts": category_counts,
        "max_comedogenic_rating": max_comedogenic,
        "comedogenic_risk": comedogenic_risk,
        "irritation_risk": irritation_risk,
        "matched_ingredients": matched_ingredients,
        "all_functions": list(all_functions)
    }


def detect_allergies_and_sensitivities(
    ingredients: List[str],
    user_allergies_str: str = "",
    user_sensitivities_str: str = ""
) -> Dict[str, Any]:
    """
    Checks for exact user allergies, cross-reactivity (like Salicylates with Aspirin),
    and common cosmetic irritants (Fragrance, Drying Alcohols, Essential Oils).
    """
    NON_ALLERGY_PLACEHOLDERS = {
        "none", "no", "n/a", "na", "nil", "nothing", "none known",
        "no allergies", "no known allergies", "not applicable", "unknown"
    }

    user_allergens_raw = f"{user_allergies_str or ''} {user_sensitivities_str or ''}".lower().strip()
    raw_tokens = [t.strip().lower() for t in re.split(r'[,;|\n]', user_allergens_raw) if t.strip()]
    user_allergy_tokens = [t for t in raw_tokens if t not in NON_ALLERGY_PLACEHOLDERS and len(t) >= 3]

    flagged_alerts = []
    has_critical_allergy = False

    # Check for Aspirin/Salicylate sensitivity in user profile
    has_aspirin_allergy = any(
        kw in user_allergens_raw for kw in ["aspirin", "salicylate", "nsaid", "salicylic"]
    ) if any(t in user_allergens_raw for t in ["aspirin", "salicylate", "nsaid", "salicylic"]) else False

    # Check for Nut / Seed allergy
    has_nut_allergy = any(
        kw in user_allergens_raw for kw in ["nut", "almond", "peanut", "tree nut", "macadamia", "walnut", "hazelnut"]
    ) if any(t in user_allergens_raw for t in ["nut", "almond", "peanut", "tree nut", "macadamia", "walnut", "hazelnut"]) else False

    # Check for fragrance sensitivity
    has_fragrance_sensitivity = any(
        kw in user_allergens_raw for kw in ["fragrance", "perfume", "parfum", "scent", "essential oil"]
    ) if any(t in user_allergens_raw for t in ["fragrance", "perfume", "parfum", "scent", "essential oil"]) else False

    for token in ingredients:
        token_lower = token.lower().strip()
        clean_token = re.sub(r'[^a-z0-9\s\-]', ' ', token_lower)
        clean_token = re.sub(r'\s+', ' ', clean_token).strip()

        # 1. Direct User Allergy Token Match
        for allergy_term in user_allergy_tokens:
            clean_term = re.sub(r'[^a-z0-9\s\-]', '', allergy_term).strip()
            if len(clean_term) >= 3:
                pattern = r'\b' + re.escape(clean_term) + r'\b'
                if re.search(pattern, clean_token):
                    flagged_alerts.append({
                        "ingredient": token,
                        "type": "Direct User Allergy Match",
                        "severity": "Critical",
                        "matched_trigger": allergy_term,
                        "message": f"Direct conflict with your recorded allergy: '{allergy_term}'."
                    })
                    has_critical_allergy = True

        # 2. Aspirin Cross-Reactivity
        if has_aspirin_allergy:
            for trig in ALLERGEN_CATEGORIES["salicylates"]["triggers"]:
                pattern = r'\b' + re.escape(trig) + r'\b'
                if re.search(pattern, clean_token) or trig in clean_token:
                    flagged_alerts.append({
                        "ingredient": token,
                        "type": "Cross-Reactive Allergy",
                        "severity": "Critical",
                        "matched_trigger": "Aspirin / Salicylates",
                        "message": "Critical Alert: Cross-reactivity with your Aspirin/Salicylate allergy. Avoid this product."
                    })
                    has_critical_allergy = True
                    break

        # 3. Nut Allergy Cross-Reactivity
        if has_nut_allergy:
            for trig in ALLERGEN_CATEGORIES["nut_allergens"]["triggers"]:
                if trig in clean_token:
                    flagged_alerts.append({
                        "ingredient": token,
                        "type": "Nut Allergen",
                        "severity": "Critical",
                        "matched_trigger": "Tree Nut / Seed",
                        "message": f"Contains nut/seed derivative ({token}) which conflicts with your reported nut allergy."
                    })
                    has_critical_allergy = True
                    break

        # 4. Fragrance / Essential Oils / Drying Alcohols General Scanner
        for cat_key, cat_data in ALLERGEN_CATEGORIES.items():
            if cat_key in ["salicylates", "nut_allergens"]:
                continue
            
            for trig in cat_data["triggers"]:
                if trig in clean_token or trig in token_lower:
                    is_user_sensitive = (cat_key == "fragrance" and has_fragrance_sensitivity)
                    severity = "High" if is_user_sensitive else cat_data["risk_level"]
                    
                    flagged_alerts.append({
                        "ingredient": token,
                        "type": cat_data["name"],
                        "severity": severity,
                        "matched_trigger": trig,
                        "message": cat_data["advice"]
                    })
                    break

    # Deduplicate alerts by (ingredient, type)
    unique_alerts = []
    seen = set()
    for a in flagged_alerts:
        key = (a["ingredient"].lower(), a["type"])
        if key not in seen:
            seen.add(key)
            unique_alerts.append(a)

    return {
        "has_critical_allergy": has_critical_allergy,
        "total_alerts_count": len(unique_alerts),
        "alerts": unique_alerts,
        "safety_summary": (
            "⚠️ CRITICAL ALLERGY CONFLICT DETECTED: Do not use this formula." if has_critical_allergy
            else "Caution: Potential irritants or fragrance detected." if unique_alerts
            else "✅ Safe: No recognized allergens, harsh drying alcohols, or sensitizers detected."
        )
    }


def analyze_interactions(detected_keys_or_categories: List[str]) -> Dict[str, Any]:
    """
    Evaluates biochemical pairwise interactions, identifying conflicts, synergies,
    and routine placement advice (AM vs PM).
    """
    conflicts = []
    synergies = []
    
    effective_entities = set()
    for raw_k in detected_keys_or_categories:
        if not raw_k or not isinstance(raw_k, str):
            continue
        cleaned = raw_k.lower().strip().replace("-", " ")
        cleaned_under = cleaned.replace(" ", "_")
        effective_entities.add(cleaned)
        effective_entities.add(cleaned_under)
        
        if cleaned in INGREDIENT_CATEGORIES:
            effective_entities.add(cleaned)
        if cleaned_under in INGREDIENT_CATEGORIES:
            effective_entities.add(cleaned_under)
            
        match = find_ingredient_match(raw_k)
        if match:
            ing_key, ing_data = match
            effective_entities.add(ing_key)
            cat = ing_data.get("category")
            if cat:
                effective_entities.add(cat)
            if ing_key == "salicylic_acid" or cat == "salicylic_acid":
                effective_entities.add("ahas_bhas")
                effective_entities.add("salicylic_acid")
            if ing_key == "ascorbic_acid" or cat == "vitamin_c":
                effective_entities.add("ascorbic_acid")
                effective_entities.add("vitamin_c")
            if cat == "retinoids":
                effective_entities.add("retinoids")
            if cat == "peptides" or ing_key == "copper_peptides":
                effective_entities.add("peptides")
        elif cleaned_under in INGREDIENT_DATABASE:
            ing_data = INGREDIENT_DATABASE[cleaned_under]
            cat = ing_data.get("category")
            if cat:
                effective_entities.add(cat)
            if cleaned_under == "salicylic_acid" or cat == "salicylic_acid":
                effective_entities.add("ahas_bhas")
                effective_entities.add("salicylic_acid")
            if cleaned_under == "ascorbic_acid" or cat == "vitamin_c":
                effective_entities.add("ascorbic_acid")
                effective_entities.add("vitamin_c")
            if cat == "retinoids":
                effective_entities.add("retinoids")
            if cat == "peptides" or cleaned_under == "copper_peptides":
                effective_entities.add("peptides")

    for rule in INTERACTION_RULES:
        e1, e2 = rule["pair"]
        has_e1 = e1 in effective_entities
        has_e2 = e2 in effective_entities

        if has_e1 and has_e2:
            interaction_data = {
                "title": rule["title"],
                "severity": rule["severity"],
                "explanation": rule["explanation"],
                "recommendation": rule["recommendation"],
                "entities": [e1, e2]
            }
            if rule["type"] == "Conflict":
                conflicts.append(interaction_data)
            else:
                synergies.append(interaction_data)

    routine_advice = []
    if any("retinoids" in c["entities"] and ("ahas_bhas" in c["entities"] or "ascorbic_acid" in c["entities"]) for c in conflicts):
        routine_advice.append("Split your actives: Use Vitamin C/Acids in the Morning and Retinoid in the Evening.")
    if synergies:
        routine_advice.append("Formulation contains clinically synergistic active pairs that boost stability and results.")

    return {
        "has_conflicts": len(conflicts) > 0,
        "conflict_count": len(conflicts),
        "conflicts": conflicts,
        "has_synergies": len(synergies) > 0,
        "synergy_count": len(synergies),
        "synergies": synergies,
        "routine_advice": routine_advice
    }


def assess_ingredient_suitability(
    analyzed_data: Dict[str, Any],
    allergy_data: Dict[str, Any],
    interaction_data: Dict[str, Any],
    skin_type: str = "Normal",
    skin_concerns: List[str] = None,
    skin_health_score: int = 70
) -> Dict[str, Any]:
    """
    Computes a personalized suitability match score (0-100%) and detailed clinical assessment.
    """
    skin_type = (skin_type or "Normal").strip().title()
    skin_concerns = [c.strip().lower() for c in (skin_concerns or []) if c.strip()]
    
    score = 75  # baseline score

    pros = []
    cautions = []

    # 1. Critical Allergy Check
    if allergy_data.get("has_critical_allergy"):
        score = 10
        cautions.append("CRITICAL: Formula contains ingredients matching your severe allergies.")
        return {
            "suitability_score": score,
            "rating": "Avoid (Allergy Conflict)",
            "verdict_badge": "danger",
            "pros": [],
            "cautions": cautions,
            "summary": "This formula is contraindicated due to explicit allergen conflicts with your medical profile."
        }

    # 2. Skin Type Alignment
    matched_ingredients = analyzed_data.get("matched_ingredients", [])
    skin_type_lower = skin_type.lower()

    oily_beneficial_count = 0
    dry_beneficial_count = 0
    sensitive_risk_count = 0

    for item in matched_ingredients:
        suitable_types = [t.lower() for t in item.get("suitable_types", [])]
        if any(skin_type_lower in st for st in suitable_types) or "all skin types" in suitable_types:
            score += 3
        
        if "oily" in skin_type_lower and item.get("category") in ["salicylic_acid", "niacinamide"]:
            oily_beneficial_count += 1
        if "dry" in skin_type_lower and item.get("category") in ["hyaluronic_acid", "ceramides"]:
            dry_beneficial_count += 1
        if "sensitive" in skin_type_lower and item.get("irritation_potential") == "High":
            sensitive_risk_count += 1

    if oily_beneficial_count > 0:
        pros.append(f"Contains {oily_beneficial_count} active(s) targeting excess sebum and pore clarity for oily skin.")
        score += 5

    if dry_beneficial_count > 0:
        pros.append(f"Contains {dry_beneficial_count} barrier-nourishing lipid/humectant(s) ideal for dry skin.")
        score += 5

    if "sensitive" in skin_type_lower:
        if sensitive_risk_count > 0:
            cautions.append(f"Contains {sensitive_risk_count} potent active(s) that may trigger sensitivity. Introduce gradually.")
            score -= (sensitive_risk_count * 8)
        else:
            pros.append("Gentle, non-irritating formulation suitable for sensitive skin.")
            score += 4

    # 3. Comedogenic Penalty for Acne/Oily skin
    max_comedogenic = analyzed_data.get("max_comedogenic_rating", 0)
    has_acne_concern = any("acne" in c or "breakout" in c or "pimple" in c or "pore" in c for c in skin_concerns)
    if (has_acne_concern or "oily" in skin_type_lower) and max_comedogenic >= 3:
        score -= 15
        cautions.append(f"Contains ingredients with higher comedogenic rating ({max_comedogenic}/5) which may clog pores.")

    # 4. Skin Concerns Match
    targeted_concerns_count = 0
    for concern in skin_concerns:
        matched_for_concern = []
        for item in matched_ingredients:
            item_concerns = [c.lower() for c in item.get("concerns", [])]
            if any(concern in ic for ic in item_concerns):
                matched_for_concern.append(item["canonical_name"])
        
        if matched_for_concern:
            targeted_concerns_count += 1
            pros.append(f"Directly addresses '{concern.title()}' with: {', '.join(matched_for_concern[:2])}.")
            score += 6

    # 5. Synergies & Conflicts Adjustment
    synergy_count = interaction_data.get("synergy_count", 0)
    conflict_count = interaction_data.get("conflict_count", 0)
    
    if synergy_count > 0:
        score += min(10, synergy_count * 4)
        pros.append(f"Features {synergy_count} synergistic active combination(s) that amplify benefits.")

    if conflict_count > 0:
        score -= (conflict_count * 12)
        cautions.append(f"Detected {conflict_count} active ingredient conflict(s) that require routine separation.")

    # 6. Normalize Score Range
    score = max(15, min(98, score))

    if score >= 85:
        rating = "Exceptional Match"
        verdict_badge = "success"
        summary = f"This product is outstanding for your {skin_type} skin and directly targets your primary skin goals."
    elif score >= 70:
        rating = "Highly Compatible"
        verdict_badge = "primary"
        summary = f"Great overall compatibility with your {skin_type} profile. Good balance of active benefits."
    elif score >= 50:
        rating = "Use with Caution"
        verdict_badge = "warning"
        summary = "Moderate compatibility. Introduce gradually and be cautious of potential irritation or conflicts."
    else:
        rating = "Not Recommended"
        verdict_badge = "danger"
        summary = "Low compatibility with your current skin condition, barrier tolerance, or active concerns."

    return {
        "suitability_score": score,
        "rating": rating,
        "verdict_badge": verdict_badge,
        "pros": pros,
        "cautions": cautions,
        "summary": summary
    }


# ============================================================================
# 6. UNIFIED MASTER ANALYSIS ENTRYPOINT
# ============================================================================

def generate_ingredient_intelligence_report(
    ingredients_text: str,
    user_profile: Optional[Any] = None,
    custom_profile: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Unified entry point that performs:
    1. INCI Tokenization
    2. Category & Active Analysis (8 Pillars)
    3. Allergy & Sensitivity Detection
    4. Biochemical Interaction Analysis (Conflicts & Synergies)
    5. Personalized Suitability Assessment
    """
    tokens = tokenize_ingredients(ingredients_text)
    if not tokens:
        return {
            "error": "No valid ingredients provided to analyze.",
            "status": "empty"
        }

    skin_type = "Normal"
    concerns = []
    allergies = ""
    sensitivities = ""
    health_score = 70

    if user_profile:
        skin_type = getattr(user_profile, "skin_type", "Normal") or "Normal"
        concerns_raw = getattr(user_profile, "skin_concerns", "") or ""
        concerns = [c.strip() for c in concerns_raw.replace(";", ",").split(",") if c.strip()]
        allergies = getattr(user_profile, "allergies", "") or ""
        sensitivities = getattr(user_profile, "sensitivities", "") or ""
        health_score = getattr(user_profile, "skin_health_score", 70) or 70
    elif custom_profile:
        skin_type = custom_profile.get("skin_type", "Normal")
        concerns = custom_profile.get("concerns", [])
        allergies = custom_profile.get("allergies", "")
        sensitivities = custom_profile.get("sensitivities", "")
        health_score = custom_profile.get("skin_health_score", 70)

    analysis_res = analyze_ingredient_list(tokens)
    allergy_res = detect_allergies_and_sensitivities(tokens, allergies, sensitivities)

    detected_keys = [i["key"] for i in analysis_res["matched_ingredients"] if i["key"]]
    detected_cats = analysis_res["detected_categories"]
    interaction_res = analyze_interactions(detected_keys + detected_cats)

    suitability_res = assess_ingredient_suitability(
        analyzed_data=analysis_res,
        allergy_data=allergy_res,
        interaction_data=interaction_res,
        skin_type=skin_type,
        skin_concerns=concerns,
        skin_health_score=health_score
    )

    return {
        "status": "success",
        "raw_input_summary": {
            "total_tokens_found": len(tokens),
            "tokens_sample": tokens[:10]
        },
        "analysis": analysis_res,
        "allergy_assessment": allergy_res,
        "interaction_assessment": interaction_res,
        "suitability_assessment": suitability_res,
        "user_profile_context": {
            "skin_type": skin_type,
            "concerns": concerns,
            "health_score": health_score
        }
    }


def get_ingredient_categories_catalog() -> List[Dict[str, Any]]:
    """Returns the comprehensive catalog of the 8 core skincare pillars."""
    return list(INGREDIENT_CATEGORIES.values())


def get_ingredient_education(ingredient_or_category_name: str) -> Optional[Dict[str, Any]]:
    """
    Returns in-depth educational dossier for a specific category or ingredient.
    """
    norm = ingredient_or_category_name.lower().strip()

    if norm in INGREDIENT_CATEGORIES:
        cat_data = INGREDIENT_CATEGORIES[norm]
        members = [
            data for key, data in INGREDIENT_DATABASE.items()
            if data.get("category") == norm
        ]
        return {
            "type": "category",
            "details": cat_data,
            "member_actives": members
        }

    match = find_ingredient_match(norm)
    if match:
        key, data = match
        cat = data.get("category")
        return {
            "type": "ingredient",
            "key": key,
            "details": data,
            "category_info": INGREDIENT_CATEGORIES.get(cat)
        }

    return None
