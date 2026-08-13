package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {

    // Return only the goals belonging to a specific user
    List<Goal> findByUser(User user);
}