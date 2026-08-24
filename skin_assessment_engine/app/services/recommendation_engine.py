"""
Module 6: Product Recommendation Engine
Calculates 0-100% suitability match scores, provides personalized product recommendations,
budget-tier filtering, side-by-side comparison, and safer alternative suggestions.
"""

from typing import List, Dict, Any, Optional

# Sample Master Product Catalog covering all 7 categories & 3 budget tiers
PRODUCT_CATALOG: List[Dict[str, Any]] = [
    # 1. Face Wash / Cleanser
    {
        "id": 101,
        "name": "Gentle Hydrating Amino Cleanser",
        "brand": "CeraHydra",
        "category": "Face Wash",
        "price": 14.50,
        "budget_tier": "Budget",
        "rating": 4.8,
        "key_active_ingredients": ["Ceramide NP", "Hyaluronic Acid", "Glycerin"],
        "full_ingredient_list": ["Water", "Sodium Cocoyl Glycinate", "Glycerin", "Ceramide NP", "Sodium Hyaluronate"],
        "target_concerns": ["Dehydration", "Redness", "Barrier Impairment", "Dryness"],
        "suitable_skin_types": ["Dry", "Sensitive", "Combination", "Normal"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300",
        "buy_url": "https://example.com/cerahydra-cleanser"
    },
    {
        "id": 102,
        "name": "Clarifying 2% Salicylic Acid Gel Cleanser",
        "brand": "ClearDerma",
        "category": "Face Wash",
        "price": 24.00,
        "budget_tier": "Mid-Range",
        "rating": 4.7,
        "key_active_ingredients": ["Salicylic Acid", "Zinc PCA", "Green Tea Extract"],
        "full_ingredient_list": ["Water", "Cocamidopropyl Betaine", "Salicylic Acid 2%", "Zinc PCA", "Camellia Sinensis Extract"],
        "target_concerns": ["Acne", "Blackheads", "Oiliness", "Clogged Pores"],
        "suitable_skin_types": ["Oily", "Combination", "Acne-Prone"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300",
        "buy_url": "https://example.com/clearderma-bha-wash"
    },
    {
        "id": 103,
        "name": "Luxury Botanical Barrier Foaming Cleanser",
        "brand": "Botanique Atelier",
        "category": "Face Wash",
        "price": 58.00,
        "budget_tier": "Premium",
        "rating": 4.9,
        "key_active_ingredients": ["Centella Asiatica", "Oat Amino Acids", "Squalane"],
        "full_ingredient_list": ["Water", "Centella Asiatica Extract", "Squalane", "Oat Amino Acids"],
        "target_concerns": ["Dullness", "Sensitivity", "Aging"],
        "suitable_skin_types": ["All", "Normal", "Dry"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1608248597263-00079e96446b?w=300",
        "buy_url": "https://example.com/botanique-cleanser"
    },

    # 2. Moisturizer
    {
        "id": 201,
        "name": "DermaPure Ceramide Barrier Repair Cream",
        "brand": "DermaPure",
        "category": "Moisturizer",
        "price": 18.99,
        "budget_tier": "Budget",
        "rating": 4.9,
        "key_active_ingredients": ["Ceramide NP", "Hyaluronic Acid", "Centella Asiatica"],
        "full_ingredient_list": ["Water", "Glycerin", "Caprylic/Capric Triglyceride", "Ceramide NP", "Centella Extract"],
        "target_concerns": ["Barrier Impairment", "Dryness", "Redness", "Sensitivity"],
        "suitable_skin_types": ["Dry", "Sensitive", "Combination", "Normal"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1608248597263-00079e96446b?w=300",
        "buy_url": "https://example.com/dermapure-moisturizer"
    },
    {
        "id": 202,
        "name": "HydraBalance Oil-Free Water Gel Cream",
        "brand": "PanaceaLab",
        "category": "Moisturizer",
        "price": 32.50,
        "budget_tier": "Mid-Range",
        "rating": 4.8,
        "key_active_ingredients": ["Niacinamide", "Hyaluronic Acid", "Squalane"],
        "full_ingredient_list": ["Water", "Niacinamide 4%", "Sodium Hyaluronate", "Plant Squalane"],
        "target_concerns": ["Oiliness", "Dehydration", "Redness", "Enlarged Pores"],
        "suitable_skin_types": ["Oily", "Combination"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300",
        "buy_url": "https://example.com/panacealab-watergel"
    },
    {
        "id": 203,
        "name": "Cellular Renewal Peptide Rich Emulsion",
        "brand": "Verve Derm",
        "category": "Moisturizer",
        "price": 75.00,
        "budget_tier": "Premium",
        "rating": 4.95,
        "key_active_ingredients": ["Matrixyl 3000", "Ceramide NP", "Bakuchiol"],
        "full_ingredient_list": ["Water", "Palmitoyl Tripeptide-1", "Ceramide NP", "Bakuchiol 1%"],
        "target_concerns": ["Wrinkles", "Fine Lines", "Loss of Elasticity", "Dryness"],
        "suitable_skin_types": ["Aging", "Dry", "Normal"],
        "comedogenic_level": 1,
        "image_url": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300",
        "buy_url": "https://example.com/verve-emulsion"
    },

    # 3. Sunscreen
    {
        "id": 301,
        "name": "Daily Mineral Shield Sunscreen SPF 50",
        "brand": "SunGuard",
        "category": "Sunscreen",
        "price": 16.00,
        "budget_tier": "Budget",
        "rating": 4.7,
        "key_active_ingredients": ["Zinc Oxide 12%", "Niacinamide 2%", "Vitamin E"],
        "full_ingredient_list": ["Zinc Oxide", "Water", "Niacinamide", "Tocopherol"],
        "target_concerns": ["Sun Damage", "Hyperpigmentation", "Redness"],
        "suitable_skin_types": ["All", "Sensitive", "Acne-Prone"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300",
        "buy_url": "https://example.com/sunguard-spf50"
    },
    {
        "id": 302,
        "name": "ShieldFluid Ultra-Light Invisible Sunscreen SPF 50+",
        "brand": "DermaPure",
        "category": "Sunscreen",
        "price": 34.00,
        "budget_tier": "Mid-Range",
        "rating": 4.9,
        "key_active_ingredients": ["Zinc Oxide 15%", "Hyaluronic Acid", "Squalane"],
        "full_ingredient_list": ["Zinc Oxide", "Water", "Hyaluronic Acid", "Squalane"],
        "target_concerns": ["Sun Damage", "Premature Aging", "Dehydration"],
        "suitable_skin_types": ["Combination", "Oily", "Sensitive"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300",
        "buy_url": "https://example.com/shieldfluid-spf"
    },

    # 4. Serum
    {
        "id": 401,
        "name": "10% Niacinamide + 1% Zinc PCA Blemishes Serum",
        "brand": "PureActives",
        "category": "Serum",
        "price": 12.00,
        "budget_tier": "Budget",
        "rating": 4.8,
        "key_active_ingredients": ["Niacinamide", "Zinc PCA"],
        "full_ingredient_list": ["Water", "Niacinamide 10%", "Zinc PCA 1%"],
        "target_concerns": ["Acne", "Oiliness", "Enlarged Pores", "Redness"],
        "suitable_skin_types": ["Oily", "Combination", "Acne-Prone"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300",
        "buy_url": "https://example.com/pureactives-niacinamide"
    },
    {
        "id": 402,
        "name": "15% Vitamin C + Ferulic Brightening Serum",
        "brand": "RadianceLab",
        "category": "Serum",
        "price": 42.00,
        "budget_tier": "Mid-Range",
        "rating": 4.85,
        "key_active_ingredients": ["L-Ascorbic Acid", "Ferulic Acid", "Vitamin E"],
        "full_ingredient_list": ["Water", "L-Ascorbic Acid 15%", "Ferulic Acid 0.5%", "Tocopherol"],
        "target_concerns": ["Hyperpigmentation", "Dark Spots", "Dullness", "Sun Damage"],
        "suitable_skin_types": ["Normal", "Combination", "Dry"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300",
        "buy_url": "https://example.com/radiancelab-vitc"
    },
    {
        "id": 403,
        "name": "Multi-Peptide Matrixyl 3000 Youth Serum",
        "brand": "BioElite Derm",
        "category": "Serum",
        "price": 82.00,
        "budget_tier": "Premium",
        "rating": 4.95,
        "key_active_ingredients": ["Matrixyl 3000", "Hyaluronic Acid", "Copper Tripeptide-1"],
        "full_ingredient_list": ["Water", "Palmitoyl Tripeptide-1", "Copper Tripeptide-1", "Hyaluronic Acid"],
        "target_concerns": ["Wrinkles", "Fine Lines", "Sagging Skin", "Dehydration"],
        "suitable_skin_types": ["Aging", "Dry", "Normal"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300",
        "buy_url": "https://example.com/bioelite-peptides"
    },

    # 5. Toner
    {
        "id": 501,
        "name": "Cica Hydrating Soothing Toner Essence",
        "brand": "PureCica",
        "category": "Toner",
        "price": 17.50,
        "budget_tier": "Budget",
        "rating": 4.75,
        "key_active_ingredients": ["Centella Asiatica", "Hyaluronic Acid", "Panthenol"],
        "full_ingredient_list": ["Water", "Centella Asiatica Extract 80%", "Panthenol", "Hyaluronic Acid"],
        "target_concerns": ["Redness", "Dehydration", "Sensitivity"],
        "suitable_skin_types": ["All", "Sensitive", "Dry"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300",
        "buy_url": "https://example.com/purecica-toner"
    },
    {
        "id": 502,
        "name": "7% Glycolic Acid Exfoliating Glow Solution",
        "brand": "AHA Derm",
        "category": "Toner",
        "price": 28.00,
        "budget_tier": "Mid-Range",
        "rating": 4.7,
        "key_active_ingredients": ["Glycolic Acid", "Aloe Vera", "Glycerin"],
        "full_ingredient_list": ["Water", "Glycolic Acid 7%", "Aloe Barbadensis Leaf Water"],
        "target_concerns": ["Dullness", "Rough Texture", "Uneven Skin Tone"],
        "suitable_skin_types": ["Normal", "Combination", "Oily"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300",
        "buy_url": "https://example.com/ahaderm-glycolic"
    },

    # 6. Treatment Products
    {
        "id": 601,
        "name": "0.3% Encapsulated Retinol Renewal Treatment",
        "brand": "NightRenewal",
        "category": "Treatment Products",
        "price": 38.00,
        "budget_tier": "Mid-Range",
        "rating": 4.85,
        "key_active_ingredients": ["Retinol", "Bakuchiol", "Ceramide NP"],
        "full_ingredient_list": ["Water", "Encapsulated Retinol 0.3%", "Bakuchiol", "Ceramide NP"],
        "target_concerns": ["Fine Lines", "Wrinkles", "Acne", "Hyperpigmentation"],
        "suitable_skin_types": ["Normal", "Oily", "Combination"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300",
        "buy_url": "https://example.com/nightrenewal-retinol"
    },

    # 7. Face Masks
    {
        "id": 701,
        "name": "Overnight Ceramide & Cica Recovery Sleeping Mask",
        "brand": "Restora",
        "category": "Face Masks",
        "price": 26.00,
        "budget_tier": "Mid-Range",
        "rating": 4.9,
        "key_active_ingredients": ["Ceramide NP", "Centella Asiatica", "Squalane"],
        "full_ingredient_list": ["Water", "Ceramide NP", "Centella Asiatica Extract", "Squalane"],
        "target_concerns": ["Barrier Impairment", "Dehydration", "Dryness", "Redness"],
        "suitable_skin_types": ["Dry", "Sensitive", "Combination"],
        "comedogenic_level": 0,
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300",
        "buy_url": "https://example.com/restora-mask"
    }
]


class RecommendationEngine:
    """Business logic for Module 6 Product Recommendation Engine"""

    def calculate_suitability_score(
        self,
        product: Dict[str, Any],
        skin_type: str = "Combination",
        active_concerns: Optional[List[str]] = None,
        allergies: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Calculates 0-100% product suitability score based on skin fit, active match, and allergen safety"""
        active_concerns = active_concerns or []
        allergies = allergies or []

        score = 70.0 # Base score
        pros = []
        cons = []
        badge = "Good Match"

        # 1. Skin Type Match (+15 pts or -20 pts)
        suitable_types = product.get("suitable_skin_types", [])
        if skin_type in suitable_types or "All" in suitable_types:
            score += 15.0
            pros.append(f"Formulated for {skin_type} skin")
        else:
            score -= 15.0
            cons.append(f"Less optimal for {skin_type} skin type")

        # 2. Concern Target Match (+20 pts max)
        target_concerns = product.get("target_concerns", [])
        matched_concerns = [c for c in active_concerns if any(c.lower() in tc.lower() for tc in target_concerns)]
        if matched_concerns:
            score += min(len(matched_concerns) * 10.0, 20.0)
            pros.append(f"Targets user concern: {', '.join(matched_concerns)}")

        # 3. Allergen Safety Check (-50 pts if allergen detected)
        full_ingredients = [ing.lower() for ing in product.get("full_ingredient_list", [])]
        flagged = []
        for alg in allergies:
            if any(alg.lower() in ing for ing in full_ingredients):
                flagged.append(alg)

        if flagged:
            score -= 50.0
            cons.append(f"Contains flagged allergen: {', '.join(flagged)}")
            badge = "⚠️ Allergen Warning"
        elif score >= 90.0:
            badge = "Top Match 🌟"
        elif score >= 80.0:
            badge = "Great Choice ✨"
        else:
            badge = "Compatible 👍"

        final_score = max(min(round(score, 1), 100.0), 0.0)

        match_tier = "Top Match" if final_score >= 90 else ("Great Choice" if final_score >= 80 else "Compatible")
        reason = f"Scored {final_score}% match based on active ingredient fit and skin barrier safety."

        return {
            "suitability_score": final_score,
            "match_tier": match_tier,
            "badge": badge,
            "reason": reason,
            "pros": pros if pros else ["Safe standard skincare formula"],
            "cons": cons if cons else ["No major drawbacks detected"]
        }

    def recommend_products(
        self,
        category: Optional[str] = None,
        budget_tier: Optional[str] = None,
        max_price: Optional[float] = None,
        skin_type: str = "Combination",
        active_concerns: Optional[List[str]] = None,
        allergies: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Filters catalog and returns ranked recommendations with suitability scores"""
        results = []

        for prod in PRODUCT_CATALOG:
            # Filter by Category
            if category and category.lower() != "all" and prod["category"].lower() != category.lower():
                continue

            # Filter by Budget Tier
            if budget_tier and budget_tier.lower() != "all" and prod["budget_tier"].lower() != budget_tier.lower():
                continue

            # Filter by Max Price
            if max_price and prod["price"] > max_price:
                continue

            eval_res = self.calculate_suitability_score(
                product=prod,
                skin_type=skin_type,
                active_concerns=active_concerns,
                allergies=allergies
            )

            results.append({
                "product": prod,
                "suitability_score": eval_res["suitability_score"],
                "match_tier": eval_res["match_tier"],
                "badge": eval_res["badge"],
                "reason": eval_res["reason"],
                "pros": eval_res["pros"],
                "cons": eval_res["cons"]
            })

        # Sort by suitability score descending, then product rating
        results.sort(key=lambda x: (x["suitability_score"], x["product"]["rating"]), reverse=True)
        return results[:limit]

    def compare_products(
        self,
        product_ids: List[int],
        skin_type: str = "Combination",
        allergies: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Compares multiple products side-by-side"""
        comparison_matrix = []
        highest_score = -1.0
        winner_name = None

        for pid in product_ids:
            prod = next((p for p in PRODUCT_CATALOG if p["id"] == pid), None)
            if not prod:
                continue

            eval_res = self.calculate_suitability_score(
                product=prod,
                skin_type=skin_type,
                allergies=allergies
            )

            score = eval_res["suitability_score"]
            if score > highest_score:
                highest_score = score
                winner_name = prod["name"]

            comparison_matrix.append({
                "product": prod,
                "suitability_score": score,
                "key_actives": prod["key_active_ingredients"],
                "target_concerns": prod["target_concerns"],
                "allergen_safe": len(eval_res["cons"]) == 0 or "Allergen" not in eval_res["badge"],
                "price_formatted": f"${prod['price']:.2f}",
                "pros": eval_res["pros"]
            })

        return {
            "success": True,
            "products_compared": len(comparison_matrix),
            "comparison_matrix": comparison_matrix,
            "winner_recommendation": f"🏆 Best Choice: {winner_name} ({highest_score}% Match)" if winner_name else "N/A"
        }

    def suggest_alternatives(
        self,
        product_id: int,
        skin_type: str = "Combination",
        allergies: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Suggests safer/higher-scoring alternatives for a product"""
        target_prod = next((p for p in PRODUCT_CATALOG if p["id"] == product_id), None)
        if not target_prod:
            return {"success": False, "message": f"Product ID {product_id} not found."}

        category = target_prod["category"]
        all_recs = self.recommend_products(
            category=category,
            skin_type=skin_type,
            allergies=allergies,
            limit=5
        )

        # Exclude the original product from alternatives
        alternatives = [r for r in all_recs if r["product"]["id"] != product_id]

        return {
            "success": True,
            "original_product_id": product_id,
            "original_product_name": target_prod["name"],
            "issue_flagged": "Potential allergen or non-optimal skin type fit",
            "safer_alternatives": alternatives
        }


# Singleton instance
recommendation_engine = RecommendationEngine()
