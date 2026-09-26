package com.personalhabitanalytics.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "goals")
public class Goal {

    // ============================================================
    // ID
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ============================================================
    // USER RELATIONSHIP
    // ============================================================

    /*
     * One User -> many Goals.
     *
     * LAZY loading prevents unnecessary User loading.
     *
     * JsonIgnore ensures the User object is never returned
     * as part of the Goal API response.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;


    // ============================================================
    // BASIC INFORMATION
    // ============================================================

    private String title;

    @Column(length = 1000)
    private String description;

    private String category;


    // ============================================================
    // TARGET & PROGRESS
    // ============================================================

    private Integer targetValue = 1;

    private Integer currentProgress = 0;


    // ============================================================
    // DATE
    // ============================================================

    private LocalDate startDate;

    /*
     * Keep the existing database column name.
     *
     * Java/API field = endDate
     * Database column = target_date
     */
    @Column(name = "target_date")
    private LocalDate endDate;


    // ============================================================
    // TIME
    // ============================================================

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;


    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    private Boolean notificationsEnabled = true;

    private Integer reminderMinutesBefore = 10;


    // ============================================================
    // PRIORITY
    // ============================================================

    private String priority = "MEDIUM";


    // ============================================================
    // STATUS
    // ============================================================

    private String status = "NOT_STARTED";


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
    // CONSTRUCTOR
    // ============================================================

    public Goal() {
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

        if (this.targetValue == null || this.targetValue < 1) {
            this.targetValue = 1;
        }

        if (this.currentProgress == null || this.currentProgress < 0) {
            this.currentProgress = 0;
        }

        if (this.currentProgress > this.targetValue) {
            this.currentProgress = this.targetValue;
        }

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

        if (Boolean.TRUE.equals(this.completed)) {
            this.status = "COMPLETED";
            this.currentProgress = this.targetValue;
        }

        if ("COMPLETED".equals(this.status)) {
            this.completed = true;
            this.currentProgress = this.targetValue;
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


    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    public Integer getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(Integer targetValue) {
        this.targetValue = targetValue;
    }


    public Integer getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(Integer currentProgress) {
        this.currentProgress = currentProgress;
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


    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
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