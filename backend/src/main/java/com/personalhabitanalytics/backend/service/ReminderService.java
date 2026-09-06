package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.dto.ReminderRequest;
import com.personalhabitanalytics.backend.dto.ReminderResponse;
import com.personalhabitanalytics.backend.entity.Habit;
import com.personalhabitanalytics.backend.entity.Reminder;
import com.personalhabitanalytics.backend.entity.User;
import com.personalhabitanalytics.backend.repository.HabitRepository;
import com.personalhabitanalytics.backend.repository.ReminderRepository;
import com.personalhabitanalytics.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final UserRepository userRepository;
    private final HabitRepository habitRepository;


    public ReminderService(
            ReminderRepository reminderRepository,
            UserRepository userRepository,
            HabitRepository habitRepository
    ) {
        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
        this.habitRepository = habitRepository;
    }


    // =========================================================
    // CREATE
    // =========================================================

    public ReminderResponse createReminder(
            ReminderRequest request,
            String email
    ) {

        User user = getUser(email);

        if (request.getHabitId() == null) {
            throw new RuntimeException("Habit ID is required");
        }

        Habit habit = habitRepository
                .findById(request.getHabitId())
                .orElseThrow(() ->
                        new RuntimeException("Habit not found")
                );

        // SECURITY:
        // Make sure this habit actually belongs to
        // the logged-in user.

        if (!habit.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You are not allowed to use this habit"
            );
        }


        validateRequest(request);


        Reminder reminder = new Reminder();

        reminder.setUser(user);
        reminder.setHabit(habit);

        reminder.setTitle(request.getTitle().trim());
        reminder.setMessage(request.getMessage());

        reminder.setReminderDate(request.getReminderDate());
        reminder.setReminderTime(request.getReminderTime());

        reminder.setRepeatType(
                request.getRepeatType().toUpperCase()
        );

        reminder.setDayOfWeek(request.getDayOfWeek());

        reminder.setTimezone(
                request.getTimezone() == null ||
                        request.getTimezone().isBlank()
                        ? "Asia/Kolkata"
                        : request.getTimezone()
        );

        reminder.setEnabled(
                request.getEnabled() == null
                        ? true
                        : request.getEnabled()
        );


        // Calculate first trigger time
        reminder.setNextTriggerAt(
                calculateNextTrigger(reminder)
        );


        Reminder saved = reminderRepository.save(reminder);

        return new ReminderResponse(saved);
    }


    // =========================================================
    // GET ALL USER REMINDERS
    // =========================================================

    public List<ReminderResponse> getMyReminders(
            String email
    ) {

        User user = getUser(email);

        return reminderRepository
                .findByUser(user)
                .stream()
                .map(ReminderResponse::new)
                .toList();
    }


    // =========================================================
    // GET ONE REMINDER
    // =========================================================

    public ReminderResponse getReminder(
            Long reminderId,
            String email
    ) {

        User user = getUser(email);

        Reminder reminder = getReminderForUser(
                reminderId,
                user
        );

        return new ReminderResponse(reminder);
    }


    // =========================================================
    // UPDATE
    // =========================================================

    public ReminderResponse updateReminder(
            Long reminderId,
            ReminderRequest request,
            String email
    ) {

        User user = getUser(email);

        Reminder reminder = getReminderForUser(
                reminderId,
                user
        );


        if (request.getHabitId() != null) {

            Habit habit = habitRepository
                    .findById(request.getHabitId())
                    .orElseThrow(() ->
                            new RuntimeException("Habit not found")
                    );


            if (!habit.getUser().getId().equals(user.getId())) {
                throw new RuntimeException(
                        "You are not allowed to use this habit"
                );
            }

            reminder.setHabit(habit);
        }


        if (request.getTitle() != null &&
                !request.getTitle().isBlank()) {

            reminder.setTitle(
                    request.getTitle().trim()
            );
        }


        reminder.setMessage(request.getMessage());

        reminder.setReminderDate(
                request.getReminderDate()
        );

        reminder.setReminderTime(
                request.getReminderTime()
        );


        if (request.getRepeatType() != null &&
                !request.getRepeatType().isBlank()) {

            reminder.setRepeatType(
                    request.getRepeatType()
                            .toUpperCase()
            );
        }


        reminder.setDayOfWeek(
                request.getDayOfWeek()
        );


        if (request.getTimezone() != null &&
                !request.getTimezone().isBlank()) {

            reminder.setTimezone(
                    request.getTimezone()
            );
        }


        if (request.getEnabled() != null) {

            reminder.setEnabled(
                    request.getEnabled()
            );
        }


        validateReminder(reminder);


        // Recalculate next trigger
        reminder.setNextTriggerAt(
                calculateNextTrigger(reminder)
        );


        Reminder updated = reminderRepository.save(reminder);

        return new ReminderResponse(updated);
    }


    // =========================================================
    // ENABLE / DISABLE
    // =========================================================

    public ReminderResponse toggleReminder(
            Long reminderId,
            boolean enabled,
            String email
    ) {

        User user = getUser(email);

        Reminder reminder = getReminderForUser(
                reminderId,
                user
        );

        reminder.setEnabled(enabled);


        if (enabled) {

            reminder.setNextTriggerAt(
                    calculateNextTrigger(reminder)
            );

        } else {

            reminder.setNextTriggerAt(null);
        }


        Reminder saved = reminderRepository.save(reminder);

        return new ReminderResponse(saved);
    }


    // =========================================================
    // DELETE
    // =========================================================

    public void deleteReminder(
            Long reminderId,
            String email
    ) {

        User user = getUser(email);

        Reminder reminder = getReminderForUser(
                reminderId,
                user
        );

        reminderRepository.delete(reminder);
    }


    // =========================================================
    // FIND USER
    // =========================================================

    private User getUser(String email) {

        return userRepository
                .findByEmail(email.toLowerCase().trim())
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }


    // =========================================================
    // FIND REMINDER + OWNERSHIP
    // =========================================================

    private Reminder getReminderForUser(
            Long reminderId,
            User user
    ) {

        Reminder reminder = reminderRepository
                .findById(reminderId)
                .orElseThrow(() ->
                        new RuntimeException("Reminder not found")
                );


        if (!reminder.getUser()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to access this reminder"
            );
        }


        return reminder;
    }


    // =========================================================
    // VALIDATE REQUEST
    // =========================================================

    private void validateRequest(
            ReminderRequest request
    ) {

        if (request.getTitle() == null ||
                request.getTitle().isBlank()) {

            throw new RuntimeException(
                    "Reminder title is required"
            );
        }


        if (request.getReminderTime() == null) {

            throw new RuntimeException(
                    "Reminder time is required"
            );
        }


        if (request.getRepeatType() == null ||
                request.getRepeatType().isBlank()) {

            throw new RuntimeException(
                    "Repeat type is required"
            );
        }


        String repeatType =
                request.getRepeatType().toUpperCase();


        if (!repeatType.equals("ONCE") &&
                !repeatType.equals("DAILY") &&
                !repeatType.equals("WEEKLY")) {

            throw new RuntimeException(
                    "Repeat type must be ONCE, DAILY or WEEKLY"
            );
        }


        if (repeatType.equals("ONCE") &&
                request.getReminderDate() == null) {

            throw new RuntimeException(
                    "Reminder date is required for ONCE reminders"
            );
        }


        if (repeatType.equals("WEEKLY") &&
                request.getDayOfWeek() == null) {

            throw new RuntimeException(
                    "Day of week is required for WEEKLY reminders"
            );
        }
    }


    // =========================================================
    // VALIDATE REMINDER
    // =========================================================

    private void validateReminder(
            Reminder reminder
    ) {

        if (reminder.getReminderTime() == null) {

            throw new RuntimeException(
                    "Reminder time is required"
            );
        }


        String repeatType =
                reminder.getRepeatType()
                        .toUpperCase();


        if (!repeatType.equals("ONCE") &&
                !repeatType.equals("DAILY") &&
                !repeatType.equals("WEEKLY")) {

            throw new RuntimeException(
                    "Invalid repeat type"
            );
        }


        if (repeatType.equals("ONCE") &&
                reminder.getReminderDate() == null) {

            throw new RuntimeException(
                    "Reminder date is required"
            );
        }


        if (repeatType.equals("WEEKLY") &&
                reminder.getDayOfWeek() == null) {

            throw new RuntimeException(
                    "Day of week is required"
            );
        }
    }


    // =========================================================
    // CALCULATE NEXT TRIGGER
    // =========================================================

    private LocalDateTime calculateNextTrigger(
            Reminder reminder
    ) {

        ZoneId zone;

        try {

            zone = ZoneId.of(
                    reminder.getTimezone()
            );

        } catch (Exception e) {

            zone = ZoneId.of("Asia/Kolkata");
        }


        LocalDate today =
                LocalDate.now(zone);

        LocalTime time =
                reminder.getReminderTime();


        String repeatType =
                reminder.getRepeatType()
                        .toUpperCase();


        // -----------------------------------------------------
        // ONCE
        // -----------------------------------------------------

        if (repeatType.equals("ONCE")) {

            return LocalDateTime.of(
                    reminder.getReminderDate(),
                    time
            );
        }


        // -----------------------------------------------------
        // DAILY
        // -----------------------------------------------------

        if (repeatType.equals("DAILY")) {

            LocalDateTime candidate =
                    LocalDateTime.of(
                            today,
                            time
                    );


            if (!candidate.isAfter(
                    LocalDateTime.now(zone)
            )) {

                candidate = candidate.plusDays(1);
            }


            return candidate;
        }


        // -----------------------------------------------------
        // WEEKLY
        // -----------------------------------------------------

        if (repeatType.equals("WEEKLY")) {

            LocalDate date = today;

            int daysAhead =
                    (reminder.getDayOfWeek()
                            .getValue()
                            - date.getDayOfWeek()
                            .getValue()
                            + 7) % 7;


            date = date.plusDays(daysAhead);


            LocalDateTime candidate =
                    LocalDateTime.of(
                            date,
                            time
                    );


            if (!candidate.isAfter(
                    LocalDateTime.now(zone)
            )) {

                candidate =
                        candidate.plusWeeks(1);
            }


            return candidate;
        }


        throw new RuntimeException(
                "Unable to calculate reminder time"
        );
    }
}