package com.wellness.platform.dto;

import com.wellness.platform.entity.HealthTip;
import com.wellness.platform.entity.Role;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class HealthTipDto {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    @NotBlank(message = "Category is required")
    private String category;

    private Role targetRole = Role.USER;
    private LocalDateTime createdAt;

    public HealthTipDto() {
    }

    public HealthTipDto(HealthTip tip) {
        this.id = tip.getId();
        this.title = tip.getTitle();
        this.content = tip.getContent();
        this.category = tip.getCategory();
        this.targetRole = tip.getTargetRole();
        this.createdAt = tip.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Role getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(Role targetRole) {
        this.targetRole = targetRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
