package com.wellness.platform.repository;

import com.wellness.platform.entity.HealthTip;
import com.wellness.platform.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HealthTipRepository extends JpaRepository<HealthTip, Long> {
    List<HealthTip> findByTargetRole(Role targetRole);
    List<HealthTip> findByCategory(String category);
}
