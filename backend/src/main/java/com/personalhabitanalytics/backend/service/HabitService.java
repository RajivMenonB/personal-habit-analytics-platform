package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.Habit;
import com.personalhabitanalytics.backend.entity.Reminder;
import com.personalhabitanalytics.backend.entity.User;

import com.personalhabitanalytics.backend.repository.HabitRepository;
import com.personalhabitanalytics.backend.repository.ReminderRepository;
import com.personalhabitanalytics.backend.repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

import java.util.List;

@Service
public class HabitService {

    private static final String DEFAULT_TIMEZONE =
            "Asia/Kolkata";


    private final HabitRepository habitRepository;

    private final UserRepository userRepository;

    private final ReminderRepository reminderRepository;


    public HabitService(
            HabitRepository habitRepository,
            UserRepository userRepository,
            ReminderRepository reminderRepository
    ) {

        this.habitRepository =
                habitRepository;

        this.userRepository =
                userRepository;

        this.reminderRepository =
                reminderRepository;
    }


    // =========================================================
    // CREATE HABIT
    // =========================================================

    @Transactional
    public Habit createHabit(
            Habit habit,
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );


        habit.setUser(
                user
        );


        Habit saved =
                habitRepository.save(
                        habit
                );


        syncNotificationReminder(
                saved
        );


