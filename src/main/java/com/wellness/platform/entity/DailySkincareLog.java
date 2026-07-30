package com.wellness.platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_skincare_logs")
public class DailySkincareLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "morning_routine_completed")
    private Boolean morningRoutineCompleted = false;

    @Column(name = "evening_routine_completed")
    private Boolean eveningRoutineCompleted = false;

    @Column(name = "water_intake_ml")
    private Integer waterIntakeMl = 0;

    @Column(name = "sleep_hours")
    private Double sleepHours = 7.0;

    @Column(name = "skin_condition_rating")
    private Integer skinConditionRating = 5;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DailySkincareLog() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.logDate == null) {
            this.logDate = LocalDate.now();
        }
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

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public Boolean getMorningRoutineCompleted() {
        return morningRoutineCompleted;
    }

    public void setMorningRoutineCompleted(Boolean morningRoutineCompleted) {
        this.morningRoutineCompleted = morningRoutineCompleted;
    }

    public Boolean getEveningRoutineCompleted() {
        return eveningRoutineCompleted;
    }

    public void setEveningRoutineCompleted(Boolean eveningRoutineCompleted) {
        this.eveningRoutineCompleted = eveningRoutineCompleted;
    }

    public Integer getWaterIntakeMl() {
        return waterIntakeMl;
    }

    public void setWaterIntakeMl(Integer waterIntakeMl) {
        this.waterIntakeMl = waterIntakeMl;
    }

    public Double getSleepHours() {
        return sleepHours;
    }

    public void setSleepHours(Double sleepHours) {
        this.sleepHours = sleepHours;
    }

    public Integer getSkinConditionRating() {
        return skinConditionRating;
    }

    public void setSkinConditionRating(Integer skinConditionRating) {
        this.skinConditionRating = skinConditionRating;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
