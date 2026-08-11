package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HabitRepository extends JpaRepository<Habit, Long> {
}