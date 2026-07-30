package com.wellness.platform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SkillAssessmentRequest {

    @NotBlank(message = "Target skill is required")
    private String targetSkill;

    @NotBlank(message = "Current proficiency level is required")
    private String currentProficiency;

    @NotBlank(message = "Primary goal is required")
    private String primaryGoal;

    @NotNull(message = "Weekly dedicated hours is required")
    @Min(value = 1, message = "Weekly hours must be at least 1")
    @Max(value = 80, message = "Weekly hours cannot exceed 80")
    private Integer weeklyHours;

    private String wellnessState = "BALANCED";

    public SkillAssessmentRequest() {
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
}
