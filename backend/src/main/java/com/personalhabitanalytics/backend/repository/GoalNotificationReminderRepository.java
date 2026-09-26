package com.personalhabitanalytics.backend.repository;

import com.personalhabitanalytics.backend.entity.GoalNotificationReminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalNotificationReminderRepository
        extends JpaRepository<
        GoalNotificationReminder,
        Long
        > {

    List<GoalNotificationReminder>
    findByEnabledTrue();

    Optional<GoalNotificationReminder>
    findByGoalId(Long goalId);

    Optional<GoalNotificationReminder>
    findByGoalTopicId(Long goalTopicId);

    void deleteByGoalId(Long goalId);

    void deleteByGoalTopicId(Long goalTopicId);
}