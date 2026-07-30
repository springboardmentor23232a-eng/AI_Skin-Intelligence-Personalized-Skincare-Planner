package com.wellness.platform.repository;

import com.wellness.platform.entity.PersonalizedRoutine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonalizedRoutineRepository extends JpaRepository<PersonalizedRoutine, Long> {
    List<PersonalizedRoutine> findByUserIdOrderByStepNumberAsc(Long userId);
    List<PersonalizedRoutine> findByUserIdAndTimeOfDayOrderByStepNumberAsc(Long userId, String timeOfDay);
}
