package com.wellness.platform.dto;

public class DashboardAnalyticsDto {

    private long totalUsers;
    private long totalCoaches;
    private long totalAssessments;
    private long totalActiveGoals;
    private double averagePlatformMoodScore;
    private long totalActivitiesLogged;

    public DashboardAnalyticsDto() {
    }

    public DashboardAnalyticsDto(long totalUsers, long totalCoaches, long totalAssessments, long totalActiveGoals, double averagePlatformMoodScore, long totalActivitiesLogged) {
        this.totalUsers = totalUsers;
        this.totalCoaches = totalCoaches;
        this.totalAssessments = totalAssessments;
        this.totalActiveGoals = totalActiveGoals;
        this.averagePlatformMoodScore = averagePlatformMoodScore;
        this.totalActivitiesLogged = totalActivitiesLogged;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCoaches() {
        return totalCoaches;
    }

    public void setTotalCoaches(long totalCoaches) {
        this.totalCoaches = totalCoaches;
    }

    public long getTotalAssessments() {
        return totalAssessments;
    }

    public void setTotalAssessments(long totalAssessments) {
        this.totalAssessments = totalAssessments;
    }

    public long getTotalActiveGoals() {
        return totalActiveGoals;
    }

    public void setTotalActiveGoals(long totalActiveGoals) {
        this.totalActiveGoals = totalActiveGoals;
    }

    public double getAveragePlatformMoodScore() {
        return averagePlatformMoodScore;
    }

    public void setAveragePlatformMoodScore(double averagePlatformMoodScore) {
        this.averagePlatformMoodScore = averagePlatformMoodScore;
    }

    public long getTotalActivitiesLogged() {
        return totalActivitiesLogged;
    }

    public void setTotalActivitiesLogged(long totalActivitiesLogged) {
        this.totalActivitiesLogged = totalActivitiesLogged;
    }
}
