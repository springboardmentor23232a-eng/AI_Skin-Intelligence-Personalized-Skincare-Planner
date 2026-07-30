package com.wellness.platform.dto;

import com.wellness.platform.entity.DailyActivity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class DailyActivityDto {

    private Long id;

    @NotBlank(message = "Activity name is required")
    private String activityName;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private Integer caloriesBurned = 0;

    @Min(value = 1, message = "Mood score must be between 1 and 10")
    @Max(value = 10, message = "Mood score must be between 1 and 10")
    private Integer moodScore = 5;

    private LocalDate activityDate;
    private String notes;

    public DailyActivityDto() {
    }

    public DailyActivityDto(DailyActivity activity) {
        this.id = activity.getId();
        this.activityName = activity.getActivityName();
        this.durationMinutes = activity.getDurationMinutes();
        this.caloriesBurned = activity.getCaloriesBurned();
        this.moodScore = activity.getMoodScore();
        this.activityDate = activity.getActivityDate();
        this.notes = activity.getNotes();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActivityName() {
        return activityName;
    }

    public void setActivityName(String activityName) {
        this.activityName = activityName;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getCaloriesBurned() {
        return caloriesBurned;
    }

    public void setCaloriesBurned(Integer caloriesBurned) {
        this.caloriesBurned = caloriesBurned;
    }

    public Integer getMoodScore() {
        return moodScore;
    }

    public void setMoodScore(Integer moodScore) {
        this.moodScore = moodScore;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
