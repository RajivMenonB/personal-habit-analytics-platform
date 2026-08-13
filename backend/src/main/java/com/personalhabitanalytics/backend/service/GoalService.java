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

    public GoalService(GoalRepository goalRepository,
                       UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    // Get currently logged-in user
    private User getCurrentUser() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Create goal for current user
    public Goal createGoal(Goal goal) {

        goal.setUser(getCurrentUser());

        return goalRepository.save(goal);
    }

    // Get only current user's goals
    public List<Goal> getAllGoals() {

        return goalRepository.findByUser(getCurrentUser());
    }

    // Get goal by id (only if it belongs to current user)
    public Goal getGoalById(Long id) {

        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(getCurrentUser().getId())) {
            throw new RuntimeException("Access denied");
        }

        return goal;
    }

    // Update goal
    public Goal updateGoal(Long id, Goal updatedGoal) {

        Goal goal = getGoalById(id);

        goal.setTitle(updatedGoal.getTitle());
        goal.setDescription(updatedGoal.getDescription());
        goal.setCategory(updatedGoal.getCategory());
        goal.setTargetValue(updatedGoal.getTargetValue());
        goal.setCurrentProgress(updatedGoal.getCurrentProgress());
        goal.setStartDate(updatedGoal.getStartDate());
        goal.setTargetDate(updatedGoal.getTargetDate());
        goal.setStartTime(updatedGoal.getStartTime());
        goal.setEndTime(updatedGoal.getEndTime());
        goal.setNotificationsEnabled(updatedGoal.getNotificationsEnabled());
        goal.setReminderMinutesBefore(updatedGoal.getReminderMinutesBefore());
        goal.setPriority(updatedGoal.getPriority());
        goal.setStatus(updatedGoal.getStatus());
        goal.setCompleted(updatedGoal.getCompleted());

        return goalRepository.save(goal);
    }

    // Delete goal
    public void deleteGoal(Long id) {

        Goal goal = getGoalById(id);

        goalRepository.delete(goal);
    }
}