package com.wellness.platform.repository;

import com.wellness.platform.entity.PersonalizedRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonalizedRecommendationRepository extends JpaRepository<PersonalizedRecommendation, Long> {
    List<PersonalizedRecommendation> findBySkillAssessmentId(Long assessmentId);
}
