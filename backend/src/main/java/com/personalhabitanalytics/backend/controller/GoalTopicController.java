package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.service.GoalTopicService;
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

    @GetMapping
    public List<GoalTopic> getAllGoalTopics() {
        return goalTopicService.getAllGoalTopics();
    }

    @GetMapping("/{id}")
    public GoalTopic getGoalTopicById(@PathVariable Long id) {
        return goalTopicService.getGoalTopicById(id);
    }

    @PostMapping
    public GoalTopic createGoalTopic(@RequestBody GoalTopic goalTopic) {
        return goalTopicService.createGoalTopic(goalTopic);
    }

    @PutMapping("/{id}")
    public GoalTopic updateGoalTopic(@PathVariable Long id,
                                     @RequestBody GoalTopic goalTopic) {
        return goalTopicService.updateGoalTopic(id, goalTopic);
    }

    @DeleteMapping("/{id}")
    public void deleteGoalTopic(@PathVariable Long id) {
        goalTopicService.deleteGoalTopic(id);
    }
}