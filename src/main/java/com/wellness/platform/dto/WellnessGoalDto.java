package com.wellness.platform.dto;

import com.wellness.platform.entity.GoalCategory;
import com.wellness.platform.entity.GoalStatus;
import com.wellness.platform.entity.WellnessGoal;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class WellnessGoalDto {

    private Long id;

    @NotBlank(message = "Goal title is required")
    private String title;

    @NotNull(message = "Goal category is required")
    private GoalCategory category;

    @NotBlank(message = "Target metric is required")
    private String targetMetric;

    private Integer currentProgress = 0;

    @NotNull(message = "Target value is required")
    @Min(value = 1, message = "Target value must be greater than 0")
    private Integer targetValue;

    @NotBlank(message = "Unit of measurement is required")
    private String unit;

    private GoalStatus status = GoalStatus.IN_PROGRESS;

    private LocalDate targetDate;

    public WellnessGoalDto() {
    }

    public WellnessGoalDto(WellnessGoal goal) {
        this.id = goal.getId();
        this.title = goal.getTitle();
        this.category = goal.getCategory();
        this.targetMetric = goal.getTargetMetric();
        this.currentProgress = goal.getCurrentProgress();
        this.targetValue = goal.getTargetValue();
        this.unit = goal.getUnit();
        this.status = goal.getStatus();
        this.targetDate = goal.getTargetDate();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public GoalCategory getCategory() {
        return category;
    }

    public void setCategory(GoalCategory category) {
        this.category = category;
    }

    public String getTargetMetric() {
        return targetMetric;
    }

    public void setTargetMetric(String targetMetric) {
        this.targetMetric = targetMetric;
    }

    public Integer getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(Integer currentProgress) {
        this.currentProgress = currentProgress;
    }

    public Integer getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(Integer targetValue) {
        this.targetValue = targetValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public GoalStatus getStatus() {
        return status;
    }

    public void setStatus(GoalStatus status) {
        this.status = status;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }
}
