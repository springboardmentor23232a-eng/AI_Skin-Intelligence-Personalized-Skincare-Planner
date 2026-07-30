package com.wellness.platform.service;

import com.wellness.platform.dto.DailyActivityDto;
import com.wellness.platform.dto.HealthTipDto;
import com.wellness.platform.dto.WellnessGoalDto;

import java.util.List;

public interface WellnessService {
    List<WellnessGoalDto> getUserGoals(String userEmail);
    WellnessGoalDto createGoal(String userEmail, WellnessGoalDto dto);
    WellnessGoalDto updateGoalProgress(String userEmail, Long goalId, Integer newProgress);
    void deleteGoal(String userEmail, Long goalId);

    List<DailyActivityDto> getUserActivities(String userEmail);
    DailyActivityDto logActivity(String userEmail, DailyActivityDto dto);

    List<HealthTipDto> getHealthTips(String userEmail);
}
