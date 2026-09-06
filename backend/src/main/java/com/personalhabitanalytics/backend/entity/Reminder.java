package com.personalhabitanalytics.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reminders")
public class Reminder {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // USER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;


    // =========================================================
    // HABIT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "habit_id", nullable = false)
    @JsonIgnore
    private Habit habit;


    // =========================================================
    // REMINDER INFORMATION
    // =========================================================

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 500)
    private String message;


    // =========================================================
    // DATE
    // =========================================================

    /*
     * Used for ONCE reminders.
     *
     * Example:
     * 2026-09-10
     */

    private LocalDate reminderDate;


    // =========================================================
    // TIME
    // =========================================================

    /*
     * Example:
     * 08:30
     */

    @Column(nullable = false)
    private LocalTime reminderTime;


    // =========================================================
    // REPEAT TYPE
    // =========================================================

    /*
     * Supported values:
     *
     * ONCE
     * DAILY
     * WEEKLY
     */

    @Column(nullable = false, length = 20)
    private String repeatType = "ONCE";


    // =========================================================
    // WEEKLY DAY
    // =========================================================

    /*
     * Used when repeatType = WEEKLY.
     *
     * Example:
     * MONDAY
     */

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;


    // =========================================================
    // TIMEZONE
    // =========================================================

    /*
     * Example:
     * Asia/Kolkata
     */

    @Column(nullable = false, length = 50)
    private String timezone = "Asia/Kolkata";


    // =========================================================
    // ENABLED
    // =========================================================

    @Column(nullable = false)
    private Boolean enabled = true;


    // =========================================================
    // NEXT TRIGGER
    // =========================================================

    /*
     * This tells the scheduler exactly when
     * the reminder should be processed next.
     */

    private LocalDateTime nextTriggerAt;


    // =========================================================
    // LAST TRIGGER
    // =========================================================

    /*
     * Prevents duplicate notification processing.
     */

    private LocalDateTime lastTriggeredAt;


    // =========================================================
    // AUDIT FIELDS
    // =========================================================

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Reminder() {
    }


    // =========================================================
    // CREATE
    // =========================================================

    @PrePersist
    protected void onCreate() {

        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        if (this.enabled == null) {
            this.enabled = true;
        }

        if (this.repeatType == null || this.repeatType.isBlank()) {
            this.repeatType = "ONCE";
        }

        if (this.timezone == null || this.timezone.isBlank()) {
            this.timezone = "Asia/Kolkata";
        }
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {

        this.updatedAt = LocalDateTime.now();
    }


    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

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


    public Habit getHabit() {
        return habit;
    }

    public void setHabit(Habit habit) {
        this.habit = habit;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }


    public LocalDate getReminderDate() {
        return reminderDate;
    }

    public void setReminderDate(LocalDate reminderDate) {
        this.reminderDate = reminderDate;
    }


    public LocalTime getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(LocalTime reminderTime) {
        this.reminderTime = reminderTime;
    }


    public String getRepeatType() {
        return repeatType;
    }

    public void setRepeatType(String repeatType) {
        this.repeatType = repeatType;
    }


    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }


    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }


    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }


    public LocalDateTime getNextTriggerAt() {
        return nextTriggerAt;
    }

    public void setNextTriggerAt(LocalDateTime nextTriggerAt) {
        this.nextTriggerAt = nextTriggerAt;
    }


    public LocalDateTime getLastTriggeredAt() {
        return lastTriggeredAt;
    }

    public void setLastTriggeredAt(LocalDateTime lastTriggeredAt) {
        this.lastTriggeredAt = lastTriggeredAt;
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