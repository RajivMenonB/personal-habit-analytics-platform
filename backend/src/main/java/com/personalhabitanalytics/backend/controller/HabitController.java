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

    // Create habit for logged-in user
    @PostMapping
    public Habit createHabit(@RequestBody Habit habit,
                             Authentication authentication) {

        return habitService.createHabit(habit, authentication.getName());
    }

    // Get all habits of logged-in user
    @GetMapping
    public List<Habit> getAllHabits(Authentication authentication) {

        return habitService.getHabitsByUser(authentication.getName());
    }

    // Get habit by ID (only if it belongs to logged-in user)
    @GetMapping("/{id}")
    public Habit getHabitById(@PathVariable Long id,
                              Authentication authentication) {

        return habitService.getHabitById(id, authentication.getName());
    }

    // Update habit (only if it belongs to logged-in user)
    @PutMapping("/{id}")
    public Habit updateHabit(@PathVariable Long id,
                             @RequestBody Habit habit,
                             Authentication authentication) {

        return habitService.updateHabit(id, habit, authentication.getName());
    }

    // Delete habit (only if it belongs to logged-in user)
    @DeleteMapping("/{id}")
    public String deleteHabit(@PathVariable Long id,
                              Authentication authentication) {

        habitService.deleteHabit(id, authentication.getName());

        return "Habit deleted successfully";
    }
}