package com.wellness.platform.repository;

import com.wellness.platform.entity.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    List<Ingredient> findByCategory(String category);
    List<Ingredient> findBySuitableSkinTypesContainingIgnoreCase(String skinType);
}
