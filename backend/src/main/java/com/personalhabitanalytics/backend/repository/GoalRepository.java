package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalRepository extends JpaRepository<Goal, Long> {
}