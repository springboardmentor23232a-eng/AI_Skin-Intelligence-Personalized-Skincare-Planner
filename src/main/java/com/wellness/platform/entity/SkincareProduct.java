package com.wellness.platform.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "skincare_products")
public class SkincareProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 50)
    private String category; // Face Wash, Moisturizer, Sunscreen, Serum, Toner, Mask, Treatment

    @Column(name = "key_ingredients", nullable = false, length = 255)
    private String keyIngredients;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating = new BigDecimal("4.5");

    @Column(name = "suitable_skin_types", nullable = false, length = 150)
    private String suitableSkinTypes;

    @Column(name = "target_concerns", nullable = false, length = 255)
    private String targetConcerns;

    @Column(name = "product_url")
    private String productUrl;

    public SkincareProduct() {
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

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getKeyIngredients() {
        return keyIngredients;
    }

    public void setKeyIngredients(String keyIngredients) {
        this.keyIngredients = keyIngredients;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public String getSuitableSkinTypes() {
        return suitableSkinTypes;
    }

    public void setSuitableSkinTypes(String suitableSkinTypes) {
        this.suitableSkinTypes = suitableSkinTypes;
    }

    public String getTargetConcerns() {
        return targetConcerns;
    }

    public void setTargetConcerns(String targetConcerns) {
        this.targetConcerns = targetConcerns;
    }

    public String getProductUrl() {
        return productUrl;
    }

    public void setProductUrl(String productUrl) {
        this.productUrl = productUrl;
    }
}
