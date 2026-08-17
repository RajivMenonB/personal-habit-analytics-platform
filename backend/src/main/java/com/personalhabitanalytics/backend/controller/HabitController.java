package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.entity.Habit;
import com.personalhabitanalytics.backend.service.HabitService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@CrossOrigin(origins = "*")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    // =========================================================
    // CREATE HABIT
    // =========================================================

    @PostMapping
    public Habit createHabit(
            @RequestBody Habit habit,
            Authentication authentication) {

        return habitService.createHabit(
                habit,
                authentication.getName()
        );
    }

    // =========================================================
    // GET ALL HABITS
    // =========================================================

    @GetMapping
    public List<Habit> getAllHabits(
            Authentication authentication) {

        return habitService.getHabitsByUser(
                authentication.getName()
        );
    }

    // =========================================================
    // GET HABIT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public Habit getHabitById(
            @PathVariable Long id,
            Authentication authentication) {

        return habitService.getHabitById(
                id,
                authentication.getName()
        );
    }

    // =========================================================
    // UPDATE HABIT
    // =========================================================

    @PutMapping("/{id}")
    public Habit updateHabit(
            @PathVariable Long id,
            @RequestBody Habit habit,
            Authentication authentication) {

        return habitService.updateHabit(
                id,
                habit,
                authentication.getName()
        );
    }

    // =========================================================
    // DELETE HABIT
    // =========================================================

    @DeleteMapping("/{id}")
    public String deleteHabit(
            @PathVariable Long id,
            Authentication authentication) {

        habitService.deleteHabit(
                id,
                authentication.getName()
        );

        return "Habit deleted successfully";
    }
}