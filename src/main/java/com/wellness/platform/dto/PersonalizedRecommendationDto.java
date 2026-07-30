package com.wellness.platform.dto;

import com.wellness.platform.entity.PersonalizedRecommendation;

public class PersonalizedRecommendationDto {

    private Long id;
    private String category;
    private String title;
    private String description;
    private String priority;
    private String resourceUrl;
    private Boolean isCompleted;

    public PersonalizedRecommendationDto() {
    }

    public PersonalizedRecommendationDto(PersonalizedRecommendation entity) {
        this.id = entity.getId();
        this.category = entity.getCategory();
        this.title = entity.getTitle();
        this.description = entity.getDescription();
        this.priority = entity.getPriority();
        this.resourceUrl = entity.getResourceUrl();
        this.isCompleted = entity.getIsCompleted();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public void setResourceUrl(String resourceUrl) {
        this.resourceUrl = resourceUrl;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
}
