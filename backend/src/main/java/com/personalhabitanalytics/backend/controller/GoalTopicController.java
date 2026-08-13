package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.service.GoalTopicService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goal-topics")
@CrossOrigin(origins = "*")
public class GoalTopicController {

    private final GoalTopicService goalTopicService;

    public GoalTopicController(GoalTopicService goalTopicService) {
        this.goalTopicService = goalTopicService;
    }

    // Get all GoalTopics of logged-in user
    @GetMapping
    public List<GoalTopic> getAllGoalTopics(Authentication authentication) {

        return goalTopicService.getAllGoalTopics(authentication.getName());
    }

    // Get GoalTopic by ID (only if it belongs to logged-in user)
    @GetMapping("/{id}")
    public GoalTopic getGoalTopicById(@PathVariable Long id,
                                      Authentication authentication) {

        return goalTopicService.getGoalTopicById(id, authentication.getName());
    }

    // Create GoalTopic for logged-in user
    @PostMapping
    public GoalTopic createGoalTopic(@RequestBody GoalTopic goalTopic,
                                     Authentication authentication) {

        return goalTopicService.createGoalTopic(goalTopic, authentication.getName());
    }

    // Update GoalTopic (only if it belongs to logged-in user)
    @PutMapping("/{id}")
    public GoalTopic updateGoalTopic(@PathVariable Long id,
                                     @RequestBody GoalTopic goalTopic,
                                     Authentication authentication) {

        return goalTopicService.updateGoalTopic(id, goalTopic, authentication.getName());
    }

    // Delete GoalTopic (only if it belongs to logged-in user)
    @DeleteMapping("/{id}")
    public String deleteGoalTopic(@PathVariable Long id,
                                  Authentication authentication) {

        goalTopicService.deleteGoalTopic(id, authentication.getName());

        return "Goal topic deleted successfully";
    }
}