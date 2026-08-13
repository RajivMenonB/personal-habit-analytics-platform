package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.entity.User;
import com.personalhabitanalytics.backend.repository.GoalTopicRepository;
import com.personalhabitanalytics.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalTopicService {

    private final GoalTopicRepository goalTopicRepository;
    private final UserRepository userRepository;

    public GoalTopicService(GoalTopicRepository goalTopicRepository,
                            UserRepository userRepository) {
        this.goalTopicRepository = goalTopicRepository;
        this.userRepository = userRepository;
    }

    // Get current user by email from JWT
    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Create GoalTopic for logged-in user
    public GoalTopic createGoalTopic(GoalTopic goalTopic, String email) {

        User user = getUser(email);

        goalTopic.setUser(user);

        return goalTopicRepository.save(goalTopic);
    }

    // Get all GoalTopics of logged-in user
    public List<GoalTopic> getAllGoalTopics(String email) {

        User user = getUser(email);

        return goalTopicRepository.findByUser(user);
    }

    // Get GoalTopic by ID (only if it belongs to logged-in user)
    public GoalTopic getGoalTopicById(Long id, String email) {

        User user = getUser(email);

        GoalTopic goalTopic = goalTopicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GoalTopic not found"));

        if (!goalTopic.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to access this goal topic");
        }

        return goalTopic;
    }

    // Update GoalTopic (only if it belongs to logged-in user)
    public GoalTopic updateGoalTopic(Long id,
                                     GoalTopic updatedGoalTopic,
                                     String email) {

        User user = getUser(email);

        GoalTopic goalTopic = goalTopicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GoalTopic not found"));

        if (!goalTopic.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to update this goal topic");
        }

        goalTopic.setTitle(updatedGoalTopic.getTitle());
        goalTopic.setDescription(updatedGoalTopic.getDescription());
        goalTopic.setNotes(updatedGoalTopic.getNotes());
        goalTopic.setStartDate(updatedGoalTopic.getStartDate());
        goalTopic.setEndDate(updatedGoalTopic.getEndDate());
        goalTopic.setStartTime(updatedGoalTopic.getStartTime());
        goalTopic.setEndTime(updatedGoalTopic.getEndTime());
        goalTopic.setEstimatedDuration(updatedGoalTopic.getEstimatedDuration());
        goalTopic.setActualDuration(updatedGoalTopic.getActualDuration());
        goalTopic.setProgress(updatedGoalTopic.getProgress());
        goalTopic.setPriority(updatedGoalTopic.getPriority());
        goalTopic.setStatus(updatedGoalTopic.getStatus());
        goalTopic.setNotificationsEnabled(updatedGoalTopic.getNotificationsEnabled());
        goalTopic.setReminderMinutesBefore(updatedGoalTopic.getReminderMinutesBefore());
        goalTopic.setCompleted(updatedGoalTopic.getCompleted());
        goalTopic.setGoal(updatedGoalTopic.getGoal());

        return goalTopicRepository.save(goalTopic);
    }

    // Delete GoalTopic (only if it belongs to logged-in user)
    public void deleteGoalTopic(Long id, String email) {

        User user = getUser(email);

        GoalTopic goalTopic = goalTopicRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GoalTopic not found"));

        if (!goalTopic.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to delete this goal topic");
        }

        goalTopicRepository.delete(goalTopic);
    }
}