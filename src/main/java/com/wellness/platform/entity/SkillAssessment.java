package com.wellness.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skin_assessments")
public class SkillAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
