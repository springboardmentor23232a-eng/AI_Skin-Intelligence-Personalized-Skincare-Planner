package com.wellness.platform.util;

import com.wellness.platform.dto.SkillAssessmentRequest;
import com.wellness.platform.entity.PersonalizedRecommendation;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class AiSkillEngine {

    public static class AiAnalysisResult {
        private final int score;
        private final String analysisText;
        private final List<PersonalizedRecommendation> recommendations;

        public AiAnalysisResult(int score, String analysisText, List<PersonalizedRecommendation> recommendations) {
            this.score = score;
            this.analysisText = analysisText;
            this.recommendations = recommendations;
        }

        public int getScore() {
            return score;
        }

        public String getAnalysisText() {
            return analysisText;
        }

        public List<PersonalizedRecommendation> getRecommendations() {
            return recommendations;
        }
    }

    public AiAnalysisResult analyzeSkill(SkillAssessmentRequest request) {
        String skill = request.getTargetSkill();
        String level = request.getCurrentProficiency().toUpperCase();
        int hours = request.getWeeklyHours();
        String wellness = request.getWellnessState() != null ? request.getWellnessState().toUpperCase() : "BALANCED";

        int baseScore = switch (level) {
            case "BEGINNER" -> 35;
            case "INTERMEDIATE" -> 60;
            case "ADVANCED" -> 85;
            default -> 50;
        };

        // Add bonus based on weekly committed hours
        int hourBonus = Math.min(20, hours * 2);
        int finalScore = Math.min(98, baseScore + hourBonus);

        StringBuilder analysis = new StringBuilder();
        analysis.append("AI Skill Intelligence Diagnosis for ").append(skill).append(":\n");
        analysis.append("• Current Skill Baseline: ").append(level).append(" (Assessment Index: ").append(finalScore).append("/100).\n");
        analysis.append("• Weekly Time Commitment: ").append(hours).append(" hours per week allocated.\n");
        analysis.append("• Bio-Cognitive Balance Status: ").append(wellness).append(".\n\n");

        if (hours < 5) {
            analysis.append("Recommendation: Increasing your dedicated deliberate practice by 2-3 hours weekly will double your skill retention curve.");
        } else if (hours > 25) {
            analysis.append("Recommendation: High-intensity regimen detected. Incorporate structured micro-rest intervals to prevent mental burnout and cognitive overload.");
        } else {
            analysis.append("Recommendation: Optimal steady-state learning pace detected. Consistency over intensity will produce continuous compounding mastery.");
        }

        List<PersonalizedRecommendation> recommendations = new ArrayList<>();

        // 1. Skill Mastery Core Recommendation
        recommendations.add(new PersonalizedRecommendation(
                "SKILL_MASTERY",
                "Deliberate Practice Architecture: " + skill,
                "Structure your " + hours + " weekly hours into 50-minute focused sprint blocks followed by 10-minute active recovery breaks.",
                "HIGH",
                "https://roadmap.sh"
        ));

        // 2. Cognitive & Mental Wellness Integration
        recommendations.add(new PersonalizedRecommendation(
                "MENTAL_WELLNESS",
                "Cognitive Reset Protocol",
                "Practice 5 minutes of box breathing (4-4-4-4 technique) before starting intensive " + skill + " learning sessions to optimize focus.",
                "MEDIUM",
                "https://www.headspace.com"
        ));

        // 3. Physical & Ergonomic Support
        recommendations.add(new PersonalizedRecommendation(
                "PHYSICAL_HEALTH",
                "Postural & Eye Strain Prevention",
                "Implement the 20-20-20 rule during screen-heavy learning: Every 20 minutes, look at an object 20 feet away for 20 seconds.",
                "HIGH",
                "https://www.healthline.com"
        ));

        // 4. Milestone Tracking Strategy
        recommendations.add(new PersonalizedRecommendation(
                "STRATEGY",
                "Weekly Capstone Project Challenge",
                "Build one mini-project or write a summary post every Sunday demonstrating your progress in " + skill + ".",
                "MEDIUM",
                "https://github.com"
        ));

        return new AiAnalysisResult(finalScore, analysis.toString(), recommendations);
    }
}
