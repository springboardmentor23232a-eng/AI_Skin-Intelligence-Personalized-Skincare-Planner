package com.wellness.platform.dto;

import com.wellness.platform.entity.SkinProfile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SkinProfileDto {

    private Long id;

    @NotBlank(message = "Skin type is required (Oily, Dry, Combination, Sensitive, Normal)")
    private String skinType;

    @NotBlank(message = "Age group is required")
    private String ageGroup;

    @NotBlank(message = "Skin concerns are required")
    private String skinConcerns;

    private String allergies;
    private String sensitivities;
    private String lifestyleHabits;
    private String sleepQuality;

    @NotNull(message = "Water intake in ml is required")
    private Integer waterIntakeMl = 2000;

    private String environmentalExposure;

    public SkinProfileDto() {
    }

    public SkinProfileDto(SkinProfile profile) {
        this.id = profile.getId();
        this.skinType = profile.getSkinType();
        this.ageGroup = profile.getAgeGroup();
        this.skinConcerns = profile.getSkinConcerns();
        this.allergies = profile.getAllergies();
        this.sensitivities = profile.getSensitivities();
        this.lifestyleHabits = profile.getLifestyleHabits();
        this.sleepQuality = profile.getSleepQuality();
        this.waterIntakeMl = profile.getWaterIntakeMl();
        this.environmentalExposure = profile.getEnvironmentalExposure();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSkinType() {
        return skinType;
    }

    public void setSkinType(String skinType) {
        this.skinType = skinType;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public void setAgeGroup(String ageGroup) {
        this.ageGroup = ageGroup;
    }

    public String getSkinConcerns() {
        return skinConcerns;
    }

    public void setSkinConcerns(String skinConcerns) {
        this.skinConcerns = skinConcerns;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getSensitivities() {
        return sensitivities;
    }

    public void setSensitivities(String sensitivities) {
        this.sensitivities = sensitivities;
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

    public String getEnvironmentalExposure() {
        return environmentalExposure;
    }

    public void setEnvironmentalExposure(String environmentalExposure) {
        this.environmentalExposure = environmentalExposure;
    }
}
