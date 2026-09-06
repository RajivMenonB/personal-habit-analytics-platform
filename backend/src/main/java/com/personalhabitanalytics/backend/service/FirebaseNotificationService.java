package com.personalhabitanalytics.backend.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FirebaseNotificationService {

    private final FirebaseMessaging firebaseMessaging;

    public FirebaseNotificationService(FirebaseApp firebaseApp) {
        this.firebaseMessaging =
                FirebaseMessaging.getInstance(firebaseApp);
    }

    /**
     * Send a notification to one FCM registration token.
     */
    public String sendNotification(
            String token,
            String title,
            String body
    ) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "FCM token is required"
            );
        }

        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification title is required"
            );
        }

        if (body == null || body.isBlank()) {
            throw new IllegalArgumentException(
                    "Notification body is required"
            );
        }

        Notification notification =
                Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build();

        Message message =
                Message.builder()
                        .setToken(token)
                        .setNotification(notification)
                        .putData(
                                "type",
                                "HABIT_REMINDER"
                        )
                        .build();

        try {

            String response =
                    firebaseMessaging.send(message);

            System.out.println(
                    "Firebase notification sent successfully: "
                            + response
            );

            return response;

        } catch (FirebaseMessagingException e) {

            System.err.println(
                    "Firebase notification failed: "
                            + e.getMessage()
            );

            throw new RuntimeException(
                    "Failed to send Firebase notification",
                    e
            );
        }
    }
}