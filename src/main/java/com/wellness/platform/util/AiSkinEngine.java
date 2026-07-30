package com.wellness.platform.util;

import com.wellness.platform.entity.PersonalizedRoutine;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AiSkinEngine {

    public static class SkinDiagnosisResult {
        private final int overallScore;
        private final int conditionScore;
        private final int lifestyleScore;
        private final int sleepScore;
        private final int routineScore;
        private final int hydrationScore;
        private final String diagnosisText;
        private final List<PersonalizedRoutine> generatedRoutines;

        public SkinDiagnosisResult(int overallScore, int conditionScore, int lifestyleScore, int sleepScore, int routineScore, int hydrationScore, String diagnosisText, List<PersonalizedRoutine> generatedRoutines) {
            this.overallScore = overallScore;
            this.conditionScore = conditionScore;
            this.lifestyleScore = lifestyleScore;
            this.sleepScore = sleepScore;
            this.routineScore = routineScore;
            this.hydrationScore = hydrationScore;
            this.diagnosisText = diagnosisText;
            this.generatedRoutines = generatedRoutines;
        }

        public int getOverallScore() { return overallScore; }
        public int getConditionScore() { return conditionScore; }
        public int getLifestyleScore() { return lifestyleScore; }
        public int getSleepScore() { return sleepScore; }
        public int getRoutineScore() { return routineScore; }
        public int getHydrationScore() { return hydrationScore; }
        public String getDiagnosisText() { return diagnosisText; }
        public List<PersonalizedRoutine> getGeneratedRoutines() { return generatedRoutines; }
    }

    public SkinDiagnosisResult analyzeSkinProfile(
            String skinType,
            String primaryConcern,
            String lifestyle,
            String sleepQuality,
            int waterIntakeMl,
            int routineDaysPerWeek
    ) {
        // Weighted Scoring Model from Blueprint:
        // Skin Condition Assessment (35%) + Lifestyle Habits (20%) + Sleep Quality (15%) + Routine Consistency (20%) + Hydration Level (10%)
        
        int conditionScore = switch (primaryConcern.toUpperCase()) {
            case "NONE", "GLOW" -> 95;
            case "DRYNESS", "FINE LINES" -> 80;
            case "HYPERPIGMENTATION", "UNEVEN TONE" -> 70;
            case "ACNE", "REDNESS" -> 60;
            default -> 75;
        };

        int lifestyleScore = switch (lifestyle.toUpperCase()) {
            case "BALANCED", "HEALTHY" -> 90;
            case "HIGH SCREEN TIME", "URBAN POLLUTION" -> 70;
            case "HIGH STRESS", "FREQUENT TRAVEL" -> 60;
            default -> 75;
        };

        int sleepScore = switch (sleepQuality.toUpperCase()) {
            case "EXCELLENT" -> 95;
            case "GOOD" -> 85;
            case "AVERAGE" -> 70;
            case "POOR" -> 50;
            default -> 75;
        };

        int routineScore = Math.min(100, Math.max(20, routineDaysPerWeek * 14));

        int hydrationScore = Math.min(100, Math.max(30, (waterIntakeMl * 100) / 3000));

        // Weighted Overall Calculation
        double rawOverall = (conditionScore * 0.35) +
                            (lifestyleScore * 0.20) +
                            (sleepScore * 0.15) +
                            (routineScore * 0.20) +
                            (hydrationScore * 0.10);

        int overallScore = (int) Math.round(rawOverall);

        StringBuilder aiDiagnosis = new StringBuilder();
        aiDiagnosis.append("AI Skin Intelligence Diagnosis:\n");
        aiDiagnosis.append("• Overall Skin Health Index: ").append(overallScore).append("/100.\n");
        aiDiagnosis.append("• Breakdown: Skin Condition (").append(conditionScore).append(" x35%) | ");
        aiDiagnosis.append("Lifestyle (").append(lifestyleScore).append(" x20%) | ");
        aiDiagnosis.append("Sleep (").append(sleepScore).append(" x15%) | ");
        aiDiagnosis.append("Routine Consistency (").append(routineScore).append(" x20%) | ");
        aiDiagnosis.append("Hydration (").append(hydrationScore).append(" x10%).\n\n");
        aiDiagnosis.append("Primary Concern: ").append(primaryConcern).append(" (Skin Type: ").append(skinType).append(").\n");

        if (hydrationScore < 70) {
            aiDiagnosis.append("Recommendation: Increase daily water intake to at least 2,500ml to improve cell turgor and moisture barrier elasticity.");
        } else if (routineScore < 70) {
            aiDiagnosis.append("Recommendation: Consistency is key. Follow your Morning AM and Evening PM routines at least 6 days a week.");
        } else {
            aiDiagnosis.append("Recommendation: Excellent skin wellness balance. Maintain barrier protection with daily SPF 46+ and evening barrier repair cream.");
        }

        List<PersonalizedRoutine> routines = new ArrayList<>();

        // Morning AM Routine
        PersonalizedRoutine am1 = new PersonalizedRoutine();
        am1.setTimeOfDay("MORNING");
        am1.setStepNumber(1);
        am1.setCategory("CLEANSING");
        am1.setStepName("Gentle Hydrating Cleanser");
        am1.setInstructions("Cleanse damp face gently for 60 seconds with lukewarm water.");
        am1.setRecommendedIngredient("Ceramides");
        routines.add(am1);

        PersonalizedRoutine am2 = new PersonalizedRoutine();
        am2.setTimeOfDay("MORNING");
        am2.setStepNumber(2);
        am2.setCategory("TREATMENT");
        am2.setStepName("Brightening & Pore Serum");
        am2.setInstructions("Apply 3-4 drops to calm redness and control sebum production.");
        am2.setRecommendedIngredient("Niacinamide");
        routines.add(am2);

        PersonalizedRoutine am3 = new PersonalizedRoutine();
        am3.setTimeOfDay("MORNING");
        am3.setStepNumber(3);
        am3.setCategory("SUN_PROTECTION");
        am3.setStepName("Broad-Spectrum Sunscreen SPF 46+");
        am3.setInstructions("Apply liberally as final morning step to protect against UV and urban pollution.");
        am3.setRecommendedIngredient("Zinc Oxide & Niacinamide");
        routines.add(am3);

        // Evening PM Routine
        PersonalizedRoutine pm1 = new PersonalizedRoutine();
        pm1.setTimeOfDay("EVENING");
        pm1.setStepNumber(1);
        pm1.setCategory("CLEANSING");
        pm1.setStepName("Double Cleansing Protocol");
        pm1.setInstructions("First remove sunscreen with oil/micellar water, followed by a gentle cleanser.");
        pm1.setRecommendedIngredient("Micellar Technology");
        routines.add(pm1);

        PersonalizedRoutine pm2 = new PersonalizedRoutine();
        pm2.setTimeOfDay("EVENING");
        pm2.setStepNumber(2);
        pm2.setCategory("NIGHT_CARE");
        pm2.setStepName("Cellular Barrier Repair Night Cream");
        pm2.setInstructions("Smooth nourishing night cream over face and neck for deep overnight recovery.");
        pm2.setRecommendedIngredient("Ceramides & Hyaluronic Acid");
        routines.add(pm2);

        return new SkinDiagnosisResult(overallScore, conditionScore, lifestyleScore, sleepScore, routineScore, hydrationScore, aiDiagnosis.toString(), routines);
    }
}
