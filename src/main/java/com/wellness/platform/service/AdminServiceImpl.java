package com.wellness.platform.service;

import com.wellness.platform.dto.DashboardAnalyticsDto;
import com.wellness.platform.dto.HealthTipDto;
import com.wellness.platform.dto.UserProfileDto;
import com.wellness.platform.entity.DailyActivity;
import com.wellness.platform.entity.HealthTip;
import com.wellness.platform.entity.Role;
import com.wellness.platform.entity.User;
import com.wellness.platform.exception.ResourceNotFoundException;
import com.wellness.platform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final SkillAssessmentRepository skillAssessmentRepository;
    private final WellnessGoalRepository wellnessGoalRepository;
    private final DailyActivityRepository dailyActivityRepository;
    private final HealthTipRepository healthTipRepository;

    public AdminServiceImpl(UserRepository userRepository, SkillAssessmentRepository skillAssessmentRepository, WellnessGoalRepository wellnessGoalRepository, DailyActivityRepository dailyActivityRepository, HealthTipRepository healthTipRepository) {
        this.userRepository = userRepository;
        this.skillAssessmentRepository = skillAssessmentRepository;
        this.wellnessGoalRepository = wellnessGoalRepository;
        this.dailyActivityRepository = dailyActivityRepository;
        this.healthTipRepository = healthTipRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserProfileDto::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserProfileDto updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setRole(newRole);
        User updated = userRepository.save(user);
        return new UserProfileDto(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardAnalyticsDto getAnalytics() {
        long totalUsers = userRepository.countByRole(Role.USER);
        long totalCoaches = userRepository.countByRole(Role.WELLNESS_COACH);
        long totalAssessments = skillAssessmentRepository.count();
        long totalActiveGoals = wellnessGoalRepository.count();
        long totalActivities = dailyActivityRepository.count();

        double avgMood = dailyActivityRepository.findAll().stream()
                .mapToInt(DailyActivity::getMoodScore)
                .average()
                .orElse(7.5);

        return new DashboardAnalyticsDto(totalUsers, totalCoaches, totalAssessments, totalActiveGoals, Math.round(avgMood * 10.0) / 10.0, totalActivities);
    }

    @Override
    @Transactional
    public HealthTipDto createHealthTip(HealthTipDto tipDto) {
        HealthTip tip = new HealthTip();
        tip.setTitle(tipDto.getTitle());
        tip.setContent(tipDto.getContent());
        tip.setCategory(tipDto.getCategory());
        tip.setTargetRole(tipDto.getTargetRole() != null ? tipDto.getTargetRole() : Role.USER);

        HealthTip saved = healthTipRepository.save(tip);
        return new HealthTipDto(saved);
    }
}
