package com.wellness.platform.controller;

import com.wellness.platform.dto.ApiResponse;
import com.wellness.platform.dto.SkillAssessmentResponse;
import com.wellness.platform.repository.SkillAssessmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping
@PreAuthorize("hasAnyRole('WELLNESS_COACH', 'ADMIN')")
public class CoachController {

    private final SkillAssessmentRepository assessmentRepository;

    public CoachController(SkillAssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    @GetMapping({"/coach/reports", "/api/coach/reports"})
    public ResponseEntity<ApiResponse<List<SkillAssessmentResponse>>> getCoachReports() {
        List<SkillAssessmentResponse> reports = assessmentRepository.findAll()
                .stream()
                .map(SkillAssessmentResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Coach reports retrieved successfully", reports));
    }
}
