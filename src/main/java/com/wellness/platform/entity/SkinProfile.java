package com.wellness.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skin_profiles")
public class SkinProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "skin_type", nullable = false, length = 50)
    private String skinType;

    @Column(name = "age_group", nullable = false, length = 30)
    private String ageGroup;

    @Column(name = "skin_concerns", nullable = false, columnDefinition = "TEXT")
    private String skinConcerns;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String sensitivities;

    @Column(name = "lifestyle_habits", length = 100)
    private String lifestyleHabits;

    @Column(name = "sleep_quality", length = 50)
    private String sleepQuality;

    @Column(name = "water_intake_ml")
    private Integer waterIntakeMl = 2000;

    @Column(name = "environmental_exposure", length = 100)
    private String environmentalExposure;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public SkinProfile() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
