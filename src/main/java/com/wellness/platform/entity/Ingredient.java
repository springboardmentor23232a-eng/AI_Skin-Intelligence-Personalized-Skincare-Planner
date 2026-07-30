package com.wellness.platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ingredients")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category; // Retinoids, Niacinamide, Vitamin C, Hyaluronic Acid, Salicylic Acid, Ceramides, Peptides, AHAs/BHAs

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "suitable_skin_types", nullable = false, length = 150)
    private String suitableSkinTypes;

    @Column(name = "conflicting_ingredients", columnDefinition = "TEXT")
    private String conflictingIngredients;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String benefits;

    public Ingredient() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSuitableSkinTypes() {
        return suitableSkinTypes;
    }

    public void setSuitableSkinTypes(String suitableSkinTypes) {
        this.suitableSkinTypes = suitableSkinTypes;
    }

    public String getConflictingIngredients() {
        return conflictingIngredients;
    }

    public void setConflictingIngredients(String conflictingIngredients) {
        this.conflictingIngredients = conflictingIngredients;
    }

    public String getBenefits() {
        return benefits;
    }

    public void setBenefits(String benefits) {
        this.benefits = benefits;
    }
}
