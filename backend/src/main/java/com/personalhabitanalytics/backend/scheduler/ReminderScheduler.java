package com.personalhabitanalytics.backend.scheduler;

import com.personalhabitanalytics.backend.entity.DeviceToken;
import com.personalhabitanalytics.backend.entity.Reminder;

import com.personalhabitanalytics.backend.repository.DeviceTokenRepository;
import com.personalhabitanalytics.backend.repository.ReminderRepository;

import com.personalhabitanalytics.backend.service.FirebaseNotificationService;

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
            LoggerFactory.getLogger(
                    ReminderScheduler.class
            );


    private final ReminderRepository reminderRepository;

    private final DeviceTokenRepository deviceTokenRepository;

    private final FirebaseNotificationService
            firebaseNotificationService;


    public ReminderScheduler(
            ReminderRepository reminderRepository,
            DeviceTokenRepository deviceTokenRepository,
            FirebaseNotificationService firebaseNotificationService
    ) {

        this.reminderRepository =
                reminderRepository;

        this.deviceTokenRepository =
                deviceTokenRepository;

        this.firebaseNotificationService =
                firebaseNotificationService;
    }


    // =========================================================
    // CHECK REMINDERS EVERY MINUTE
    // =========================================================

    @Scheduled(
            cron = "0 * * * * *"
    )
    @Transactional
    public void processReminders() {

        logger.info(
                "Checking reminders..."
        );


        List<Reminder> reminders =
                reminderRepository
                        .findByEnabledTrue();


        if (
                reminders.isEmpty()
        ) {

            logger.info(
                    "No enabled reminders found."
            );

            return;
        }


        logger.info(
                "Found {} enabled reminder(s).",
                reminders.size()
        );


        for (
                Reminder reminder :
                reminders
        ) {

            try {

                processReminder(
                        reminder
                );

            } catch (
                    Exception e
            ) {

                logger.error(
                        "Error processing reminder ID {}: {}",
                        reminder.getId(),
                        e.getMessage(),
                        e
                );
            }
        }
    }


    // =========================================================
    // PROCESS ONE REMINDER
    // =========================================================

    private void processReminder(
            Reminder reminder
    ) {

        String timezone =
                reminder.getTimezone();


        if (
                timezone == null
                        ||
                timezone.isBlank()
        ) {

            timezone =
                    "Asia/Kolkata";
        }


        ZoneId zoneId;


        try {

            zoneId =
                    ZoneId.of(
                            timezone
                    );

        } catch (
                Exception e
        ) {

            logger.warn(
                    "Invalid timezone '{}' for reminder ID {}. "
                            +
                    "Using Asia/Kolkata.",
                    timezone,
                    reminder.getId()
            );


            zoneId =
                    ZoneId.of(
                            "Asia/Kolkata"
                    );
        }


        ZonedDateTime now =
                ZonedDateTime.now(
                        zoneId
                );


        LocalDateTime currentLocalDateTime =
                now.toLocalDateTime();


        // =====================================================
        // SYSTEM GENERATED HABIT REMINDER CHECKS
        // =====================================================

        if (
                Boolean.TRUE.equals(
                        reminder.getSystemGenerated()
                )
        ) {

            /*
             * If the habit no longer has notifications enabled,
             * stop the automatic reminder.
             */

            if (
                    reminder.getHabit() == null
                            ||
                    !Boolean.TRUE.equals(
                            reminder.getHabit()
                                    .getNotificationsEnabled()
                    )
                            ||
                    Boolean.TRUE.equals(
                            reminder.getHabit()
                                    .getCompleted()
                    )
            ) {

                reminder.setEnabled(
                        false
                );


                reminder.setNextTriggerAt(
                        null
                );


                reminderRepository.save(
                        reminder
                );


                return;
            }


            /*
             * Habit has not started yet.
             */

            if (
                    reminder.getHabit()
                            .getStartDate() != null
                            &&
                    now.toLocalDate()
                            .isBefore(
                                    reminder.getHabit()
                                            .getStartDate()
                            )
            ) {

                if (
                        reminder.getReminderTime() != null
                ) {

                    reminder.setNextTriggerAt(
                            LocalDateTime.of(
                                    reminder.getHabit()
                                            .getStartDate(),
                                    reminder.getReminderTime()
                            )
                    );

                    reminderRepository.save(
                            reminder
                    );
                }

                return;
            }


            /*
             * Habit has ended.
             */

            if (
                    reminder.getHabit()
                            .getEndDate() != null
                            &&
                    now.toLocalDate()
                            .isAfter(
                                    reminder.getHabit()
                                            .getEndDate()
                            )
            ) {

                reminder.setEnabled(
                        false
                );


                reminder.setNextTriggerAt(
                        null
                );


                reminderRepository.save(
                        reminder
                );


                return;
            }
        }


        // =====================================================
        // NEXT TRIGGER
        // =====================================================

        LocalDateTime nextTriggerAt =
                reminder.getNextTriggerAt();


        if (
                nextTriggerAt == null
        ) {

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
         * Trigger when current time reaches
         * or passes the scheduled time.
         */

        if (
                !currentLocalDateTime.isBefore(
                        nextTriggerAt
                )
        ) {

            triggerReminder(
                    reminder,
                    now,
                    currentLocalDateTime,
                    timezone
            );
        }
    }


    // =========================================================
    // TRIGGER REMINDER
    // =========================================================

    private void triggerReminder(
            Reminder reminder,
            ZonedDateTime now,
            LocalDateTime currentLocalDateTime,
            String timezone
    ) {

        logger.info(
                "=========================================="
        );


        logger.info(
                "REMINDER TRIGGERED"
        );


        logger.info(
                "Reminder ID : {}",
                reminder.getId()
        );


        logger.info(
                "Title       : {}",
                reminder.getTitle()
        );


        logger.info(
                "Message     : {}",
                reminder.getMessage()
        );


        if (
                reminder.getHabit() != null
        ) {

            logger.info(
                    "Habit ID    : {}",
                    reminder.getHabit()
                            .getId()
            );


            logger.info(
                    "Habit Title : {}",
                    reminder.getHabit()
                            .getTitle()
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


        logger.info(
                "=========================================="
        );


        // =====================================================
        // SEND FCM
        // =====================================================

        sendFirebaseNotifications(
                reminder
        );


        // =====================================================
        // LAST TRIGGER
        // =====================================================

        reminder.setLastTriggeredAt(
                currentLocalDateTime
        );


        String repeatType =
                reminder.getRepeatType();


        // =====================================================
        // REPEAT TYPE
        // =====================================================

        if (
                "ONCE".equalsIgnoreCase(
                        repeatType
                )
        ) {

            handleOnceReminder(
                    reminder
            );

        } else if (
                "DAILY".equalsIgnoreCase(
                        repeatType
                )
        ) {

            handleDailyReminder(
                    reminder,
                    currentLocalDateTime
            );

        } else if (
                "WEEKLY".equalsIgnoreCase(
                        repeatType
                )
        ) {

            handleWeeklyReminder(
                    reminder,
                    currentLocalDateTime
            );

        } else {

            logger.warn(
                    "Unknown repeat type '{}' for reminder ID {}.",
                    repeatType,
                    reminder.getId()
            );


            reminder.setEnabled(
                    false
            );


            reminder.setNextTriggerAt(
                    null
            );
        }


        reminderRepository.save(
                reminder
        );
    }


    // =========================================================
    // SEND FIREBASE NOTIFICATIONS
    // =========================================================

    private void sendFirebaseNotifications(
            Reminder reminder
    ) {

        if (
                reminder.getUser() == null
        ) {

            logger.warn(
                    "Reminder ID {} has no user.",
                    reminder.getId()
            );


            return;
        }


        List<DeviceToken> devices =
                deviceTokenRepository
                        .findByUserAndActiveTrue(
                                reminder.getUser()
                        );


        if (
                devices.isEmpty()
        ) {

            logger.info(
                    "No active devices found for user of reminder ID {}.",
                    reminder.getId()
            );


            return;
        }


        logger.info(
                "Found {} active device(s) for reminder ID {}.",
                devices.size(),
                reminder.getId()
        );


        String title =
                reminder.getTitle();


        String message =
                reminder.getMessage();


        if (
                message == null
                        ||
                message.isBlank()
        ) {

            message =
                    "You have a habit reminder.";
        }


        for (
                DeviceToken device :
                devices
        ) {

            try {

                firebaseNotificationService
                        .sendNotification(
                                device.getToken(),
                                title,
                                message
                        );


                logger.info(
                        "Notification sent to device ID {}.",
                        device.getId()
                );


            } catch (
                    Exception e
            ) {

                logger.error(
                        "Failed to send notification "
                                +
                        "to device ID {}: {}",
                        device.getId(),
                        e.getMessage()
                );
            }
        }
    }


    // =========================================================
    // ONCE REMINDER
    // =========================================================

    private void handleOnceReminder(
            Reminder reminder
    ) {

        reminder.setEnabled(
                false
        );


        reminder.setNextTriggerAt(
                null
        );


        logger.info(
                "One-time reminder ID {} completed.",
                reminder.getId()
        );
    }


    // =========================================================
    // DAILY REMINDER
    // =========================================================

    private void handleDailyReminder(
            Reminder reminder,
            LocalDateTime currentLocalDateTime
    ) {

        if (
                reminder.getReminderTime() == null
        ) {

            logger.warn(
                    "Daily reminder ID {} has no reminderTime.",
                    reminder.getId()
            );


            reminder.setEnabled(
                    false
            );


            reminder.setNextTriggerAt(
                    null
            );


            return;
        }


        LocalDateTime nextTrigger =
                currentLocalDateTime
                        .toLocalDate()
                        .plusDays(1)
                        .atTime(
                                reminder.getReminderTime()
                        );


        /*
         * Stop automatic Habit reminder after end date.
         */

        if (
                Boolean.TRUE.equals(
                        reminder.getSystemGenerated()
                )
                        &&
                reminder.getHabit() != null
                        &&
                reminder.getHabit()
                                .getEndDate() != null
                        &&
                nextTrigger
                        .toLocalDate()
                        .isAfter(
                                reminder.getHabit()
                                        .getEndDate()
                        )
        ) {

            reminder.setEnabled(
                    false
            );


            reminder.setNextTriggerAt(
                    null
            );


            logger.info(
                    "System habit reminder ID {} stopped because "
                            +
                    "the habit end date was reached.",
                    reminder.getId()
            );


            return;
        }


        reminder.setNextTriggerAt(
                nextTrigger
        );


        logger.info(
                "Daily reminder ID {} scheduled for {}.",
                reminder.getId(),
                nextTrigger
        );
    }


    // =========================================================
    // WEEKLY REMINDER
    // =========================================================

    private void handleWeeklyReminder(
            Reminder reminder,
            LocalDateTime currentLocalDateTime
    ) {

        if (
                reminder.getReminderTime() == null
        ) {

            logger.warn(
                    "Weekly reminder ID {} has no reminderTime.",
                    reminder.getId()
            );


            reminder.setEnabled(
                    false
            );


            reminder.setNextTriggerAt(
                    null
            );


            return;
        }


        DayOfWeek targetDay =
                reminder.getDayOfWeek();


        /*
         * No specific day:
         * schedule one week later.
         */

        if (
                targetDay == null
        ) {

            LocalDateTime nextTrigger =
                    currentLocalDateTime
                            .toLocalDate()
                            .plusWeeks(1)
                            .atTime(
                                    reminder.getReminderTime()
                            );


            reminder.setNextTriggerAt(
                    nextTrigger
            );


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
                (
                        targetDayValue
                                -
                        currentDayValue
                                +
                        7
                ) % 7;


        if (
                daysUntilNext == 0
        ) {

            daysUntilNext =
                    7;
        }


        LocalDateTime nextTrigger =
                currentLocalDateTime
                        .toLocalDate()
                        .plusDays(
                                daysUntilNext
                        )
                        .atTime(
                                reminder.getReminderTime()
                        );


        reminder.setNextTriggerAt(
                nextTrigger
        );


        logger.info(
                "Weekly reminder ID {} scheduled for {}.",
                reminder.getId(),
                nextTrigger
        );
    }
}