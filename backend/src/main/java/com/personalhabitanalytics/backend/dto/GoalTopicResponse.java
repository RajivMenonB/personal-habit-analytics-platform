package com.personalhabitanalytics.backend.dto;

import com.personalhabitanalytics.backend.entity.GoalTopic;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class GoalTopicResponse {

    private Long id;

    private String topicName;

    private String description;

    private String notes;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Integer estimatedDuration;

    private Integer actualDuration;

    private Integer progress;

    private String priority;

    private String status;

    private Boolean notificationsEnabled;

    private Integer reminderMinutesBefore;

    private Boolean completed;

    private Long goalId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    public GoalTopicResponse() {
    }


    public GoalTopicResponse(GoalTopic topic) {

        this.id = topic.getId();

        this.topicName = topic.getTopicName();

        this.description = topic.getDescription();

        this.notes = topic.getNotes();

        this.startDate = topic.getStartDate();

        this.endDate = topic.getEndDate();

        this.startTime = topic.getStartTime();

        this.endTime = topic.getEndTime();

        this.estimatedDuration =
                topic.getEstimatedDuration();

        this.actualDuration =
                topic.getActualDuration();

        this.progress =
                topic.getProgress();

        this.priority =
                topic.getPriority();

        this.status =
                topic.getStatus();

        this.notificationsEnabled =
                topic.getNotificationsEnabled();

        this.reminderMinutesBefore =
                topic.getReminderMinutesBefore();

        this.completed =
                topic.getCompleted();

        /*
         * Only return the ID.
         *
         * Never serialize the Hibernate Goal proxy.
         */
        this.goalId =
                topic.getGoal() != null
                        ? topic.getGoal().getId()
                        : null;

        this.createdAt =
                topic.getCreatedAt();

        this.updatedAt =
                topic.getUpdatedAt();
    }


    public Long getId() {
        return id;
    }

    public String getTopicName() {
        return topicName;
    }

    public String getDescription() {
        return description;
    }

    public String getNotes() {
        return notes;
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

    public Integer getEstimatedDuration() {
        return estimatedDuration;
    }

    public Integer getActualDuration() {
        return actualDuration;
    }

    public Integer getProgress() {
        return progress;
    }

    public String getPriority() {
        return priority;
    }

    public String getStatus() {
        return status;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public Integer getReminderMinutesBefore() {
        return reminderMinutesBefore;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public Long getGoalId() {
        return goalId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}