        return saved;
    }


    // =========================================================
    // GET ALL HABITS
    // =========================================================

    public List<Habit> getHabitsByUser(
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );


        return habitRepository.findByUser(
                user
        );
    }


    // =========================================================
    // GET HABIT BY ID
    // =========================================================

    public Habit getHabitById(
            Long id,
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );


        Habit habit =
                habitRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Habit not found"
                                        )
                        );


        verifyOwnership(
                habit,
                user,
                "access"
        );


        return habit;
    }


    // =========================================================
    // UPDATE HABIT
    // =========================================================

    @Transactional
    public Habit updateHabit(
            Long id,
            Habit updatedHabit,
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );


        Habit habit =
                habitRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Habit not found"
                                        )
                        );


        verifyOwnership(
                habit,
                user,
                "update"
        );


        habit.setTitle(
                updatedHabit.getTitle()
        );


        habit.setDescription(
                updatedHabit.getDescription()
        );


        habit.setNotes(
                updatedHabit.getNotes()
        );


        habit.setStartDate(
                updatedHabit.getStartDate()
        );


        habit.setEndDate(
                updatedHabit.getEndDate()
        );


        habit.setStartTime(
                updatedHabit.getStartTime()
        );


        habit.setEndTime(
                updatedHabit.getEndTime()
        );


        habit.setNotificationsEnabled(
                updatedHabit.getNotificationsEnabled()
        );


        habit.setReminderMinutesBefore(
                updatedHabit.getReminderMinutesBefore()
        );


        habit.setCompleted(
                updatedHabit.getCompleted()
        );


        habit.setTargetCount(
                updatedHabit.getTargetCount()
        );


        habit.setCurrentProgress(
                updatedHabit.getCurrentProgress()
        );


        habit.setPriority(
                updatedHabit.getPriority()
        );


        habit.setStatus(
                updatedHabit.getStatus()
        );


        Habit saved =
                habitRepository.save(
                        habit
                );


        syncNotificationReminder(
                saved
        );


        return saved;
    }


    // =========================================================
    // DELETE HABIT
    // =========================================================

    @Transactional
    public void deleteHabit(
            Long id,
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found"
                                        )
                        );


        Habit habit =
                habitRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Habit not found"
                                        )
                        );


        verifyOwnership(
                habit,
                user,
                "delete"
        );


        /*
         * Delete only the automatic reminder created
         * by the Habit notification system.
         *
         * Manual reminders are NOT deleted.
         */

        reminderRepository
                .deleteByHabitIdAndSystemGeneratedTrue(
                        id
                );


        habitRepository.delete(
                habit
        );
    }


    // =========================================================
    // SYNCHRONIZE HABIT NOTIFICATION
    // =========================================================

    /**
     * Keeps one automatic DAILY reminder synchronized
     * with the Habit notification settings.
     *
     * Manual reminders are never modified.
     */
    private void syncNotificationReminder(
            Habit habit
    ) {

        List<Reminder> systemReminders =
                reminderRepository
                        .findByHabitIdAndSystemGeneratedTrue(
                                habit.getId()
                        );


        boolean notificationsEnabled =
                Boolean.TRUE.equals(
                        habit.getNotificationsEnabled()
                );


        boolean completed =
                Boolean.TRUE.equals(
                        habit.getCompleted()
                );


        boolean hasStartTime =
                habit.getStartTime() != null;


        /*
         * Automatic reminder is possible only when:
         *
         * Notifications = ON
         * Habit = NOT completed
         * Start time exists
         */

        boolean enabled =
                notificationsEnabled
                        &&
                !completed
                        &&
                hasStartTime;


        /*
         * If notification is disabled,
         * delete the automatic reminder.
         */

        if (!enabled) {

            if (!systemReminders.isEmpty()) {

                reminderRepository.deleteAll(
                        systemReminders
                );
            }

            return;
        }


        Reminder reminder;


        /*
         * Create a new automatic reminder
         * if this habit doesn't have one.
         */

        if (systemReminders.isEmpty()) {

            reminder =
                    new Reminder();

            reminder.setSystemGenerated(
                    true
            );

        } else {

            /*
             * Reuse the existing automatic reminder.
             */

            reminder =
                    systemReminders.get(0);


            /*
             * Safety:
             * keep only ONE automatic reminder.
             */

            if (systemReminders.size() > 1) {

                reminderRepository.deleteAll(
                        systemReminders.subList(
                                1,
                                systemReminders.size()
                        )
                );
            }
        }


        /*
         * Default = 10 minutes before habit time.
         */

        int minutesBefore =
                habit.getReminderMinutesBefore() == null
                        ? 10
                        : habit.getReminderMinutesBefore();


        /*
         * Protect against invalid values.
         */

        minutesBefore =
                Math.max(
                        0,
                        Math.min(
                                minutesBefore,
                                1439
                        )
                );


        /*
         * Example:
         *
         * Habit time = 08:00
         * Reminder before = 10
         *
         * Notification = 07:50
         */

        LocalTime reminderTime =
                habit.getStartTime()
                        .minusMinutes(
                                minutesBefore
                        );


        reminder.setUser(
                habit.getUser()
        );


        reminder.setHabit(
                habit
        );


        reminder.setTitle(
                "Habit reminder: "
                        +
                safeTitle(
                        habit.getTitle()
                )
        );


        reminder.setMessage(
                "Time to work on your habit: "
                        +
                safeTitle(
                        habit.getTitle()
                )
        );


        /*
         * Automatic habit reminders are time-based
         * and repeat daily.
         */

        reminder.setReminderDate(
                null
        );


        reminder.setReminderTime(
                reminderTime
        );


        reminder.setRepeatType(
                "DAILY"
        );


        reminder.setDayOfWeek(
                null
        );


        reminder.setTimezone(
                DEFAULT_TIMEZONE
        );


        reminder.setEnabled(
                true
        );


        /*
         * Calculate the first trigger.
         */

        reminder.setNextTriggerAt(
                calculateNextHabitTrigger(
                        habit,
                        reminderTime
                )
        );


        reminderRepository.save(
                reminder
        );
    }


    // =========================================================
    // CALCULATE NEXT HABIT TRIGGER
    // =========================================================

    private LocalDateTime calculateNextHabitTrigger(
            Habit habit,
            LocalTime reminderTime
    ) {

        ZoneId zone =
                ZoneId.of(
                        DEFAULT_TIMEZONE
                );


        LocalDate today =
                LocalDate.now(
                        zone
                );


        LocalDateTime now =
                LocalDateTime.now(
                        zone
                );


        /*
         * If the habit starts in the future,
         * schedule on its start date.
         */

        if (
                habit.getStartDate() != null
                        &&
                today.isBefore(
                        habit.getStartDate()
                )
        ) {

            return LocalDateTime.of(
                    habit.getStartDate(),
                    reminderTime
            );
        }


        LocalDateTime candidate =
                LocalDateTime.of(
                        today,
                        reminderTime
                );


        /*
         * If today's notification time has already passed,
         * schedule tomorrow.
         */

        if (!candidate.isAfter(now)) {

            candidate =
                    candidate.plusDays(
                            1
                    );
        }


        /*
         * Never schedule beyond habit end date.
         */

        if (
                habit.getEndDate() != null
                        &&
                candidate.toLocalDate()
                        .isAfter(
                                habit.getEndDate()
                        )
        ) {

            return null;
        }


        return candidate;
    }


    // =========================================================
    // SAFE TITLE
    // =========================================================

    private String safeTitle(
            String title
    ) {

        if (
                title == null
                        ||
                title.isBlank()
        ) {

            return "Habit";
        }


        return title.trim();
    }


    // =========================================================
    // OWNERSHIP CHECK
    // =========================================================

    private void verifyOwnership(
            Habit habit,
            User user,
            String action
    ) {

        if (
                habit.getUser() == null
                        ||
                !habit.getUser()
                        .getId()
                        .equals(
                                user.getId()
                        )
        ) {

            throw new AccessDeniedException(
                    "You are not allowed to "
                            +
                    action
                            +
                    " this habit"
            );
        }
    }
}