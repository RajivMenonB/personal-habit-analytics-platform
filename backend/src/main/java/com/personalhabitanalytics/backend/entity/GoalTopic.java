package com.personalhabitanalytics.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
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

    /*
     * Each GoalTopic belongs to one User.
     *
     * LAZY:
     * User is loaded only when actually required.
     *
     * @JsonIgnore:
     * Do not send the complete User object in GoalTopic JSON.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;


    // ============================================================
    // BASIC TOPIC INFORMATION
    // ============================================================

    private String title;

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
    // PROGRESS
    // ============================================================

    /*
     * Estimated time required for this topic.
     * Example: 90 minutes.
     */
    private Integer estimatedDuration;

    /*
     * Actual time spent.
     */
    private Integer actualDuration = 0;

    /*
     * Topic completion percentage.
     *
     * Example:
     * 0   = not started
     * 50  = half completed
     * 100 = completed
     */
    private Integer progress = 0;


    // ============================================================
    // PRIORITY & STATUS
    // ============================================================

    private String priority = "MEDIUM";

    private String status = "NOT_STARTED";


    // ============================================================
    // NOTIFICATION
    // ============================================================

    private Boolean notificationsEnabled = true;

    private Integer reminderMinutesBefore = 10;


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
    // GOAL RELATIONSHIP
    // ============================================================

    /*
     * IMPORTANT FIX
     *
     * A GoalTopic belongs to one Goal.
     *
     * We keep the relationship LAZY.
     *
     * @JsonIgnore prevents Jackson from trying to serialize
     * the Hibernate Goal proxy.
     *
     * Without this, you can get:
     *
     * ByteBuddyInterceptor
     *
     * when /api/goals or /api/goal-topics/{goalId}
     * is converted to JSON.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id")
    @JsonIgnore
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
        this.progress = progress;
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