package com.wellness.platform.repository;

import com.wellness.platform.entity.GoalStatus;
import com.wellness.platform.entity.WellnessGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WellnessGoalRepository extends JpaRepository<WellnessGoal, Long> {
    List<WellnessGoal> findByUserId(Long userId);
    List<WellnessGoal> findByUserIdAndStatus(Long userId, GoalStatus status);
}
