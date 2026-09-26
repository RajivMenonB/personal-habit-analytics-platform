package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.Reminder;
import com.personalhabitanalytics.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReminderRepository
        extends JpaRepository<Reminder, Long> {


    // =========================================================
    // ALL REMINDERS FOR USER
    // =========================================================

    List<Reminder> findByUser(
            User user
    );


    // =========================================================
    // ENABLED REMINDERS
    // =========================================================

    List<Reminder> findByEnabledTrue();


    // =========================================================
    // REMINDERS FOR HABIT
    // =========================================================

    List<Reminder> findByHabitId(
            Long habitId
    );


    // =========================================================
    // AUTOMATIC HABIT REMINDERS
    // =========================================================

    List<Reminder>
    findByHabitIdAndSystemGeneratedTrue(
            Long habitId
    );


    // =========================================================
    // DELETE AUTOMATIC HABIT REMINDERS
    // =========================================================

    void deleteByHabitIdAndSystemGeneratedTrue(
            Long habitId
    );
}