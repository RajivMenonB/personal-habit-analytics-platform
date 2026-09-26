package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.entity.GoalNotificationReminder;
import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.repository.GoalNotificationReminderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

@Service
public class GoalNotificationReminderService {

    private static final String TIMEZONE = "Asia/Kolkata";

    private final GoalNotificationReminderRepository repository;

    public GoalNotificationReminderService(
            GoalNotificationReminderRepository repository
    ) {
        this.repository = repository;
    }

    // ============================================================
    // GOAL
    // ============================================================

    @Transactional
    public void syncGoalReminder(Goal goal) {

        if (goal == null || goal.getId() == null) {
            return;
        }

        GoalNotificationReminder reminder =
                repository.findByGoalId(goal.getId())
                        .orElseGet(GoalNotificationReminder::new);

        // --------------------------------------------------------
        // Notifications disabled
        // --------------------------------------------------------

        if (!Boolean.TRUE.equals(goal.getNotificationsEnabled())) {

            disableReminder(
                    reminder,
                    "Goal notifications are disabled."
            );

            return;
        }

        // --------------------------------------------------------
        // Goal completed
        // --------------------------------------------------------

        if (Boolean.TRUE.equals(goal.getCompleted())) {

            disableReminder(
                    reminder,
                    "Goal is completed."
            );

            return;
        }

        // --------------------------------------------------------
        // Start time required
        // --------------------------------------------------------

        if (goal.getStartTime() == null) {

            disableReminder(
                    reminder,
                    "Goal start time is missing."
            );

            return;
        }

        // --------------------------------------------------------
        // Reminder minutes
        // --------------------------------------------------------

        Integer minutesBefore =
                goal.getReminderMinutesBefore();

        if (minutesBefore == null) {
            minutesBefore = 0;
        }

        minutesBefore =
                Math.max(
                        0,
                        Math.min(
                                1439,
                                minutesBefore
                        )
                );

        // --------------------------------------------------------
        // Start date
        // --------------------------------------------------------

        LocalDate startDate =
                goal.getStartDate();

        if (startDate == null) {

            startDate =
                    LocalDate.now(
                            ZoneId.of(TIMEZONE)
                    );
        }

        // --------------------------------------------------------
        // Calculate reminder time
        // --------------------------------------------------------

        LocalTime triggerTime =
                goal.getStartTime()
                        .minusMinutes(
                                minutesBefore
                        );

        // --------------------------------------------------------
        // Goal end date
        //
        // IMPORTANT:
        // Your Goal entity uses endDate.
        // It does NOT have targetDate.
        // --------------------------------------------------------

        LocalDate endDate =
                goal.getEndDate();

        LocalDateTime nextTrigger =
                calculateNextGoalTrigger(
                        startDate,
                        triggerTime,
                        endDate
                );

        // --------------------------------------------------------
        // Configure reminder
        // --------------------------------------------------------

        reminder.setUser(
                goal.getUser()
        );

        reminder.setGoal(
                goal
        );

        reminder.setGoalTopic(
                null
        );

        reminder.setReminderType(
                "GOAL"
        );

        reminder.setTitle(
                "Goal reminder: " +
                        safeTitle(
                                goal.getTitle()
                        )
        );

        reminder.setMessage(
                "Time to work on your goal: " +
                        safeTitle(
                                goal.getTitle()
                        )
        );

        reminder.setReminderDate(
                nextTrigger.toLocalDate()
        );

        reminder.setReminderTime(
                triggerTime
        );

        reminder.setRepeatType(
                "DAILY"
        );

        reminder.setTimezone(
                TIMEZONE
        );

        reminder.setEnabled(
                true
        );

        reminder.setNextTriggerAt(
                nextTrigger
        );

        repository.save(
                reminder
        );
    }

    // ============================================================
    // GOAL TOPIC
    // ============================================================

