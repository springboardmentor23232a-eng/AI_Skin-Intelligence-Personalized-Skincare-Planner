package com.wellness.platform.controller;

import com.wellness.platform.dto.ApiResponse;
import com.wellness.platform.dto.SkillAssessmentRequest;
import com.wellness.platform.dto.SkillAssessmentResponse;
import com.wellness.platform.service.SkillAssessmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillAssessmentController {

    private final SkillAssessmentService assessmentService;

    public SkillAssessmentController(SkillAssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping("/assess")
    public ResponseEntity<ApiResponse<SkillAssessmentResponse>> assessSkill(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SkillAssessmentRequest request) {
        SkillAssessmentResponse response = assessmentService.assessSkill(userDetails.getUsername(), request);
        return new ResponseEntity<>(ApiResponse.success("Skill assessment completed successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<SkillAssessmentResponse>>> getAssessmentHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<SkillAssessmentResponse> history = assessmentService.getUserAssessmentHistory(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Assessment history retrieved successfully", history));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<SkillAssessmentResponse>> getLatestAssessment(
            @AuthenticationPrincipal UserDetails userDetails) {
        SkillAssessmentResponse latest = assessmentService.getLatestAssessment(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Latest assessment retrieved successfully", latest));
    }
}
