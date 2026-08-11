package com.wellness.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "personalized_routines")
public class PersonalizedRoutine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "time_of_day", nullable = false, length = 30)
    private String timeOfDay; // MORNING, EVENING, WEEKLY, SEASONAL

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(nullable = false, length = 50)
    private String category; // CLEANSER, EXFOLIATION, TREATMENT, MOISTURIZER, SUN_PROTECTION, NIGHT_CARE, MASK, SEASONAL_CARE

    @Column(name = "step_name", nullable = false, length = 150)
    private String stepName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "recommended_ingredient", length = 100)
    private String recommendedIngredient;

    @Column(length = 30)
    private String season = "ALL_SEASONS"; // ALL_SEASONS, SUMMER, WINTER, SPRING, AUTUMN

    @Column(name = "created_by_role", length = 30)
    private String createdByRole = "SYSTEM_AI"; // PATIENT, DOCTOR, CONSULTANT, SYSTEM_AI

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PersonalizedRoutine() {
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

    public String getTimeOfDay() {
        return timeOfDay;
    }

    public void setTimeOfDay(String timeOfDay) {
        this.timeOfDay = timeOfDay;
    }

    public Integer getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(Integer stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStepName() {
        return stepName;
    }

    public void setStepName(String stepName) {
        this.stepName = stepName;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getRecommendedIngredient() {
        return recommendedIngredient;
    }

    public void setRecommendedIngredient(String recommendedIngredient) {
        this.recommendedIngredient = recommendedIngredient;
    }

    public String getSeason() {
        return season;
    }

    public void setSeason(String season) {
        this.season = season;
    }

    public String getCreatedByRole() {
        return createdByRole;
    }

    public void setCreatedByRole(String createdByRole) {
        this.createdByRole = createdByRole;
    }

    public String getDoctorNotes() {
        return doctorNotes;
    }

    public void setDoctorNotes(String doctorNotes) {
        this.doctorNotes = doctorNotes;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
