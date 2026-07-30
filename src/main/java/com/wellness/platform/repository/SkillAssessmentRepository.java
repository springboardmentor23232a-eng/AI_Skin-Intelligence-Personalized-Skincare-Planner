package com.wellness.platform.repository;

import com.wellness.platform.entity.SkillAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillAssessmentRepository extends JpaRepository<SkillAssessment, Long> {
    List<SkillAssessment> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<SkillAssessment> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
