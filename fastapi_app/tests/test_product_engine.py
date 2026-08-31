import sys
import os
import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add fastapi_app directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import Base
from app.models.product import Product
from app.models.assessment import SkinAssessment
from app.engine.product_engine import ProductEngine

# Use in-memory SQLite for isolated test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

class TestProductEngine(unittest.TestCase):

    def setUp(self):
        self.engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
        self.db = TestingSessionLocal()

        # Seed test products across all 7 categories
        test_products = [
            Product(id=1, brand="Himalaya", name="Purifying Neem Facewash", category="Face Wash", active_ingredients="Neem, Turmeric", target_skin_types="Oily, Combination, Acne Prone", target_concerns="Acne, Excess Oil", price=180.0, rating=4.5, reviews_count=3200),
            Product(id=2, brand="La Roche-Posay", name="Effaclar Gel Cleanser", category="Face Wash", active_ingredients="Zinc PCA, Retinol, Glycolic Acid", target_skin_types="Oily, Sensitive", target_concerns="Acne, Pores", price=1499.0, rating=4.6, reviews_count=890),
            Product(id=3, brand="Dot & Key", name="Cica Clay Mask", category="Face Masks", active_ingredients="Cica, Green Clay", target_skin_types="Oily, Combination, Sensitive", target_concerns="Acne, Redness", price=450.0, rating=4.6, reviews_count=920),
            Product(id=4, brand="Minimalist", name="Niacinamide 10% Serum", category="Serum", active_ingredients="Niacinamide, Zinc PCA", target_skin_types="Oily, Combination", target_concerns="Acne, Enlarged Pores", price=599.0, rating=4.7, reviews_count=1240),
            Product(id=5, brand="Dot & Key", name="Watermelon Sunscreen SPF 50", category="Sunscreen", active_ingredients="Zinc Oxide, Hyaluronic Acid", target_skin_types="All Skin Types", target_concerns="UV Protection, Dullness", price=399.0, rating=4.7, reviews_count=980),
            Product(id=6, brand="CeraVe", name="Moisturizing Cream", category="Moisturizer", active_ingredients="Ceramides, Hyaluronic Acid", target_skin_types="Dry, Normal, Sensitive", target_concerns="Dehydration, Barrier Repair", price=1299.0, rating=4.8, reviews_count=2100),
            Product(id=7, brand="Klairs", name="Supple Preparation Toner", category="Toner", active_ingredients="Centella Asiatica, Hyaluronic Acid", target_skin_types="Sensitive, Dry", target_concerns="Dehydration, Redness", price=1430.0, rating=4.8, reviews_count=1540),
            Product(id=8, brand="Minimalist", name="PHA 3% Face Toner", category="Toner", active_ingredients="PHA 3%, Niacinamide", target_skin_types="Sensitive, All Skin Types", target_concerns="Enlarged Pores, Mild Exfoliation", price=399.0, rating=4.6, reviews_count=1120),
            Product(id=9, brand="Paula's Choice", name="2% BHA Liquid Exfoliant", category="Treatment Products", active_ingredients="Salicylic Acid 2%", target_skin_types="Oily, Combination", target_concerns="Blackheads, Acne", price=2700.0, rating=4.9, reviews_count=3400),
            Product(id=10, brand="Minimalist", name="Benzoyl Peroxide 2.5% Spot Treatment", category="Treatment Products", active_ingredients="Benzoyl Peroxide 2.5%", target_skin_types="Oily, Acne Prone", target_concerns="Acne, Blemishes", price=299.0, rating=4.5, reviews_count=840)
        ]
        self.db.add_all(test_products)
        self.db.commit()

    def tearDown(self):
        self.db.close()

    def test_personalized_recommendations(self):
        """Test personalized recommendation engine score calculation & skin profile matching."""
        recs = ProductEngine.get_recommendations_for_user(
            db=self.db,
            skin_type="Oily",
            skin_concerns=["Acne", "Enlarged Pores"]
        )
        self.assertGreater(len(recs), 0)
        self.assertGreaterEqual(recs[0].match_score, recs[-1].match_score)
        for r in recs:
            self.assertIn(r.match_level, ["EXCELLENT_MATCH", "GOOD_MATCH", "MODERATE_MATCH"])
            self.assertTrue(60 <= r.match_score <= 98)

    def test_sensitive_skin_warning(self):
        """Test safety warnings generated for sensitive skin with active exfoliants/retinoids."""
        recs = ProductEngine.get_recommendations_for_user(
            db=self.db,
            skin_type="Sensitive",
            skin_concerns=["Acne"]
        )
        la_roche = next((p for p in recs if p.id == 2), None)
        self.assertIsNotNone(la_roche)
        self.assertGreater(len(la_roche.safety_warnings), 0)
        self.assertIn("patch test", la_roche.safety_warnings[0].lower())

    def test_budget_recommendations_filter(self):
        """Test budget-based filtering (products <= ₹500)."""
        budget_recs = ProductEngine.get_recommendations_for_user(
            db=self.db,
            budget_only=True
        )
        for p in budget_recs:
            self.assertLessEqual(p.price, 500.0)
            self.assertTrue(p.is_budget_friendly)

    def test_category_filtering_all_seven_categories(self):
        """Test filtering across all 7 required product categories."""
        categories_to_test = [
            ("Face Wash", [1, 2]),
            ("Moisturizer", [6]),
            ("Sunscreen", [5]),
            ("Serum", [4]),
            ("Toner", [7, 8]),
            ("Treatment Products", [9, 10]),
            ("Face Masks", [3])
        ]

        for cat_name, expected_ids in categories_to_test:
            recs = ProductEngine.get_all_products(self.db, category=cat_name)
            recs_ids = [p.id for p in recs]
            for eid in expected_ids:
                self.assertIn(eid, recs_ids, f"Expected product {eid} under category '{cat_name}'")

    def test_product_comparison(self):
        """Test side-by-side product comparison matrix calculation."""
        comp = ProductEngine.compare_products(
            db=self.db,
            product_ids=[1, 2, 4, 10],
            skin_type="Oily",
            skin_concerns=["Acne"]
        )

        self.assertEqual(len(comp.products), 4)
        self.assertIsNotNone(comp.best_overall_id)
        self.assertIsNotNone(comp.best_budget_id)
        self.assertTrue(comp.best_budget_id in [1, 10])
        self.assertIn("Compared 4 products", comp.comparison_summary)

    def test_alternative_product_suggestions(self):
        """Test finding alternative product suggestions in the same category."""
        alts = ProductEngine.get_alternative_products(db=self.db, product_id=9)
        self.assertGreater(len(alts), 0)
        self.assertFalse(any(a.id == 9 for a in alts))
        self.assertEqual(alts[0].id, 10)

if __name__ == "__main__":
    unittest.main()
