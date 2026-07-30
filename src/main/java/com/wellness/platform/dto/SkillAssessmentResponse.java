package com.wellness.platform.dto;

import com.wellness.platform.entity.SkillAssessment;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class SkillAssessmentResponse {

    private Long id;
    private String targetSkill;
    private String currentProficiency;
    private String primaryGoal;
    private Integer weeklyHours;
    private String wellnessState;
    private Integer assessmentScore;
    private String aiAnalysis;
    private List<PersonalizedRecommendationDto> recommendations;
    private LocalDateTime createdAt;

    public SkillAssessmentResponse() {
    }

    public SkillAssessmentResponse(SkillAssessment assessment) {
        this.id = assessment.getId();
        this.targetSkill = assessment.getTargetSkill();
        this.currentProficiency = assessment.getCurrentProficiency();
        this.primaryGoal = assessment.getPrimaryGoal();
        this.weeklyHours = assessment.getWeeklyHours();
        this.wellnessState = assessment.getWellnessState();
        this.assessmentScore = assessment.getAssessmentScore();
        this.aiAnalysis = assessment.getAiAnalysis();
        if (assessment.getRecommendations() != null) {
            this.recommendations = assessment.getRecommendations().stream()
                    .map(PersonalizedRecommendationDto::new)
                    .collect(Collectors.toList());
        }
        this.createdAt = assessment.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTargetSkill() {
        return targetSkill;
    }

    public void setTargetSkill(String targetSkill) {
        this.targetSkill = targetSkill;
    }

    public String getCurrentProficiency() {
        return currentProficiency;
    }

    public void setCurrentProficiency(String currentProficiency) {
        this.currentProficiency = currentProficiency;
    }

    public String getPrimaryGoal() {
        return primaryGoal;
    }

    public void setPrimaryGoal(String primaryGoal) {
        this.primaryGoal = primaryGoal;
    }

    public Integer getWeeklyHours() {
        return weeklyHours;
    }

    public void setWeeklyHours(Integer weeklyHours) {
        this.weeklyHours = weeklyHours;
    }

    public String getWellnessState() {
        return wellnessState;
    }

    public void setWellnessState(String wellnessState) {
        this.wellnessState = wellnessState;
    }

    public Integer getAssessmentScore() {
        return assessmentScore;
    }

    public void setAssessmentScore(Integer assessmentScore) {
        this.assessmentScore = assessmentScore;
    }

    public String getAiAnalysis() {
        return aiAnalysis;
    }

    public void setAiAnalysis(String aiAnalysis) {
        this.aiAnalysis = aiAnalysis;
    }

    public List<PersonalizedRecommendationDto> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<PersonalizedRecommendationDto> recommendations) {
        this.recommendations = recommendations;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
