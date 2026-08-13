package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.Habit;
import com.personalhabitanalytics.backend.entity.User;
import com.personalhabitanalytics.backend.repository.HabitRepository;
import com.personalhabitanalytics.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final UserRepository userRepository;

    public HabitService(HabitRepository habitRepository,
                        UserRepository userRepository) {
        this.habitRepository = habitRepository;
        this.userRepository = userRepository;
    }

    // Create habit for logged-in user
    public Habit createHabit(Habit habit, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        habit.setUser(user);

        return habitRepository.save(habit);
    }

    // Get all habits of logged-in user
    public List<Habit> getHabitsByUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return habitRepository.findByUser(user);
    }

    // Get habit by ID (only if it belongs to logged-in user)
    public Habit getHabitById(Long id, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to access this habit");
        }

        return habit;
    }

    // Update habit (only if it belongs to logged-in user)
    public Habit updateHabit(Long id, Habit updatedHabit, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to update this habit");
        }

        habit.setTitle(updatedHabit.getTitle());
        habit.setDescription(updatedHabit.getDescription());
        habit.setStartDate(updatedHabit.getStartDate());
        habit.setEndDate(updatedHabit.getEndDate());
        habit.setStartTime(updatedHabit.getStartTime());
        habit.setEndTime(updatedHabit.getEndTime());
        habit.setNotificationsEnabled(updatedHabit.getNotificationsEnabled());
        habit.setReminderMinutesBefore(updatedHabit.getReminderMinutesBefore());
        habit.setCompleted(updatedHabit.getCompleted());
        habit.setTargetCount(updatedHabit.getTargetCount());
        habit.setCurrentProgress(updatedHabit.getCurrentProgress());
        habit.setPriority(updatedHabit.getPriority());
        habit.setStatus(updatedHabit.getStatus());

        return habitRepository.save(habit);
    }

    // Delete habit (only if it belongs to logged-in user)
    public void deleteHabit(Long id, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        if (!habit.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to delete this habit");
        }

        habitRepository.delete(habit);
    }
}