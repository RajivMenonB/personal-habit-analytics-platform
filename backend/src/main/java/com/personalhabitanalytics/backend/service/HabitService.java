package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.Habit;
import com.personalhabitanalytics.backend.repository.HabitRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HabitService {

    private final HabitRepository habitRepository;

    public HabitService(HabitRepository habitRepository) {
        this.habitRepository = habitRepository;
    }

    public List<Habit> getAllHabits() {
        return habitRepository.findAll();
    }

    public Optional<Habit> getHabitById(Long id) {
        return habitRepository.findById(id);
    }

    public Habit createHabit(Habit habit) {
        return habitRepository.save(habit);
    }

    public Habit updateHabit(Long id, Habit updatedHabit) {
        Habit habit = habitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        habit.setTitle(updatedHabit.getTitle());
        habit.setDescription(updatedHabit.getDescription());
        habit.setStartDate(updatedHabit.getStartDate());
        habit.setEndDate(updatedHabit.getEndDate());
        habit.setStartTime(updatedHabit.getStartTime());
        habit.setEndTime(updatedHabit.getEndTime());

        // FIXED
        habit.setNotificationsEnabled(updatedHabit.getNotificationsEnabled());
        habit.setReminderMinutesBefore(updatedHabit.getReminderMinutesBefore());

        // FIXED
        habit.setCompleted(updatedHabit.getCompleted());

        habit.setTargetCount(updatedHabit.getTargetCount());
        habit.setCurrentProgress(updatedHabit.getCurrentProgress());
        habit.setPriority(updatedHabit.getPriority());
        habit.setStatus(updatedHabit.getStatus());

        return habitRepository.save(habit);
    }

    public void deleteHabit(Long id) {
        habitRepository.deleteById(id);
    }
}