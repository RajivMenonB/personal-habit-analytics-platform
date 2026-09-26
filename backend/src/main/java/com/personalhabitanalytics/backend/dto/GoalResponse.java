package com.personalhabitanalytics.backend.dto;

import com.personalhabitanalytics.backend.entity.Goal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class GoalResponse {

    private Long id;

    private String title;

    private String description;

    private String category;

    private Integer targetValue;

    private Integer currentProgress;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Boolean notificationsEnabled;

    private Integer reminderMinutesBefore;

    private String priority;

    private String status;

    private Boolean completed;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    public GoalResponse() {
    }


    public GoalResponse(Goal goal) {

        this.id = goal.getId();
        this.title = goal.getTitle();
        this.description = goal.getDescription();
        this.category = goal.getCategory();

        this.targetValue = goal.getTargetValue();
        this.currentProgress = goal.getCurrentProgress();

        this.startDate = goal.getStartDate();
        this.endDate = goal.getEndDate();

        this.startTime = goal.getStartTime();
        this.endTime = goal.getEndTime();

        this.notificationsEnabled =
                goal.getNotificationsEnabled();

        this.reminderMinutesBefore =
                goal.getReminderMinutesBefore();

        this.priority = goal.getPriority();
        this.status = goal.getStatus();
        this.completed = goal.getCompleted();

        this.createdAt = goal.getCreatedAt();
        this.updatedAt = goal.getUpdatedAt();
    }


    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public Integer getTargetValue() {
        return targetValue;
    }

    public Integer getCurrentProgress() {
        return currentProgress;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public Integer getReminderMinutesBefore() {
        return reminderMinutesBefore;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}