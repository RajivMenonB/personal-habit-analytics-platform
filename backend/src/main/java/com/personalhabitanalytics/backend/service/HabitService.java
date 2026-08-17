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

    public HabitService(
            HabitRepository habitRepository,
            UserRepository userRepository) {

        this.habitRepository = habitRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE HABIT
    // =========================================================

    public Habit createHabit(
            Habit habit,
            String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Attach logged-in user
        habit.setUser(user);

        return habitRepository.save(habit);
    }

    // =========================================================
    // GET ALL HABITS
    // =========================================================

    public List<Habit> getHabitsByUser(
            String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        return habitRepository.findByUser(user);
    }

    // =========================================================
    // GET HABIT BY ID
    // =========================================================

    public Habit getHabitById(
            Long id,
            String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Habit habit = habitRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found")
                );

        // Security check
        if (!habit.getUser()
                .getId()
                .equals(user.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to access this habit"
            );
        }

        return habit;
    }

    // =========================================================
    // UPDATE HABIT
    // =========================================================

    public Habit updateHabit(
            Long id,
            Habit updatedHabit,
            String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Habit habit = habitRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found")
                );

        // =====================================================
        // SECURITY CHECK
        // =====================================================

        if (!habit.getUser()
                .getId()
                .equals(user.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to update this habit"
            );
        }

        // =====================================================
        // BASIC INFORMATION
        // =====================================================

        habit.setTitle(
                updatedHabit.getTitle()
        );

        habit.setDescription(
                updatedHabit.getDescription()
        );

        // IMPORTANT:
        // Save Notes from frontend
        habit.setNotes(
                updatedHabit.getNotes()
        );

        // =====================================================
        // DATE
        // =====================================================

        habit.setStartDate(
                updatedHabit.getStartDate()
        );

        habit.setEndDate(
                updatedHabit.getEndDate()
        );

        // =====================================================
        // TIME
        // =====================================================

        habit.setStartTime(
                updatedHabit.getStartTime()
        );

        habit.setEndTime(
                updatedHabit.getEndTime()
        );

        // =====================================================
        // NOTIFICATIONS
        // =====================================================

        habit.setNotificationsEnabled(
                updatedHabit.getNotificationsEnabled()
        );

        habit.setReminderMinutesBefore(
                updatedHabit.getReminderMinutesBefore()
        );

        // =====================================================
        // COMPLETION
        // =====================================================

        habit.setCompleted(
                updatedHabit.getCompleted()
        );

        // =====================================================
        // TARGET & PROGRESS
        // =====================================================

        habit.setTargetCount(
                updatedHabit.getTargetCount()
        );

        habit.setCurrentProgress(
                updatedHabit.getCurrentProgress()
        );

        // =====================================================
        // PRIORITY
        // =====================================================

        habit.setPriority(
                updatedHabit.getPriority()
        );

        // =====================================================
        // STATUS
        // =====================================================

        habit.setStatus(
                updatedHabit.getStatus()
        );

        // =====================================================
        // SAVE TO DATABASE
        // =====================================================

        return habitRepository.save(habit);
    }

    // =========================================================
    // DELETE HABIT
    // =========================================================

    public void deleteHabit(
            Long id,
            String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Habit habit = habitRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Habit not found")
                );

        // Security check
        if (!habit.getUser()
                .getId()
                .equals(user.getId())) {

            throw new AccessDeniedException(
                    "You are not allowed to delete this habit"
            );
        }

        habitRepository.delete(habit);
    }
}