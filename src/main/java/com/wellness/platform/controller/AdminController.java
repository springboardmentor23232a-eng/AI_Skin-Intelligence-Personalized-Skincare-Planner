package com.wellness.platform.controller;

import com.wellness.platform.dto.ApiResponse;
import com.wellness.platform.dto.DashboardAnalyticsDto;
import com.wellness.platform.dto.HealthTipDto;
import com.wellness.platform.dto.UserProfileDto;
import com.wellness.platform.entity.Role;
import com.wellness.platform.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers() {
        List<UserProfileDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        UserProfileDto updated = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", updated));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<DashboardAnalyticsDto>> getAnalytics() {
        DashboardAnalyticsDto analytics = adminService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Platform analytics retrieved successfully", analytics));
    }

    @PostMapping("/tips")
    public ResponseEntity<ApiResponse<HealthTipDto>> createHealthTip(@Valid @RequestBody HealthTipDto tipDto) {
        HealthTipDto created = adminService.createHealthTip(tipDto);
        return new ResponseEntity<>(ApiResponse.success("Health tip created successfully", created), HttpStatus.CREATED);
    }
}
