package com.wellness.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "skin_assessments")
public class SkillAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_skill", length = 100)
    private String targetSkill;

    @Column(name = "current_proficiency", length = 50)
    private String currentProficiency;

    @Column(name = "primary_goal", length = 100)
    private String primaryGoal;

    @Column(name = "weekly_hours")
    private Integer weeklyHours;

    @Column(name = "wellness_state", length = 50)
    private String wellnessState;

    @Column(name = "assessment_score")
    private Integer assessmentScore;

    @Column(name = "skin_condition_score", nullable = false)
    private Integer skinConditionScore = 75;

    @Column(name = "lifestyle_score", nullable = false)
    private Integer lifestyleScore = 75;

    @Column(name = "sleep_score", nullable = false)
    private Integer sleepScore = 75;

    @Column(name = "routine_consistency_score", nullable = false)
    private Integer routineConsistencyScore = 75;

    @Column(name = "hydration_score", nullable = false)
    private Integer hydrationScore = 75;

    @Column(name = "overall_skin_health_score", nullable = false)
    private Integer overallSkinHealthScore = 78;

    @Column(name = "primary_concern", nullable = false, length = 100)
    private String primaryConcern;

    @Column(name = "ai_diagnosis", nullable = false, columnDefinition = "TEXT")
    private String aiDiagnosis;

    @Column(name = "ai_analysis", columnDefinition = "TEXT")
    private String aiAnalysis;

    @OneToMany(mappedBy = "skillAssessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PersonalizedRecommendation> recommendations = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public SkillAssessment() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public Integer getSkinConditionScore() {
        return skinConditionScore;
    }

    public void setSkinConditionScore(Integer skinConditionScore) {
        this.skinConditionScore = skinConditionScore;
    }

    public Integer getLifestyleScore() {
        return lifestyleScore;
    }

    public void setLifestyleScore(Integer lifestyleScore) {
        this.lifestyleScore = lifestyleScore;
    }

    public Integer getSleepScore() {
        return sleepScore;
    }

    public void setSleepScore(Integer sleepScore) {
        this.sleepScore = sleepScore;
    }

    public Integer getRoutineConsistencyScore() {
        return routineConsistencyScore;
    }

    public void setRoutineConsistencyScore(Integer routineConsistencyScore) {
        this.routineConsistencyScore = routineConsistencyScore;
    }

    public Integer getHydrationScore() {
        return hydrationScore;
    }

    public void setHydrationScore(Integer hydrationScore) {
        this.hydrationScore = hydrationScore;
    }

    public Integer getOverallSkinHealthScore() {
        return overallSkinHealthScore;
    }

    public void setOverallSkinHealthScore(Integer overallSkinHealthScore) {
        this.overallSkinHealthScore = overallSkinHealthScore;
    }

    public String getPrimaryConcern() {
        return primaryConcern;
    }

    public void setPrimaryConcern(String primaryConcern) {
        this.primaryConcern = primaryConcern;
    }

    public String getAiDiagnosis() {
        return aiDiagnosis;
    }

    public void setAiDiagnosis(String aiDiagnosis) {
        this.aiDiagnosis = aiDiagnosis;
    }

    public String getAiAnalysis() {
        return aiAnalysis;
    }

    public void setAiAnalysis(String aiAnalysis) {
        this.aiAnalysis = aiAnalysis;
    }

    public List<PersonalizedRecommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<PersonalizedRecommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public void addRecommendation(PersonalizedRecommendation recommendation) {
        recommendation.setSkillAssessment(this);
        this.recommendations.add(recommendation);
    }

    public void removeRecommendation(PersonalizedRecommendation recommendation) {
        recommendation.setSkillAssessment(null);
        this.recommendations.remove(recommendation);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
