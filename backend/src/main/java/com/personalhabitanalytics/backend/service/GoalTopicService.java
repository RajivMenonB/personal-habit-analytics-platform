package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.repository.GoalTopicRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalTopicService {

    private final GoalTopicRepository goalTopicRepository;

    public GoalTopicService(GoalTopicRepository goalTopicRepository) {
        this.goalTopicRepository = goalTopicRepository;
    }

    public List<GoalTopic> getAllGoalTopics() {
        return goalTopicRepository.findAll();
    }

    public GoalTopic getGoalTopicById(Long id) {
        return goalTopicRepository.findById(id).orElse(null);
    }

    public GoalTopic createGoalTopic(GoalTopic goalTopic) {
        return goalTopicRepository.save(goalTopic);
    }

    public GoalTopic updateGoalTopic(Long id, GoalTopic updatedGoalTopic) {
        return goalTopicRepository.findById(id).map(goalTopic -> {
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
        }).orElse(null);
    }

    public void deleteGoalTopic(Long id) {
        goalTopicRepository.deleteById(id);
    }
}