package com.wellness.platform.repository;

import com.wellness.platform.entity.DailyActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyActivityRepository extends JpaRepository<DailyActivity, Long> {
    List<DailyActivity> findByUserIdOrderByActivityDateDesc(Long userId);
    List<DailyActivity> findByUserIdAndActivityDate(Long userId, LocalDate activityDate);
}
