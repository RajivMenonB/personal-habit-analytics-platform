package com.personalhabitanalytics.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "habits")
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // USER
    // =========================================================

    // Habit belongs to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    // =========================================================
    // BASIC HABIT INFORMATION
    // =========================================================

    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 2000)
    private String notes;

    // =========================================================
    // DATE
    // =========================================================

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    // =========================================================
    // TIME
    // =========================================================

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    // =========================================================
    // NOTIFICATION SETTINGS
    // =========================================================

    private Boolean notificationsEnabled = false;

    private Integer reminderMinutesBefore = 10;

    // =========================================================
    // COMPLETION
    // =========================================================

    private Boolean completed = false;

    // =========================================================
    // PROGRESS TRACKING
    // =========================================================

    /*
     * Example:
     *
     * targetCount = 10
     * currentProgress = 7
     *
     * Progress = 7 / 10 = 70%
     */

    private Integer targetCount = 1;

    private Integer currentProgress = 0;

    // =========================================================
    // PRIORITY
    // =========================================================

    // LOW, MEDIUM, HIGH
    private String priority = "MEDIUM";

    // =========================================================
    // STATUS
    // =========================================================

    // NOT_STARTED, IN_PROGRESS, COMPLETED
    private String status = "NOT_STARTED";

    // =========================================================
    // AUDIT FIELDS
    // =========================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Habit() {
    }

    // =========================================================
    // CREATE TIMESTAMP
    // =========================================================

    @PrePersist
    public void onCreate() {

        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // =========================================================
    // UPDATE TIMESTAMP
    // =========================================================

    @PreUpdate
    public void onUpdate() {

        this.updatedAt = LocalDateTime.now();
    }

    // =========================================================
    // ID
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // =========================================================
    // USER
    // =========================================================

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // =========================================================
    // TITLE
    // =========================================================

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    // =========================================================
    // DESCRIPTION
    // =========================================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // =========================================================
    // NOTES
    // =========================================================

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // =========================================================
    // START DATE
    // =========================================================

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    // =========================================================
    // END DATE
    // =========================================================

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    // =========================================================
    // START TIME
    // =========================================================

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    // =========================================================
    // END TIME
    // =========================================================

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    // =========================================================
    // NOTIFICATIONS ENABLED
    // =========================================================

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    // =========================================================
    // REMINDER MINUTES
    // =========================================================

    public Integer getReminderMinutesBefore() {
        return reminderMinutesBefore;
    }

    public void setReminderMinutesBefore(Integer reminderMinutesBefore) {
        this.reminderMinutesBefore = reminderMinutesBefore;
    }

    // =========================================================
    // COMPLETED
    // =========================================================

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    // =========================================================
    // TARGET COUNT
    // =========================================================

    public Integer getTargetCount() {
        return targetCount;
    }

    public void setTargetCount(Integer targetCount) {
        this.targetCount = targetCount;
    }

    // =========================================================
    // CURRENT PROGRESS
    // =========================================================

    public Integer getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(Integer currentProgress) {
        this.currentProgress = currentProgress;
    }

    // =========================================================
    // PRIORITY
    // =========================================================

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    // =========================================================
    // STATUS
    // =========================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // =========================================================
    // CREATED AT
    // =========================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // =========================================================
    // UPDATED AT
    // =========================================================

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}