package com.wellness.platform.service;

import com.wellness.platform.dto.SkillAssessmentRequest;
import com.wellness.platform.dto.SkillAssessmentResponse;

import java.util.List;

public interface SkillAssessmentService {
    SkillAssessmentResponse assessSkill(String userEmail, SkillAssessmentRequest request);
    List<SkillAssessmentResponse> getUserAssessmentHistory(String userEmail);
    SkillAssessmentResponse getLatestAssessment(String userEmail);
}
