"""
Ingredient Intelligence Knowledge Base
--------------------------------------
Centralized information for the ingredients supported by Module 5.
"""

INGREDIENT_DATA = {
    "retinoids": {
        "category": "Retinoids",
        "description": "Vitamin A derivatives commonly used in skincare routines.",
        "benefits": [
            "Supports skin renewal",
            "Helps improve the appearance of fine lines and wrinkles",
            "May help with acne-prone skin",
            "Supports more even-looking skin texture",
        ],
        "suitable_for": [
            "Acne Prone",
            "Wrinkles",
            "Fine Lines",
            "Uneven Skin Tone",
        ],
        "cautions": [
            "May cause dryness or irritation",
            "Introduce gradually",
            "Use sun protection during the day",
        ],
        "avoid_with": [
            "AHAs/BHAs",
        ],
    },

    "niacinamide": {
        "category": "Niacinamide",
        "description": "A versatile skincare ingredient commonly used for barrier and oil-balance support.",
        "benefits": [
            "Supports the skin barrier",
            "Helps regulate excess oil",
            "Helps improve the appearance of uneven skin tone",
            "Can support sensitive skin when appropriately formulated",
        ],
        "suitable_for": [
            "Oily Skin",
            "Acne Prone",
            "Sensitive Skin",
            "Uneven Skin Tone",
        ],
        "cautions": [
            "Start with a suitable concentration",
            "Stop use if persistent irritation occurs",
        ],
        "avoid_with": [],
    },

    "vitamin c": {
        "category": "Vitamin C",
        "description": "An antioxidant ingredient commonly used to support brighter-looking skin.",
        "benefits": [
            "Provides antioxidant support",
            "Helps improve the appearance of dark spots",
            "Supports brighter-looking skin",
            "Helps improve the appearance of uneven skin tone",
        ],
        "suitable_for": [
            "Dark Spots",
            "Uneven Skin Tone",
            "Hyperpigmentation",
        ],
        "cautions": [
            "May cause irritation for some sensitive skin types",
            "Introduce gradually if sensitivity is a concern",
        ],
        "avoid_with": [
            "Retinoids",
        ],
    },

    "hyaluronic acid": {
        "category": "Hyaluronic Acid",
        "description": "A hydrating ingredient that helps support the skin's moisture level.",
        "benefits": [
            "Supports skin hydration",
            "Helps reduce the appearance of dryness",
            "Supports a hydrated skin barrier",
        ],
        "suitable_for": [
            "Dry Skin",
            "Dehydration",
            "Mild Dehydration",
            "Sensitive Skin",
        ],
        "cautions": [],
        "avoid_with": [],
    },

    "salicylic acid": {
        "category": "Salicylic Acid",
        "description": "A beta hydroxy acid commonly used for oily and acne-prone skin.",
        "benefits": [
            "Helps remove excess oil",
            "Supports clearer-looking pores",
            "Helps manage acne-prone skin",
        ],
        "suitable_for": [
            "Acne Prone",
            "Oily Skin",
            "Excess Sebum",
            "Blackheads",
            "Pores",
        ],
        "cautions": [
            "May cause dryness or irritation",
            "Use carefully on sensitive skin",
        ],
        "avoid_with": [
            "Retinoids",
            "AHAs/BHAs",
        ],
    },

    "ceramides": {
        "category": "Ceramides",
        "description": "Lipids commonly used to support and maintain the skin barrier.",
        "benefits": [
            "Supports the skin barrier",
            "Helps reduce moisture loss",
            "Supports dry and sensitive skin",
        ],
        "suitable_for": [
            "Dry Skin",
            "Dehydration",
            "Sensitive Skin",
            "Barrier Weakness",
        ],
        "cautions": [],
        "avoid_with": [],
    },

    "peptides": {
        "category": "Peptides",
        "description": "Short chains of amino acids used in skincare formulations for skin-supporting benefits.",
        "benefits": [
            "Supports the appearance of firmer-looking skin",
            "Can complement anti-aging routines",
            "Supports overall skin conditioning",
        ],
        "suitable_for": [
            "Wrinkles",
            "Fine Lines",
            "Mature Skin",
        ],
        "cautions": [],
        "avoid_with": [],
    },

    "ahas/bhas": {
        "category": "AHAs/BHAs",
        "description": "Exfoliating acids used to improve skin texture and remove accumulated dead skin cells.",
        "benefits": [
            "Supports smoother-looking skin",
            "Helps improve skin texture",
            "Supports clearer-looking pores",
            "Can help with uneven-looking skin tone",
        ],
        "suitable_for": [
            "Uneven Skin Tone",
            "Pores",
            "Oily Skin",
            "Dark Spots",
        ],
        "cautions": [
            "May cause dryness or irritation",
            "Avoid excessive exfoliation",
            "Use sun protection during the day",
        ],
        "avoid_with": [
            "Retinoids",
            "Salicylic Acid",
        ],
    },
}


INGREDIENT_ALIASES = {
    "retinol": "retinoids",
    "retinol/retinoids": "retinoids",
    "vitamin c": "vitamin c",
    "ascorbic acid": "vitamin c",
    "hyaluronic acid": "hyaluronic acid",
    "ha": "hyaluronic acid",
    "salicylic acid": "salicylic acid",
    "bha": "salicylic acid",
    "ceramide": "ceramides",
    "ceramides": "ceramides",
    "peptide": "peptides",
    "peptides": "peptides",
    "aha": "ahas/bhas",
    "bhas": "ahas/bhas",
    "ahas/bhas": "ahas/bhas",
}


SUPPORTED_INGREDIENTS = [
    data["category"]
    for data in INGREDIENT_DATA.values()
]