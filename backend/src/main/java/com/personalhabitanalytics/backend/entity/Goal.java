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
     * Each Goal belongs to one User.
     *
     * LAZY:
     * User is loaded only when required.
     *
     * @JsonIgnore:
     * Prevents Jackson from serializing the Hibernate User proxy.
     *
     * This avoids errors such as:
     *
     * Type definition error:
     * ByteBuddyInterceptor
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;


    // ============================================================
    // BASIC GOAL INFORMATION
    // ============================================================

    private String title;

    @Column(length = 1000)
    private String description;

    private String category;


    // ============================================================
    // GOAL TARGET & PROGRESS
    // ============================================================

    /*
     * Example:
     *
     * targetValue = 90
     * currentProgress = 10
     *
     * Progress percentage:
     * 10 / 90 * 100 = 11%
     */
    private Integer targetValue;

    private Integer currentProgress = 0;


    // ============================================================
    // GOAL DATE
    // ============================================================

    private LocalDate startDate;

    private LocalDate targetDate;


    // ============================================================
    // GOAL TIME
    // ============================================================

    /*
     * Stored/returned as:
     *
     * 07:00
     * 09:30
     *
     * 24-hour format.
     */
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;


    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    private Boolean notificationsEnabled = false;

    private Integer reminderMinutesBefore = 10;


    // ============================================================
    // PRIORITY
    // ============================================================

    /*
     * LOW
     * MEDIUM
     * HIGH
     */
    private String priority = "MEDIUM";


    // ============================================================
    // STATUS
    // ============================================================

    /*
     * NOT_STARTED
     * IN_PROGRESS
     * COMPLETED
     */
    private String status = "NOT_STARTED";


    // ============================================================
    // COMPLETION
    // ============================================================

    private Boolean completed = false;


    // ============================================================
    // AUDIT FIELDS
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
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @PreUpdate
    public void onUpdate() {

        this.updatedAt = LocalDateTime.now();
    }


    // ============================================================
    // GETTERS & SETTERS
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


    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
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