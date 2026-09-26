package com.personalhabitanalytics.backend.scheduler;

import com.personalhabitanalytics.backend.entity.DeviceToken;
import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.entity.GoalNotificationReminder;
import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.repository.DeviceTokenRepository;
import com.personalhabitanalytics.backend.repository.GoalNotificationReminderRepository;
import com.personalhabitanalytics.backend.service.FirebaseNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class GoalNotificationReminderScheduler {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    GoalNotificationReminderScheduler.class
            );

    private static final String TIMEZONE =
            "Asia/Kolkata";

    private final GoalNotificationReminderRepository repository;

    private final DeviceTokenRepository deviceTokenRepository;

    private final FirebaseNotificationService firebaseNotificationService;

    public GoalNotificationReminderScheduler(
            GoalNotificationReminderRepository repository,
            DeviceTokenRepository deviceTokenRepository,
            FirebaseNotificationService firebaseNotificationService
    ) {

        this.repository =
                repository;

        this.deviceTokenRepository =
                deviceTokenRepository;

        this.firebaseNotificationService =
                firebaseNotificationService;
    }

    // ============================================================
    // RUN EVERY MINUTE
    // ============================================================

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void processGoalNotifications() {

        ZoneId zone =
                ZoneId.of(TIMEZONE);

        LocalDateTime now =
                LocalDateTime.now(zone);

        List<GoalNotificationReminder> reminders =
                repository.findByEnabledTrue();

        if (reminders.isEmpty()) {
            return;
        }

        logger.info(
                "Checking {} Goal/Topic reminder(s).",
                reminders.size()
        );

        for (
                GoalNotificationReminder reminder :
                reminders
        ) {

            try {

                processReminder(
                        reminder,
                        now
                );

            } catch (Exception e) {

                logger.error(
                        "Goal/Topic reminder {} failed: {}",
                        reminder.getId(),
                        e.getMessage(),
                        e
                );
            }
        }
    }

    // ============================================================
    // PROCESS ONE REMINDER
    // ============================================================

    private void processReminder(
            GoalNotificationReminder reminder,
            LocalDateTime now
    ) {

        // --------------------------------------------------------
        // Validate source
        // --------------------------------------------------------

        if (reminder.getGoal() == null &&
                reminder.getGoalTopic() == null) {

            disable(
                    reminder,
                    "No Goal or Goal Topic attached."
            );

            return;
        }

        // --------------------------------------------------------
        // GOAL
        // --------------------------------------------------------

        if (reminder.getGoal() != null) {

            Goal goal =
                    reminder.getGoal();

            // Completed
            if (Boolean.TRUE.equals(
                    goal.getCompleted()
            )) {

                disable(
                        reminder,
                        "Goal completed."
                );

                return;
            }

            // Notifications disabled
            if (!Boolean.TRUE.equals(
                    goal.getNotificationsEnabled()
            )) {

                disable(
                        reminder,
                        "Goal notifications disabled."
                );

                return;
            }

            // ----------------------------------------------------
            // IMPORTANT:
            // Current Goal uses endDate.
            // ----------------------------------------------------

            LocalDate endDate =
                    goal.getEndDate();

            if (endDate != null &&
                    now.toLocalDate()
                            .isAfter(endDate)) {

                disable(
                        reminder,
                        "Goal end date passed."
                );

                return;
            }

            // Start date in future
            if (goal.getStartDate() != null &&
                    now.toLocalDate()
                            .isBefore(
                                    goal.getStartDate()
                            )) {

                return;
            }
        }

        // --------------------------------------------------------
        // GOAL TOPIC
        // --------------------------------------------------------

        if (reminder.getGoalTopic() != null) {

            GoalTopic topic =
                    reminder.getGoalTopic();

            // Completed
            if (Boolean.TRUE.equals(
                    topic.getCompleted()
            )) {

                disable(
                        reminder,
                        "Goal Topic completed."
                );

                return;
            }

            // Notifications disabled
            if (!Boolean.TRUE.equals(
                    topic.getNotificationsEnabled()
            )) {

                disable(
                        reminder,
                        "Goal Topic notifications disabled."
                );

                return;
            }
        }

        // --------------------------------------------------------
        // Get next trigger
        // --------------------------------------------------------

        LocalDateTime nextTrigger =
                reminder.getNextTriggerAt();

        if (nextTrigger == null) {

            scheduleNext(
                    reminder,
                    now
            );

            repository.save(
                    reminder
            );

            return;
        }

        // Not time yet
        if (now.isBefore(nextTrigger)) {
            return;
        }

        // --------------------------------------------------------
        // SEND FCM
        // --------------------------------------------------------

        sendNotifications(
                reminder
        );

        reminder.setLastTriggeredAt(
                now
        );

        // --------------------------------------------------------
        // Schedule next daily notification
        // --------------------------------------------------------

        scheduleNext(
                reminder,
                now
        );

        repository.save(
                reminder
        );
    }

    // ============================================================
    // SEND FCM
    // ============================================================

    private void sendNotifications(
            GoalNotificationReminder reminder
    ) {

        if (reminder.getUser() == null) {

            logger.warn(
                    "Reminder {} has no user.",
                    reminder.getId()
            );

            return;
        }

        List<DeviceToken> devices =
                deviceTokenRepository
                        .findByUserAndActiveTrue(
                                reminder.getUser()
                        );

        if (devices.isEmpty()) {

            logger.warn(
                    "No active FCM devices for Goal/Topic reminder {}.",
                    reminder.getId()
            );

            return;
        }

        String title =
                reminder.getTitle();

        String body =
                reminder.getMessage();

        for (
                DeviceToken device :
                devices
        ) {

            try {

                firebaseNotificationService
                        .sendNotification(
                                device.getToken(),
                                title,
                                body
                        );

                logger.info(
                        "Goal/Topic notification sent. " +
                                "Reminder={}, Device={}",
                        reminder.getId(),
                        device.getId()
                );

            } catch (Exception e) {

                logger.error(
                        "Could not send Goal/Topic notification " +
                                "to device {}: {}",
                        device.getId(),
                        e.getMessage()
                );
            }
        }
    }

    // ============================================================
    // SCHEDULE NEXT
    // ============================================================

    private void scheduleNext(
            GoalNotificationReminder reminder,
            LocalDateTime now
    ) {

        LocalTime time =
                reminder.getReminderTime();

        if (time == null) {

            disable(
                    reminder,
                    "Reminder time is missing."
            );

            return;
        }

        LocalDate nextDate =
                now.toLocalDate()
                        .plusDays(1);

        // --------------------------------------------------------
        // GOAL END DATE
        // --------------------------------------------------------

        if (reminder.getGoal() != null) {

            Goal goal =
                    reminder.getGoal();

            LocalDate endDate =
                    goal.getEndDate();

            if (endDate != null &&
                    nextDate.isAfter(endDate)) {

                disable(
                        reminder,
                        "Goal end date reached."
                );

                return;
            }
        }

        LocalDateTime next =
                nextDate.atTime(
                        time
                );

        reminder.setNextTriggerAt(
                next
        );

        reminder.setReminderDate(
                nextDate
        );
    }

    // ============================================================
    // DISABLE
    // ============================================================

    private void disable(
            GoalNotificationReminder reminder,
            String reason
    ) {

        logger.info(
                "Disabling Goal/Topic reminder {}: {}",
                reminder.getId(),
                reason
        );

        reminder.setEnabled(
                false
        );

        reminder.setNextTriggerAt(
                null
        );

        repository.save(
                reminder
        );
    }
}