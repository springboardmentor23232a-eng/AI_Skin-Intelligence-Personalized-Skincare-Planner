package com.wellness.platform.repository;

import com.wellness.platform.entity.SkincareProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkincareProductRepository extends JpaRepository<SkincareProduct, Long> {
    List<SkincareProduct> findByCategory(String category);
    List<SkincareProduct> findByTargetConcernsContainingIgnoreCase(String concern);
}
