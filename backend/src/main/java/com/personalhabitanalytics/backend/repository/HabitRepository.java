package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.Habit;
import com.personalhabitanalytics.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findByUser(User user);
}