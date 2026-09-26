package com.personalhabitanalytics.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "goal_topics")
public class GoalTopic {

    // ============================================================
    // ID
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ============================================================
    // USER
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;


    // ============================================================
    // TOPIC INFORMATION
    // ============================================================

    /*
     * Existing PostgreSQL column:
     *
     * title
     *
     * Frontend/API name:
     *
     * topicName
     */
    @Column(name = "title")
    private String topicName;

    @Column(length = 1000)
    private String description;

    @Column(length = 1000)
    private String notes;


    // ============================================================
    // DATE
    // ============================================================

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;


    // ============================================================
    // TIME
    // ============================================================

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;


    // ============================================================
    // DURATION
    // ============================================================

    private Integer estimatedDuration = 60;

    private Integer actualDuration = 0;


    // ============================================================
    // PROGRESS
    // ============================================================

    private Integer progress = 0;


    // ============================================================
    // PRIORITY
    // ============================================================

    private String priority = "MEDIUM";


    // ============================================================
    // STATUS
    // ============================================================

    private String status = "NOT_STARTED";


    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    private Boolean notificationsEnabled = true;

    private Integer reminderMinutesBefore = 10;


    // ============================================================
    // COMPLETION
    // ============================================================

    private Boolean completed = false;


    // ============================================================
    // AUDIT
    // ============================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // ============================================================
    // GOAL RELATIONSHIP
    // ============================================================

    /*
     * WRITE_ONLY:
     *
     * Frontend may SEND:
     *
     * {
     *   "goal": {
     *      "id": 15
     *   }
     * }
     *
     * But Spring/Jackson will NEVER serialize the Goal object
     * back into the response.
     *
     * The response instead uses GoalTopicResponse.goalId.
     *
     * This is one of the important protections against
     * Hibernate proxy / ByteBuddy serialization problems.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Goal goal;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public GoalTopic() {
    }


    // ============================================================
    // CREATE
    // ============================================================

    @PrePersist
    public void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;

        normalize();
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @PreUpdate
    public void onUpdate() {

        this.updatedAt = LocalDateTime.now();

        normalize();
    }


    // ============================================================
    // NORMALIZE
    // ============================================================

    private void normalize() {

        if (this.actualDuration == null || this.actualDuration < 0) {
            this.actualDuration = 0;
        }

        if (this.estimatedDuration == null || this.estimatedDuration < 0) {
            this.estimatedDuration = 60;
        }

        if (this.progress == null) {
            this.progress = 0;
        }

        this.progress = Math.max(
            0,
            Math.min(100, this.progress)
        );

        if (this.priority == null || this.priority.isBlank()) {
            this.priority = "MEDIUM";
        }

        if (this.status == null || this.status.isBlank()) {
            this.status = "NOT_STARTED";
        }

        if (this.notificationsEnabled == null) {
            this.notificationsEnabled = true;
        }

        if (
            this.reminderMinutesBefore == null ||
            this.reminderMinutesBefore < 0
        ) {
            this.reminderMinutesBefore = 10;
        }

        if (this.completed == null) {
            this.completed = false;
        }

        if (this.progress >= 100) {
            this.progress = 100;
            this.completed = true;
            this.status = "COMPLETED";
        }

        if (Boolean.TRUE.equals(this.completed)) {
            this.progress = 100;
            this.status = "COMPLETED";
        }
    }


    // ============================================================
    // GETTERS / SETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }


    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }


    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }


    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }


    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }


    public Integer getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(Integer estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }


    public Integer getActualDuration() {
        return actualDuration;
    }

    public void setActualDuration(Integer actualDuration) {
        this.actualDuration = actualDuration;
    }


    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {

        if (progress == null) {
            this.progress = 0;
            return;
        }

        this.progress = Math.max(
            0,
            Math.min(100, progress)
        );
    }


    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }


    public Integer getReminderMinutesBefore() {
        return reminderMinutesBefore;
    }

    public void setReminderMinutesBefore(Integer reminderMinutesBefore) {
        this.reminderMinutesBefore = reminderMinutesBefore;
    }


    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }


    public Goal getGoal() {
        return goal;
    }

    public void setGoal(Goal goal) {
        this.goal = goal;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}