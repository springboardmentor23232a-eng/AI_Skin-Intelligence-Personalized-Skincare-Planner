package com.wellness.platform.repository;

import com.wellness.platform.entity.SkinProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SkinProfileRepository extends JpaRepository<SkinProfile, Long> {
    Optional<SkinProfile> findByUserId(Long userId);
}
