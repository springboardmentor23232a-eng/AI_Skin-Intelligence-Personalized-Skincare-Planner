package com.wellness.platform.controller;

import com.wellness.platform.dto.ApiResponse;
import com.wellness.platform.dto.DailyActivityDto;
import com.wellness.platform.dto.HealthTipDto;
import com.wellness.platform.dto.WellnessGoalDto;
import com.wellness.platform.service.WellnessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wellness")
public class WellnessController {

    private final WellnessService wellnessService;

    public WellnessController(WellnessService wellnessService) {
        this.wellnessService = wellnessService;
    }

    @GetMapping("/goals")
    public ResponseEntity<ApiResponse<List<WellnessGoalDto>>> getUserGoals(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<WellnessGoalDto> goals = wellnessService.getUserGoals(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Wellness goals retrieved successfully", goals));
    }

    @PostMapping("/goals")
    public ResponseEntity<ApiResponse<WellnessGoalDto>> createGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WellnessGoalDto dto) {
        WellnessGoalDto created = wellnessService.createGoal(userDetails.getUsername(), dto);
        return new ResponseEntity<>(ApiResponse.success("Wellness goal created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/goals/{id}/progress")
    public ResponseEntity<ApiResponse<WellnessGoalDto>> updateGoalProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam Integer progress) {
        WellnessGoalDto updated = wellnessService.updateGoalProgress(userDetails.getUsername(), id, progress);
        return ResponseEntity.ok(ApiResponse.success("Goal progress updated successfully", updated));
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<ApiResponse<String>> deleteGoal(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        wellnessService.deleteGoal(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully"));
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<DailyActivityDto>>> getUserActivities(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<DailyActivityDto> activities = wellnessService.getUserActivities(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", activities));
    }

    @PostMapping("/activities")
    public ResponseEntity<ApiResponse<DailyActivityDto>> logActivity(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DailyActivityDto dto) {
        DailyActivityDto logged = wellnessService.logActivity(userDetails.getUsername(), dto);
        return new ResponseEntity<>(ApiResponse.success("Daily activity logged successfully", logged), HttpStatus.CREATED);
    }

    @GetMapping("/tips")
    public ResponseEntity<ApiResponse<List<HealthTipDto>>> getHealthTips(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<HealthTipDto> tips = wellnessService.getHealthTips(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Health tips retrieved successfully", tips));
    }
}
