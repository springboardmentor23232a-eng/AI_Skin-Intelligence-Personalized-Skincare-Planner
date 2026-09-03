import unittest
from app.engine.scoring_engine import SkinHealthScoringEngine
from app.schemas.scoring import ScoreCalculationInput

class TestSkinHealthScoringEngine(unittest.TestCase):

    def test_perfect_score_calculation(self):
        """Test ideal scenario where all parameters are optimal."""
        input_data = ScoreCalculationInput(
            acne_severity="None",
            pigmentation="None",
            dark_spots="None",
            redness_level="None",
            wrinkles="None",
            oiliness="Low",
            dryness="Low",
            stress_level="Low",
            sun_exposure="Low",
            smoking=False,
            alcohol="None",
            sleep_hours=8.5,
            routine_consistency_pct=100.0,
            water_intake_liters=3.0,
            previous_score=90
        )
        res = SkinHealthScoringEngine.calculate_weighted_score(input_data)
        
        # All raw sub-scores should be 100
        self.assertEqual(res.sub_scores["skin_condition"].raw_score, 100)
        self.assertEqual(res.sub_scores["lifestyle"].raw_score, 100)
        self.assertEqual(res.sub_scores["sleep"].raw_score, 100)
        self.assertEqual(res.sub_scores["routine_consistency"].raw_score, 100)
        self.assertEqual(res.sub_scores["hydration"].raw_score, 100)

        # Overall score = 100 * 0.35 + 100 * 0.20 + 100 * 0.15 + 100 * 0.20 + 100 * 0.10 = 100
        self.assertEqual(res.overall_skin_health_score, 100)
        self.assertIn("Optimal", res.score_rating)
        self.assertEqual(res.improvement.delta, 10)

    def test_weighted_formula_calculation(self):
        """Test specific weight calculations (35%, 20%, 15%, 20%, 10%)."""
        input_data = ScoreCalculationInput(
            acne_severity="Moderate",    # Condition score ~80
            pigmentation="None",
            dark_spots="None",
            redness_level="None",
            wrinkles="None",
            oiliness="Low",
            dryness="Low",
            stress_level="Medium",      # Lifestyle avg = (75 + 80 + 100 + 100)/4 = 88.75 -> 89
            sun_exposure="Moderate",
            smoking=False,
            alcohol="None",
            sleep_hours=7.5,            # Sleep score = 90
            routine_consistency_pct=80.0,# Routine score = 80
            water_intake_liters=2.5,     # Hydration score = 90
            previous_score=75
        )
        res = SkinHealthScoringEngine.calculate_weighted_score(input_data)
        
        # Verify sub-scores match
        self.assertEqual(res.sub_scores["skin_condition"].raw_score, 80)
        self.assertEqual(res.sub_scores["sleep"].raw_score, 90)
        self.assertEqual(res.sub_scores["routine_consistency"].raw_score, 80)
        self.assertEqual(res.sub_scores["hydration"].raw_score, 90)

        # 80*0.35 (28) + 89*0.20 (17.8) + 90*0.15 (13.5) + 80*0.20 (16) + 90*0.10 (9) = 84.3 -> round(84.3) = 84
        self.assertTrue(83 <= res.overall_skin_health_score <= 85)
        self.assertTrue(len(res.recommendations) >= 1)

    def test_compromised_barrier_score(self):
        """Test severe symptoms leading to lower health score."""
        input_data = ScoreCalculationInput(
            acne_severity="Severe",
            pigmentation="Severe",
            dark_spots="Severe",
            redness_level="Severe",
            wrinkles="Severe",
            oiliness="High",
            dryness="High",
            stress_level="High",
            sun_exposure="High",
            smoking=True,
            alcohol="Regular",
            sleep_hours=4.5,
            routine_consistency_pct=40.0,
            water_intake_liters=0.8,
            previous_score=50
        )
        res = SkinHealthScoringEngine.calculate_weighted_score(input_data)
        
        self.assertTrue(res.overall_skin_health_score < 50)
        self.assertIn("Compromised", res.score_rating)
        self.assertTrue(len(res.recommendations) >= 3)

if __name__ == "__main__":
    unittest.main()
