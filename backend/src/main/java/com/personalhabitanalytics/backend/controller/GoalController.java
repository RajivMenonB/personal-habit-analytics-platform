package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.dto.GoalResponse;
import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.service.GoalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "*")
public class GoalController {

    private final GoalService goalService;


    public GoalController(
            GoalService goalService
    ) {

        this.goalService = goalService;
    }


    // ============================================================
    // CREATE
    // ============================================================

    @PostMapping
    public GoalResponse createGoal(
            @RequestBody Goal goal
    ) {

        Goal saved =
                goalService.createGoal(goal);

        return new GoalResponse(saved);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @GetMapping
    public List<GoalResponse> getAllGoals() {

        return goalService
                .getAllGoals()
                .stream()
                .map(GoalResponse::new)
                .toList();
    }


    // ============================================================
    // GET ONE
    // ============================================================

    @GetMapping("/{id}")
    public GoalResponse getGoalById(
            @PathVariable Long id
    ) {

        return new GoalResponse(
                goalService.getGoalById(id)
        );
    }


    // ============================================================
    // UPDATE
    // ============================================================

    @PutMapping("/{id}")
    public GoalResponse updateGoal(
            @PathVariable Long id,
            @RequestBody Goal goal
    ) {

        Goal updated =
                goalService.updateGoal(
                        id,
                        goal
                );

        return new GoalResponse(updated);
    }


    // ============================================================
    // DELETE
    // ============================================================

    @DeleteMapping("/{id}")
    public String deleteGoal(
            @PathVariable Long id
    ) {

        goalService.deleteGoal(id);

        return "Goal deleted successfully";
    }
}