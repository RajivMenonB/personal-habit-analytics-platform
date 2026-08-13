package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.service.GoalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    // Create goal
    @PostMapping
    public Goal createGoal(@RequestBody Goal goal) {
        return goalService.createGoal(goal);
    }

    // Get all goals of logged-in user
    @GetMapping
    public List<Goal> getAllGoals() {
        return goalService.getAllGoals();
    }

    // Get goal by ID
    @GetMapping("/{id}")
    public Goal getGoalById(@PathVariable Long id) {
        return goalService.getGoalById(id);
    }

    // Update goal
    @PutMapping("/{id}")
    public Goal updateGoal(@PathVariable Long id,
                           @RequestBody Goal goal) {
        return goalService.updateGoal(id, goal);
    }

    // Delete goal
    @DeleteMapping("/{id}")
    public String deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return "Goal deleted successfully";
    }
}