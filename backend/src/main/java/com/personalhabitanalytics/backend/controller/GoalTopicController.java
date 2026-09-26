package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.dto.GoalTopicResponse;
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


    public GoalTopicController(
            GoalTopicService goalTopicService
    ) {

        this.goalTopicService =
                goalTopicService;
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @GetMapping
    public List<GoalTopicResponse> getAllGoalTopics(
            Authentication authentication
    ) {

        return goalTopicService
                .getAllGoalTopics(
                        authentication.getName()
                )
                .stream()
                .map(GoalTopicResponse::new)
                .toList();
    }


    // ============================================================
    // GET ONE
    // ============================================================

    @GetMapping("/{id}")
    public GoalTopicResponse getGoalTopicById(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return new GoalTopicResponse(
                goalTopicService.getGoalTopicById(
                        id,
                        authentication.getName()
                )
        );
    }


    // ============================================================
    // CREATE
    // ============================================================

    @PostMapping
    public GoalTopicResponse createGoalTopic(
            @RequestBody GoalTopic goalTopic,
            Authentication authentication
    ) {

        GoalTopic created =
                goalTopicService.createGoalTopic(
                        goalTopic,
                        authentication.getName()
                );

        return new GoalTopicResponse(created);
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @PutMapping("/{id}")
    public GoalTopicResponse updateGoalTopic(
            @PathVariable Long id,
            @RequestBody GoalTopic goalTopic,
            Authentication authentication
    ) {

        GoalTopic updated =
                goalTopicService.updateGoalTopic(
                        id,
                        goalTopic,
                        authentication.getName()
                );

        return new GoalTopicResponse(updated);
    }


    // ============================================================
    // DELETE
    // ============================================================

    @DeleteMapping("/{id}")
    public String deleteGoalTopic(
            @PathVariable Long id,
            Authentication authentication
    ) {

        goalTopicService.deleteGoalTopic(
                id,
                authentication.getName()
        );

        return "Goal topic deleted successfully";
    }
}