package com.wellness.platform.repository;

import com.wellness.platform.entity.DailySkincareLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailySkincareLogRepository extends JpaRepository<DailySkincareLog, Long> {
    List<DailySkincareLog> findByUserIdOrderByLogDateDesc(Long userId);
    List<DailySkincareLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
}
