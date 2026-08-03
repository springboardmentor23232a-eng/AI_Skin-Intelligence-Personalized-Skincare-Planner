package com.aiskin.backend.controller;

import com.aiskin.backend.dto.AuthResponse;
import com.aiskin.backend.dto.ChangePasswordRequest;
import com.aiskin.backend.dto.UpdateProfileRequest;
import com.aiskin.backend.dto.UserResponse;
import com.aiskin.backend.entity.User;
import com.aiskin.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Get Logged-in User Details
    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getProvider().name()
        );
    }

    // Update Profile
    @PutMapping("/profile")
    public AuthResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(request.getName());

        userRepository.save(user);

        return new AuthResponse("Profile updated successfully");
    }

    // Change Password
    @PutMapping("/change-password")
    public AuthResponse changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPassword())) {

            return new AuthResponse("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        userRepository.save(user);

        return new AuthResponse("Password changed successfully");
    }
}