package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.entity.User;
import com.personalhabitanalytics.backend.repository.GoalRepository;
import com.personalhabitanalytics.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final GoalNotificationReminderService goalNotificationReminderService;

    public GoalService(
            GoalRepository goalRepository,
            UserRepository userRepository,
            GoalNotificationReminderService goalNotificationReminderService
    ) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.goalNotificationReminderService =
                goalNotificationReminderService;
    }

    // ============================================================
    // CURRENT USER
    // ============================================================

    private User getCurrentUser() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );
    }

    // ============================================================
    // CREATE GOAL
    // ============================================================

    public Goal createGoal(Goal goal) {

        User user = getCurrentUser();

        goal.setUser(user);

        Goal savedGoal =
                goalRepository.save(goal);

        // Create/update Goal notification reminder.
        goalNotificationReminderService
                .syncGoalReminder(savedGoal);

        return savedGoal;
    }

    // ============================================================
    // GET ALL GOALS
    // ============================================================

    public List<Goal> getAllGoals() {

        return goalRepository.findByUser(
                getCurrentUser()
        );
    }

    // ============================================================
    // GET GOAL
    // ============================================================

    public Goal getGoalById(Long id) {

        Goal goal = goalRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Goal not found"
                        )
                );

        if (!goal.getUser()
                .getId()
                .equals(getCurrentUser().getId())) {

            throw new RuntimeException(
                    "Access denied"
            );
        }

        return goal;
    }

    // ============================================================
    // UPDATE GOAL
    // ============================================================

    public Goal updateGoal(
            Long id,
            Goal updatedGoal
    ) {

        Goal goal = getGoalById(id);

        goal.setTitle(
                updatedGoal.getTitle()
        );

        goal.setDescription(
                updatedGoal.getDescription()
        );

        goal.setCategory(
                updatedGoal.getCategory()
        );

        goal.setTargetValue(
                updatedGoal.getTargetValue()
        );

        goal.setCurrentProgress(
                updatedGoal.getCurrentProgress()
        );

        goal.setStartDate(
                updatedGoal.getStartDate()
        );

        /*
         * IMPORTANT:
         * Your current Goal entity uses endDate,
         * not targetDate.
         */
        goal.setEndDate(
                updatedGoal.getEndDate()
        );

        goal.setStartTime(
                updatedGoal.getStartTime()
        );

        goal.setEndTime(
                updatedGoal.getEndTime()
        );

        goal.setNotificationsEnabled(
                updatedGoal.getNotificationsEnabled()
        );

        goal.setReminderMinutesBefore(
                updatedGoal.getReminderMinutesBefore()
        );

        goal.setPriority(
                updatedGoal.getPriority()
        );

        goal.setStatus(
                updatedGoal.getStatus()
        );

        goal.setCompleted(
                updatedGoal.getCompleted()
        );

        Goal savedGoal =
                goalRepository.save(goal);

        // Re-sync notification after every update.
        goalNotificationReminderService
                .syncGoalReminder(savedGoal);

        return savedGoal;
    }

    // ============================================================
    // DELETE GOAL
    // ============================================================

    public void deleteGoal(Long id) {

        Goal goal = getGoalById(id);

        // Delete only Goal notification reminders.
        goalNotificationReminderService
                .deleteGoalReminders(
                        goal.getId()
                );

        goalRepository.delete(goal);
    }
}