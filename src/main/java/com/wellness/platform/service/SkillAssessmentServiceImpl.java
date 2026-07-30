package com.wellness.platform.service;

import com.wellness.platform.dto.SkillAssessmentRequest;
import com.wellness.platform.dto.SkillAssessmentResponse;
import com.wellness.platform.entity.PersonalizedRecommendation;
import com.wellness.platform.entity.SkillAssessment;
import com.wellness.platform.entity.User;
import com.wellness.platform.exception.ResourceNotFoundException;
import com.wellness.platform.repository.SkillAssessmentRepository;
import com.wellness.platform.repository.UserRepository;
import com.wellness.platform.util.AiSkillEngine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillAssessmentServiceImpl implements SkillAssessmentService {

    private final SkillAssessmentRepository assessmentRepository;
    private final UserRepository userRepository;
    private final AiSkillEngine aiSkillEngine;

    public SkillAssessmentServiceImpl(SkillAssessmentRepository assessmentRepository, UserRepository userRepository, AiSkillEngine aiSkillEngine) {
        this.assessmentRepository = assessmentRepository;
        this.userRepository = userRepository;
        this.aiSkillEngine = aiSkillEngine;
    }

    @Override
    @Transactional
    public SkillAssessmentResponse assessSkill(String userEmail, SkillAssessmentRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        AiSkillEngine.AiAnalysisResult result = aiSkillEngine.analyzeSkill(request);

        SkillAssessment assessment = new SkillAssessment();
        assessment.setUser(user);
        assessment.setTargetSkill(request.getTargetSkill());
        assessment.setCurrentProficiency(request.getCurrentProficiency());
        assessment.setPrimaryGoal(request.getPrimaryGoal());
        assessment.setWeeklyHours(request.getWeeklyHours());
        assessment.setWellnessState(request.getWellnessState());
        assessment.setAssessmentScore(result.getScore());
        assessment.setAiAnalysis(result.getAnalysisText());

        for (PersonalizedRecommendation rec : result.getRecommendations()) {
            assessment.addRecommendation(rec);
        }

        SkillAssessment saved = assessmentRepository.save(assessment);
        return new SkillAssessmentResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SkillAssessmentResponse> getUserAssessmentHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return assessmentRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(SkillAssessmentResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SkillAssessmentResponse getLatestAssessment(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        return assessmentRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId())
                .map(SkillAssessmentResponse::new)
                .orElseThrow(() -> new ResourceNotFoundException("No skill assessments found for user"));
    }
}
