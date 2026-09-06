package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.Reminder;
import com.personalhabitanalytics.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUser(User user);

    List<Reminder> findByEnabledTrue();

    List<Reminder> findByHabitId(Long habitId);
}