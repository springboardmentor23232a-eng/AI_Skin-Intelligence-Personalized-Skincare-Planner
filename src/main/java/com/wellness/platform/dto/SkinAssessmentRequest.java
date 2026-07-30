package com.wellness.platform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SkinAssessmentRequest {

    @NotBlank(message = "Skin type is required")
    private String skinType;

    @NotBlank(message = "Primary concern is required")
    private String primaryConcern;

    @NotBlank(message = "Lifestyle habit is required")
    private String lifestyleHabits;

    @NotBlank(message = "Sleep quality is required")
    private String sleepQuality;

    @NotNull(message = "Water intake in ml is required")
    @Min(value = 500, message = "Water intake must be at least 500ml")
    private Integer waterIntakeMl;

    @NotNull(message = "Routine days per week is required")
    @Min(value = 1, message = "Routine days must be between 1 and 7")
    @Max(value = 7, message = "Routine days must be between 1 and 7")
    private Integer routineDaysPerWeek;

    public SkinAssessmentRequest() {
    }

    public String getSkinType() {
        return skinType;
    }

    public void setSkinType(String skinType) {
        this.skinType = skinType;
    }

    public String getPrimaryConcern() {
        return primaryConcern;
    }

    public void setPrimaryConcern(String primaryConcern) {
        this.primaryConcern = primaryConcern;
    }

    public String getLifestyleHabits() {
        return lifestyleHabits;
    }

    public void setLifestyleHabits(String lifestyleHabits) {
        this.lifestyleHabits = lifestyleHabits;
    }

    public String getSleepQuality() {
        return sleepQuality;
    }

    public void setSleepQuality(String sleepQuality) {
        this.sleepQuality = sleepQuality;
    }

    public Integer getWaterIntakeMl() {
        return waterIntakeMl;
    }

    public void setWaterIntakeMl(Integer waterIntakeMl) {
        this.waterIntakeMl = waterIntakeMl;
    }

    public Integer getRoutineDaysPerWeek() {
        return routineDaysPerWeek;
    }

    public void setRoutineDaysPerWeek(Integer routineDaysPerWeek) {
        this.routineDaysPerWeek = routineDaysPerWeek;
    }
}
