package com.wellness.platform.service;

import com.wellness.platform.dto.AuthResponse;
import com.wellness.platform.dto.LoginRequest;
import com.wellness.platform.dto.RegisterRequest;
import com.wellness.platform.dto.UserProfileDto;

public interface AuthService {
    UserProfileDto register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileDto getCurrentUser(String userEmail);
}
