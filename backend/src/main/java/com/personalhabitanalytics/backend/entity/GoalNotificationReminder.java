package com.personalhabitanalytics.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "goal_notification_reminders")
public class GoalNotificationReminder {

    // ============================================================
    // ID
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // USER
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ============================================================
    // GOAL
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id")
    private Goal goal;

    // ============================================================
    // GOAL TOPIC
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_topic_id")
    private GoalTopic goalTopic;

    // ============================================================
    // REMINDER TYPE
    // ============================================================

    @Column(nullable = false, length = 30)
    private String reminderType;

    /*
     * GOAL
     * GOAL_TOPIC
     */

    // ============================================================
    // TITLE
    // ============================================================

    @Column(nullable = false, length = 150)
    private String title;

    // ============================================================
    // MESSAGE
    // ============================================================

    @Column(length = 500)
    private String message;

    // ============================================================
    // REMINDER DATE
    // ============================================================

    private LocalDate reminderDate;

    // ============================================================
    // REMINDER TIME
    // ============================================================

    @Column(nullable = false)
    private LocalTime reminderTime;

    // ============================================================
    // REPEAT TYPE
    // ============================================================

    @Column(nullable = false, length = 20)
    private String repeatType = "DAILY";

    // ============================================================
    // TIMEZONE
    // ============================================================

    @Column(nullable = false, length = 50)
    private String timezone = "Asia/Kolkata";

    // ============================================================
    // ENABLED
    // ============================================================

    @Column(nullable = false)
    private Boolean enabled = true;

    // ============================================================
    // NEXT TRIGGER
    // ============================================================

    private LocalDateTime nextTriggerAt;

    // ============================================================
    // LAST TRIGGER
    // ============================================================

    private LocalDateTime lastTriggeredAt;

    // ============================================================
    // CREATED AT
    // ============================================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ============================================================
    // UPDATED AT
    // ============================================================

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public GoalNotificationReminder() {
    }

    // ============================================================
    // PRE PERSIST
    // ============================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (enabled == null) {
            enabled = true;
        }

        if (repeatType == null || repeatType.isBlank()) {
            repeatType = "DAILY";
        }

        if (timezone == null || timezone.isBlank()) {
            timezone = "Asia/Kolkata";
        }
    }

    // ============================================================
    // PRE UPDATE
    // ============================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }

    // ============================================================
    // GET ID
    // ============================================================

    public Long getId() {
        return id;
    }

    // ============================================================
    // SET ID
    // ============================================================

    public void setId(Long id) {
        this.id = id;
    }

    // ============================================================
    // GET USER
    // ============================================================

    public User getUser() {
        return user;
    }

    // ============================================================
    // SET USER
    // ============================================================

    public void setUser(User user) {
        this.user = user;
    }

    // ============================================================
    // GET GOAL
    // ============================================================

    public Goal getGoal() {
        return goal;
    }

    // ============================================================
    // SET GOAL
    // ============================================================

    public void setGoal(Goal goal) {
        this.goal = goal;
    }

    // ============================================================
    // GET GOAL TOPIC
    // ============================================================

    public GoalTopic getGoalTopic() {
        return goalTopic;
    }

    // ============================================================
    // SET GOAL TOPIC
    // ============================================================

    public void setGoalTopic(GoalTopic goalTopic) {
        this.goalTopic = goalTopic;
    }

    // ============================================================
    // GET REMINDER TYPE
    // ============================================================

    public String getReminderType() {
        return reminderType;
    }

    // ============================================================
    // SET REMINDER TYPE
    // ============================================================

    public void setReminderType(String reminderType) {
        this.reminderType = reminderType;
    }

    // ============================================================
    // GET TITLE
    // ============================================================

    public String getTitle() {
        return title;
    }

    // ============================================================
    // SET TITLE
    // ============================================================

    public void setTitle(String title) {
        this.title = title;
    }

    // ============================================================
    // GET MESSAGE
    // ============================================================

    public String getMessage() {
        return message;
    }

    // ============================================================
    // SET MESSAGE
    // ============================================================

    public void setMessage(String message) {
        this.message = message;
    }

    // ============================================================
    // GET REMINDER DATE
    // ============================================================

    public LocalDate getReminderDate() {
        return reminderDate;
    }

    // ============================================================
    // SET REMINDER DATE
    // ============================================================

    public void setReminderDate(LocalDate reminderDate) {
        this.reminderDate = reminderDate;
    }

    // ============================================================
    // GET REMINDER TIME
    // ============================================================

    public LocalTime getReminderTime() {
        return reminderTime;
    }

    // ============================================================
    // SET REMINDER TIME
    // ============================================================

    public void setReminderTime(LocalTime reminderTime) {
        this.reminderTime = reminderTime;
    }

    // ============================================================
    // GET REPEAT TYPE
    // ============================================================

    public String getRepeatType() {
        return repeatType;
    }

    // ============================================================
    // SET REPEAT TYPE
    // ============================================================

    public void setRepeatType(String repeatType) {
        this.repeatType = repeatType;
    }

    // ============================================================
    // GET TIMEZONE
    // ============================================================

    public String getTimezone() {
        return timezone;
    }

    // ============================================================
    // SET TIMEZONE
    // ============================================================

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    // ============================================================
    // GET ENABLED
    // ============================================================

    public Boolean getEnabled() {
        return enabled;
    }

    // ============================================================
    // SET ENABLED
    // ============================================================

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    // ============================================================
    // GET NEXT TRIGGER
    // ============================================================

    public LocalDateTime getNextTriggerAt() {
        return nextTriggerAt;
    }

    // ============================================================
    // SET NEXT TRIGGER
    // ============================================================

    public void setNextTriggerAt(LocalDateTime nextTriggerAt) {
        this.nextTriggerAt = nextTriggerAt;
    }

    // ============================================================
    // GET LAST TRIGGER
    // ============================================================

    public LocalDateTime getLastTriggeredAt() {
        return lastTriggeredAt;
    }

    // ============================================================
    // SET LAST TRIGGER
    // ============================================================

    public void setLastTriggeredAt(LocalDateTime lastTriggeredAt) {
        this.lastTriggeredAt = lastTriggeredAt;
    }

    // ============================================================
    // GET CREATED AT
    // ============================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ============================================================
    // SET CREATED AT
    // ============================================================

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ============================================================
    // GET UPDATED AT
    // ============================================================

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // ============================================================
    // SET UPDATED AT
    // ============================================================

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}