    @Transactional
    public void syncGoalTopicReminder(
            GoalTopic topic
    ) {

        if (topic == null || topic.getId() == null) {
            return;
        }

        GoalNotificationReminder reminder =
                repository.findByGoalTopicId(
                        topic.getId()
                ).orElseGet(
                        GoalNotificationReminder::new
                );

        // --------------------------------------------------------
        // Notifications disabled
        // --------------------------------------------------------

        if (!Boolean.TRUE.equals(
                topic.getNotificationsEnabled()
        )) {

            disableReminder(
                    reminder,
                    "Goal topic notifications are disabled."
            );

            return;
        }

        // --------------------------------------------------------
        // Topic completed
        // --------------------------------------------------------

        if (Boolean.TRUE.equals(
                topic.getCompleted()
        )) {

            disableReminder(
                    reminder,
                    "Goal topic is completed."
            );

            return;
        }

        // --------------------------------------------------------
        // Start time required
        // --------------------------------------------------------

        if (topic.getStartTime() == null) {

            disableReminder(
                    reminder,
                    "Goal topic start time is missing."
            );

            return;
        }

        // --------------------------------------------------------
        // Reminder minutes
        // --------------------------------------------------------

        Integer minutesBefore =
                topic.getReminderMinutesBefore();

        if (minutesBefore == null) {
            minutesBefore = 0;
        }

        minutesBefore =
                Math.max(
                        0,
                        Math.min(
                                1439,
                                minutesBefore
                        )
                );

        // --------------------------------------------------------
        // Trigger time
        // --------------------------------------------------------

        LocalTime triggerTime =
                topic.getStartTime()
                        .minusMinutes(
                                minutesBefore
                        );

        ZoneId zone =
                ZoneId.of(TIMEZONE);

        LocalDate today =
                LocalDate.now(zone);

        LocalDateTime now =
                LocalDateTime.now(zone);

        LocalDateTime nextTrigger =
                today.atTime(
                        triggerTime
                );

        // If today's reminder time already passed,
        // schedule tomorrow.
        if (!nextTrigger.isAfter(now)) {

            nextTrigger =
                    nextTrigger.plusDays(1);
        }

        // --------------------------------------------------------
        // Configure reminder
        // --------------------------------------------------------

        reminder.setUser(
                topic.getUser()
        );

        reminder.setGoalTopic(
                topic
        );

        reminder.setGoal(
                null
        );

        reminder.setReminderType(
                "GOAL_TOPIC"
        );

        reminder.setTitle(
                "Goal topic reminder: " +
                        safeTitle(
                                topic.getTopicName()
                        )
        );

        reminder.setMessage(
                "Time to work on your topic: " +
                        safeTitle(
                                topic.getTopicName()
                        )
        );

        reminder.setReminderDate(
                nextTrigger.toLocalDate()
        );

        reminder.setReminderTime(
                triggerTime
        );

        reminder.setRepeatType(
                "DAILY"
        );

        reminder.setTimezone(
                TIMEZONE
        );

        reminder.setEnabled(
                true
        );

        reminder.setNextTriggerAt(
                nextTrigger
        );

        repository.save(
                reminder
        );
    }

    // ============================================================
    // DELETE GOAL REMINDER
    // ============================================================

    @Transactional
    public void deleteGoalReminders(
            Long goalId
    ) {

        if (goalId == null) {
            return;
        }

        repository.deleteByGoalId(
                goalId
        );
    }

    // ============================================================
    // DELETE GOAL TOPIC REMINDER
    // ============================================================

    @Transactional
    public void deleteGoalTopicReminders(
            Long topicId
    ) {

        if (topicId == null) {
            return;
        }

        repository.deleteByGoalTopicId(
                topicId
        );
    }

    // ============================================================
    // CALCULATE NEXT GOAL TRIGGER
    // ============================================================

    private LocalDateTime calculateNextGoalTrigger(
            LocalDate startDate,
            LocalTime triggerTime,
            LocalDate endDate
    ) {

        ZoneId zone =
                ZoneId.of(TIMEZONE);

        LocalDate today =
                LocalDate.now(zone);

        LocalDateTime now =
                LocalDateTime.now(zone);

        // --------------------------------------------------------
        // Start date is in future
        // --------------------------------------------------------

        if (startDate.isAfter(today)) {

            return startDate.atTime(
                    triggerTime
            );
        }

        // --------------------------------------------------------
        // End date already passed
        // --------------------------------------------------------

        if (endDate != null &&
                today.isAfter(endDate)) {

            return today.atTime(
                    triggerTime
            );
        }

        // --------------------------------------------------------
        // Today's trigger
        // --------------------------------------------------------

        LocalDateTime todayTrigger =
                today.atTime(
                        triggerTime
                );

        if (todayTrigger.isAfter(now)) {

            return todayTrigger;
        }

        // --------------------------------------------------------
        // Tomorrow
        // --------------------------------------------------------

        LocalDate tomorrow =
                today.plusDays(1);

        // Do not schedule after goal end date.
        if (endDate != null &&
                tomorrow.isAfter(endDate)) {

            return todayTrigger;
        }

        return tomorrow.atTime(
                triggerTime
        );
    }

    // ============================================================
    // DISABLE REMINDER
    // ============================================================

    private void disableReminder(
            GoalNotificationReminder reminder,
            String reason
    ) {

        if (reminder.getId() == null) {
            return;
        }

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

    // ============================================================
    // SAFE TITLE
    // ============================================================

    private String safeTitle(
            String value
    ) {

        if (value == null ||
                value.isBlank()) {

            return "your task";
        }

        return value.trim();
    }
}