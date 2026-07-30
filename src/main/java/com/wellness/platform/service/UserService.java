package com.wellness.platform.service;

import com.wellness.platform.dto.ChangePasswordRequest;
import com.wellness.platform.dto.UpdateProfileRequest;
import com.wellness.platform.dto.UserProfileDto;

public interface UserService {
    UserProfileDto getProfile(String email);
    UserProfileDto updateProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
}
