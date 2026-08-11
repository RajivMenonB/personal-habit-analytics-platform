package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    public Goal createGoal(Goal goal) {
        return goalRepository.save(goal);
    }

    public List<Goal> getAllGoals() {
        return goalRepository.findAll();
    }

    public Optional<Goal> getGoalById(Long id) {
        return goalRepository.findById(id);
    }

    public Goal updateGoal(Long id, Goal updatedGoal) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        goal.setTitle(updatedGoal.getTitle());
        goal.setDescription(updatedGoal.getDescription());
        goal.setCategory(updatedGoal.getCategory());
        goal.setTargetValue(updatedGoal.getTargetValue());
        goal.setCurrentProgress(updatedGoal.getCurrentProgress());
        goal.setStartDate(updatedGoal.getStartDate());
        goal.setTargetDate(updatedGoal.getTargetDate());
        goal.setPriority(updatedGoal.getPriority());
        goal.setStatus(updatedGoal.getStatus());
        goal.setCompleted(updatedGoal.getCompleted());

        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }
}