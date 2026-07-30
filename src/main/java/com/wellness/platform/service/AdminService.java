package com.wellness.platform.service;

import com.wellness.platform.dto.DashboardAnalyticsDto;
import com.wellness.platform.dto.HealthTipDto;
import com.wellness.platform.dto.UserProfileDto;
import com.wellness.platform.entity.Role;

import java.util.List;

public interface AdminService {
    List<UserProfileDto> getAllUsers();
    UserProfileDto updateUserRole(Long userId, Role newRole);
    void deleteUser(Long userId);
    DashboardAnalyticsDto getAnalytics();
    HealthTipDto createHealthTip(HealthTipDto tipDto);
}
