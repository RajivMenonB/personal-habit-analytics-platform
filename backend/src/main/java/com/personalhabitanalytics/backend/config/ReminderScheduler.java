package com.personalhabitanalytics.backend.config;

import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.entity.Habit;
import com.personalhabitanalytics.backend.repository.GoalTopicRepository;
import com.personalhabitanalytics.backend.repository.HabitRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class ReminderScheduler {

    private final GoalTopicRepository goalTopicRepository;
    private final HabitRepository habitRepository;

    public ReminderScheduler(GoalTopicRepository goalTopicRepository,
                             HabitRepository habitRepository) {
        this.goalTopicRepository = goalTopicRepository;
        this.habitRepository = habitRepository;
    }

    // Runs every minute
    @Scheduled(cron = "0 * * * * *")
    public void checkReminders() {

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withSecond(0).withNano(0);

        System.out.println("Checking reminders at: " + now);

        // Goal Topics
        List<GoalTopic> topics = goalTopicRepository.findAll();

        for (GoalTopic topic : topics) {

            if (Boolean.TRUE.equals(topic.getNotificationsEnabled())
                    && !Boolean.TRUE.equals(topic.getCompleted())
                    && topic.getStartDate().equals(today)) {

                LocalTime reminderTime =
                        topic.getStartTime()
                                .minusMinutes(topic.getReminderMinutesBefore());

                if (reminderTime.equals(now)) {
                    System.out.println("📘 Goal Topic Reminder: " + topic.getTitle());
                }
            }
        }

        // Habits
        List<Habit> habits = habitRepository.findAll();

        for (Habit habit : habits) {

            if (Boolean.TRUE.equals(habit.getNotificationsEnabled())
                    && !Boolean.TRUE.equals(habit.getCompleted())
                    && habit.getStartDate().equals(today)) {

                LocalTime reminderTime =
                        habit.getStartTime()
                                .minusMinutes(habit.getReminderMinutesBefore());

                if (reminderTime.equals(now)) {
                    System.out.println("🔥 Habit Reminder: " + habit.getTitle());
                }
            }
        }
    }
}