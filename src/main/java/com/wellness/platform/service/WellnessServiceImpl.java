package com.wellness.platform.service;

import com.wellness.platform.dto.DailyActivityDto;
import com.wellness.platform.dto.HealthTipDto;
import com.wellness.platform.dto.WellnessGoalDto;
import com.wellness.platform.entity.DailyActivity;
import com.wellness.platform.entity.GoalStatus;
import com.wellness.platform.entity.User;
import com.wellness.platform.entity.WellnessGoal;
import com.wellness.platform.exception.ResourceNotFoundException;
import com.wellness.platform.repository.DailyActivityRepository;
import com.wellness.platform.repository.HealthTipRepository;
import com.wellness.platform.repository.UserRepository;
import com.wellness.platform.repository.WellnessGoalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WellnessServiceImpl implements WellnessService {

    private final WellnessGoalRepository goalRepository;
    private final DailyActivityRepository activityRepository;
    private final HealthTipRepository healthTipRepository;
    private final UserRepository userRepository;

    public WellnessServiceImpl(WellnessGoalRepository goalRepository, DailyActivityRepository activityRepository, HealthTipRepository healthTipRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.activityRepository = activityRepository;
        this.healthTipRepository = healthTipRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WellnessGoalDto> getUserGoals(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return goalRepository.findByUserId(user.getId())
                .stream()
                .map(WellnessGoalDto::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WellnessGoalDto createGoal(String userEmail, WellnessGoalDto dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        WellnessGoal goal = new WellnessGoal();
        goal.setUser(user);
        goal.setTitle(dto.getTitle());
        goal.setCategory(dto.getCategory());
        goal.setTargetMetric(dto.getTargetMetric());
        goal.setCurrentProgress(dto.getCurrentProgress() != null ? dto.getCurrentProgress() : 0);
        goal.setTargetValue(dto.getTargetValue());
        goal.setUnit(dto.getUnit());
        goal.setStatus(dto.getStatus() != null ? dto.getStatus() : GoalStatus.IN_PROGRESS);
        goal.setTargetDate(dto.getTargetDate());

        WellnessGoal saved = goalRepository.save(goal);
        return new WellnessGoalDto(saved);
    }

    @Override
    @Transactional
    public WellnessGoalDto updateGoalProgress(String userEmail, Long goalId, Integer newProgress) {
        WellnessGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Wellness goal not found with id: " + goalId));

        goal.setCurrentProgress(newProgress);
        if (newProgress >= goal.getTargetValue()) {
            goal.setStatus(GoalStatus.COMPLETED);
        }

        WellnessGoal updated = goalRepository.save(goal);
        return new WellnessGoalDto(updated);
    }

    @Override
    @Transactional
    public void deleteGoal(String userEmail, Long goalId) {
        WellnessGoal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Wellness goal not found with id: " + goalId));
        goalRepository.delete(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyActivityDto> getUserActivities(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return activityRepository.findByUserIdOrderByActivityDateDesc(user.getId())
                .stream()
                .map(DailyActivityDto::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DailyActivityDto logActivity(String userEmail, DailyActivityDto dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        DailyActivity activity = new DailyActivity();
        activity.setUser(user);
        activity.setActivityName(dto.getActivityName());
        activity.setDurationMinutes(dto.getDurationMinutes());
        activity.setCaloriesBurned(dto.getCaloriesBurned() != null ? dto.getCaloriesBurned() : 0);
        activity.setMoodScore(dto.getMoodScore() != null ? dto.getMoodScore() : 5);
        activity.setActivityDate(dto.getActivityDate());
        activity.setNotes(dto.getNotes());

        DailyActivity saved = activityRepository.save(activity);
        return new DailyActivityDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HealthTipDto> getHealthTips(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        return healthTipRepository.findByTargetRole(user.getRole())
                .stream()
                .map(HealthTipDto::new)
                .collect(Collectors.toList());
    }
}
