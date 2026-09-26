package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.Goal;
import com.personalhabitanalytics.backend.entity.GoalTopic;
import com.personalhabitanalytics.backend.entity.User;
import com.personalhabitanalytics.backend.repository.GoalRepository;
import com.personalhabitanalytics.backend.repository.GoalTopicRepository;
import com.personalhabitanalytics.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalTopicService {

    private final GoalTopicRepository goalTopicRepository;

    private final GoalRepository goalRepository;

    private final UserRepository userRepository;


    public GoalTopicService(
            GoalTopicRepository goalTopicRepository,
            GoalRepository goalRepository,
            UserRepository userRepository
    ) {

        this.goalTopicRepository =
                goalTopicRepository;

        this.goalRepository =
                goalRepository;

        this.userRepository =
                userRepository;
    }


    // ============================================================
    // USER
    // ============================================================

    private User getUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found"
                        )
                );
    }


    // ============================================================
    // CREATE TOPIC
    // ============================================================

    public GoalTopic createGoalTopic(
            GoalTopic topic,
            String email
    ) {

        User user = getUser(email);


        if (
                topic.getGoal() == null ||
                topic.getGoal().getId() == null
        ) {

            throw new RuntimeException(
                    "Goal is required to create a topic"
            );
        }


        Long goalId =
                topic.getGoal().getId();


        Goal goal =
                goalRepository
                        .findById(goalId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Goal not found"
                                )
                        );


        /*
         * SECURITY:
         *
         * The topic can only be attached to
         * a Goal owned by the logged-in user.
         */
        if (
                goal.getUser() == null ||
                !goal.getUser()
                        .getId()
                        .equals(user.getId())
        ) {

            throw new AccessDeniedException(
                    "You are not allowed to add a topic to this goal"
            );
        }


        topic.setId(null);

        topic.setUser(user);

        topic.setGoal(goal);


        return goalTopicRepository.save(topic);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    public List<GoalTopic> getAllGoalTopics(
            String email
    ) {

        User user = getUser(email);

        return goalTopicRepository
                .findByUser(user);
    }


    // ============================================================
    // GET ONE
    // ============================================================

    public GoalTopic getGoalTopicById(
            Long id,
            String email
    ) {

        User user = getUser(email);


        GoalTopic topic =
                goalTopicRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Goal topic not found"
                                )
                        );


        if (
                topic.getUser() == null ||
                !topic.getUser()
                        .getId()
                        .equals(user.getId())
        ) {

            throw new AccessDeniedException(
                    "You are not allowed to access this goal topic"
            );
        }


        return topic;
    }


    // ============================================================
    // UPDATE
    // ============================================================

    public GoalTopic updateGoalTopic(
            Long id,
            GoalTopic updated,
            String email
    ) {

        GoalTopic topic =
                getGoalTopicById(
                        id,
                        email
                );


        // --------------------------------------------------------
        // BASIC
        // --------------------------------------------------------

        topic.setTopicName(
                updated.getTopicName()
        );

        topic.setDescription(
                updated.getDescription()
        );

        topic.setNotes(
                updated.getNotes()
        );


        // --------------------------------------------------------
        // DATE
        // --------------------------------------------------------

        topic.setStartDate(
                updated.getStartDate()
        );

        topic.setEndDate(
                updated.getEndDate()
        );


        // --------------------------------------------------------
        // TIME
        // --------------------------------------------------------

        topic.setStartTime(
                updated.getStartTime()
        );

        topic.setEndTime(
                updated.getEndTime()
        );


        // --------------------------------------------------------
        // DURATION
        // --------------------------------------------------------

        topic.setEstimatedDuration(
                updated.getEstimatedDuration()
        );

        topic.setActualDuration(
                updated.getActualDuration()
        );


        // --------------------------------------------------------
        // PROGRESS
        // --------------------------------------------------------

        Integer progress =
                updated.getProgress();

        if (progress == null) {
            progress = 0;
        }

        progress =
                Math.max(
                        0,
                        Math.min(
                                100,
                                progress
                        )
                );

        topic.setProgress(progress);


        // --------------------------------------------------------
        // PRIORITY
        // --------------------------------------------------------

        topic.setPriority(
                updated.getPriority()
        );


        // --------------------------------------------------------
        // STATUS
        // --------------------------------------------------------

        topic.setStatus(
                updated.getStatus()
        );


        // --------------------------------------------------------
        // NOTIFICATIONS
        // --------------------------------------------------------

        topic.setNotificationsEnabled(
                updated.getNotificationsEnabled()
        );

        topic.setReminderMinutesBefore(
                updated.getReminderMinutesBefore()
        );


        // --------------------------------------------------------
        // COMPLETION
        // --------------------------------------------------------

        topic.setCompleted(
                updated.getCompleted()
        );


        /*
         * VERY IMPORTANT:
         *
         * We intentionally DO NOT execute:
         *
         * topic.setGoal(updated.getGoal());
         *
         * Therefore a user cannot take an existing topic
         * and move it to another user's Goal.
         */


        return goalTopicRepository.save(topic);
    }


    // ============================================================
    // DELETE
    // ============================================================

    public void deleteGoalTopic(
            Long id,
            String email
    ) {

        GoalTopic topic =
                getGoalTopicById(
                        id,
                        email
                );

        goalTopicRepository.delete(topic);
    }
}