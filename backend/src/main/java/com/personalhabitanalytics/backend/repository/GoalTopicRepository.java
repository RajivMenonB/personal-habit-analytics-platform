package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.GoalTopic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GoalTopicRepository extends JpaRepository<GoalTopic, Long> {
}