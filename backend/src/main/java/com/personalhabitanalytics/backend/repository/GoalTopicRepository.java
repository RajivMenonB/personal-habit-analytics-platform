package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoalTopicRepository extends JpaRepository<GoalTopic, Long> {

    // Get all topics belonging to a user
    List<GoalTopic> findByUser(User user);

    // Get all topics of a specific goal belonging to a user
    List<GoalTopic> findByGoalAndUser(Goal goal, User user);
}