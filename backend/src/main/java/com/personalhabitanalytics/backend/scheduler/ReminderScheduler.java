package com.personalhabitanalytics.backend.scheduler;

import com.personalhabitanalytics.backend.entity.Reminder;
import com.personalhabitanalytics.backend.repository.ReminderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Component
public class ReminderScheduler {

    private static final Logger logger =
            LoggerFactory.getLogger(ReminderScheduler.class);

    private final ReminderRepository reminderRepository;

    public ReminderScheduler(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    /**
     * Check reminders every minute.
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processReminders() {

        logger.info("Checking reminders...");

        List<Reminder> reminders =
                reminderRepository.findByEnabledTrue();

        if (reminders.isEmpty()) {
            logger.info("No enabled reminders found.");
            return;
        }

        logger.info(
                "Found {} enabled reminder(s).",
                reminders.size()
        );

        for (Reminder reminder : reminders) {

            try {
                processReminder(reminder);

            } catch (Exception e) {

                logger.error(
                        "Error processing reminder ID {}: {}",
                        reminder.getId(),
                        e.getMessage(),
                        e
                );
            }
        }
    }

    /**
     * Process one reminder.
     */
    private void processReminder(Reminder reminder) {

        String timezone = reminder.getTimezone();

        if (timezone == null || timezone.isBlank()) {
            timezone = "Asia/Kolkata";
        }

        ZoneId zoneId;

        try {

            zoneId = ZoneId.of(timezone);

        } catch (Exception e) {

            logger.warn(
                    "Invalid timezone '{}' for reminder ID {}. Using Asia/Kolkata.",
                    timezone,
                    reminder.getId()
            );

            zoneId = ZoneId.of("Asia/Kolkata");
        }

        ZonedDateTime now =
                ZonedDateTime.now(zoneId);

        LocalDateTime currentLocalDateTime =
                now.toLocalDateTime();

        LocalDateTime nextTriggerAt =
                reminder.getNextTriggerAt();

        if (nextTriggerAt == null) {

            logger.warn(
                    "Reminder ID {} has no nextTriggerAt.",
                    reminder.getId()
            );

            return;
        }

        logger.info(
                "Reminder ID {} | Current: {} | Next trigger: {}",
                reminder.getId(),
                currentLocalDateTime,
                nextTriggerAt
        );

        /*
         * Check whether the reminder is due.
         */
        if (!currentLocalDateTime.isBefore(nextTriggerAt)) {

            triggerReminder(
                    reminder,
                    now,
                    currentLocalDateTime,
                    timezone
            );
        }
    }

    /**
     * Trigger the reminder.
     */
    private void triggerReminder(
            Reminder reminder,
            ZonedDateTime now,
            LocalDateTime currentLocalDateTime,
            String timezone
    ) {

        logger.info("==========================================");
        logger.info("REMINDER TRIGGERED");
        logger.info("Reminder ID : {}", reminder.getId());
        logger.info("Title       : {}", reminder.getTitle());
        logger.info("Message     : {}", reminder.getMessage());

        if (reminder.getHabit() != null) {

            logger.info(
                    "Habit ID    : {}",
                    reminder.getHabit().getId()
            );

            logger.info(
                    "Habit Title : {}",
                    reminder.getHabit().getTitle()
            );
        }

        logger.info(
                "Repeat Type : {}",
                reminder.getRepeatType()
        );

        logger.info(
                "Timezone    : {}",
                timezone
        );

        logger.info(
                "Triggered   : {}",
                now
        );

        logger.info("==========================================");

        /*
         * Store trigger time.
         */
        reminder.setLastTriggeredAt(
                currentLocalDateTime
        );

        String repeatType =
                reminder.getRepeatType();

        /*
         * ONE-TIME
         */
        if ("ONCE".equalsIgnoreCase(repeatType)) {

            handleOnceReminder(reminder);

        }

        /*
         * DAILY
         */
        else if ("DAILY".equalsIgnoreCase(repeatType)) {

            handleDailyReminder(
                    reminder,
                    currentLocalDateTime
            );

        }

        /*
         * WEEKLY
         */
        else if ("WEEKLY".equalsIgnoreCase(repeatType)) {

            handleWeeklyReminder(
                    reminder,
                    currentLocalDateTime
            );

        }

        /*
         * Unknown repeat type
         */
        else {

            logger.warn(
                    "Unknown repeat type '{}' for reminder ID {}.",
                    repeatType,
                    reminder.getId()
            );

            reminder.setEnabled(false);
            reminder.setNextTriggerAt(null);
        }

        reminderRepository.save(reminder);
    }

    /**
     * Handle ONCE reminder.
     */
    private void handleOnceReminder(Reminder reminder) {

        reminder.setEnabled(false);
        reminder.setNextTriggerAt(null);

        logger.info(
                "One-time reminder ID {} completed.",
                reminder.getId()
        );
    }

    /**
     * Handle DAILY reminder.
     */
    private void handleDailyReminder(
            Reminder reminder,
            LocalDateTime currentLocalDateTime
    ) {

        if (reminder.getReminderTime() == null) {

            logger.warn(
                    "Daily reminder ID {} has no reminderTime.",
                    reminder.getId()
            );

            reminder.setEnabled(false);
            reminder.setNextTriggerAt(null);

            return;
        }

        LocalDateTime nextTrigger =
                currentLocalDateTime
                        .toLocalDate()
                        .plusDays(1)
                        .atTime(
                                reminder.getReminderTime()
                        );

        reminder.setNextTriggerAt(nextTrigger);

        logger.info(
                "Daily reminder ID {} scheduled for {}.",
                reminder.getId(),
                nextTrigger
        );
    }

    /**
     * Handle WEEKLY reminder.
     */
    private void handleWeeklyReminder(
            Reminder reminder,
            LocalDateTime currentLocalDateTime
    ) {

        if (reminder.getReminderTime() == null) {

            logger.warn(
                    "Weekly reminder ID {} has no reminderTime.",
                    reminder.getId()
            );

            reminder.setEnabled(false);
            reminder.setNextTriggerAt(null);

            return;
        }

        DayOfWeek targetDay =
                reminder.getDayOfWeek();

        /*
         * If no specific weekday is provided,
         * schedule one week later.
         */
        if (targetDay == null) {

            LocalDateTime nextTrigger =
                    currentLocalDateTime
                            .toLocalDate()
                            .plusWeeks(1)
                            .atTime(
                                    reminder.getReminderTime()
                            );

            reminder.setNextTriggerAt(nextTrigger);

            logger.info(
                    "Weekly reminder ID {} scheduled for {}.",
                    reminder.getId(),
                    nextTrigger
            );

            return;
        }

        int currentDayValue =
                currentLocalDateTime
                        .getDayOfWeek()
                        .getValue();

        int targetDayValue =
                targetDay.getValue();

        int daysUntilNext =
                (targetDayValue - currentDayValue + 7) % 7;

        /*
         * If today is the selected day,
         * schedule next week.
         */
        if (daysUntilNext == 0) {
            daysUntilNext = 7;
        }

        LocalDateTime nextTrigger =
                currentLocalDateTime
                        .toLocalDate()
                        .plusDays(daysUntilNext)
                        .atTime(
                                reminder.getReminderTime()
                        );

        reminder.setNextTriggerAt(nextTrigger);

        logger.info(
                "Weekly reminder ID {} scheduled for {}.",
                reminder.getId(),
                nextTrigger
        );
    }
}