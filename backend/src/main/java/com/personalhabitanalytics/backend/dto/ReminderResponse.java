package com.personalhabitanalytics.backend.dto;

import com.personalhabitanalytics.backend.entity.Reminder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ReminderResponse {

    private Long id;

    private Long habitId;

    private String habitTitle;

    private String title;

    private String message;

    private LocalDate reminderDate;

    private LocalTime reminderTime;

    private String repeatType;

    private DayOfWeek dayOfWeek;

    private String timezone;

    private Boolean enabled;

    private LocalDateTime nextTriggerAt;

    private LocalDateTime lastTriggeredAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    public ReminderResponse(Reminder reminder) {

        this.id = reminder.getId();

        if (reminder.getHabit() != null) {
            this.habitId = reminder.getHabit().getId();
            this.habitTitle = reminder.getHabit().getTitle();
        }

        this.title = reminder.getTitle();
        this.message = reminder.getMessage();

        this.reminderDate = reminder.getReminderDate();
        this.reminderTime = reminder.getReminderTime();

        this.repeatType = reminder.getRepeatType();
        this.dayOfWeek = reminder.getDayOfWeek();

        this.timezone = reminder.getTimezone();

        this.enabled = reminder.getEnabled();

        this.nextTriggerAt = reminder.getNextTriggerAt();
        this.lastTriggeredAt = reminder.getLastTriggeredAt();

        this.createdAt = reminder.getCreatedAt();
        this.updatedAt = reminder.getUpdatedAt();
    }


    public Long getId() {
        return id;
    }

    public Long getHabitId() {
        return habitId;
    }

    public String getHabitTitle() {
        return habitTitle;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public LocalDate getReminderDate() {
        return reminderDate;
    }

    public LocalTime getReminderTime() {
        return reminderTime;
    }

    public String getRepeatType() {
        return repeatType;
    }

    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }

    public String getTimezone() {
        return timezone;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public LocalDateTime getNextTriggerAt() {
        return nextTriggerAt;
    }

    public LocalDateTime getLastTriggeredAt() {
        return lastTriggeredAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}