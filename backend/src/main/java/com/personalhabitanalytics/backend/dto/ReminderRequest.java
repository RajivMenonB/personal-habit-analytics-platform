package com.personalhabitanalytics.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

public class ReminderRequest {

    private Long habitId;

    private String title;

    private String message;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reminderDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime reminderTime;

    /*
     * ONCE
     * DAILY
     * WEEKLY
     */
    private String repeatType;

    private DayOfWeek dayOfWeek;

    private String timezone;

    private Boolean enabled;


    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getHabitId() {
        return habitId;
    }

    public void setHabitId(Long habitId) {
        this.habitId = habitId;
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
}