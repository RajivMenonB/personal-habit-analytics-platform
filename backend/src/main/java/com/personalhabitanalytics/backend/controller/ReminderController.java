package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.dto.ReminderRequest;
import com.personalhabitanalytics.backend.dto.ReminderResponse;
import com.personalhabitanalytics.backend.service.ReminderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;


    public ReminderController(
            ReminderService reminderService
    ) {
        this.reminderService = reminderService;
    }


    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<ReminderResponse> createReminder(
            @RequestBody ReminderRequest request,
            Authentication authentication
    ) {

        String email =
                authentication.getName();


        ReminderResponse response =
                reminderService.createReminder(
                        request,
                        email
                );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<ReminderResponse>> getMyReminders(
            Authentication authentication
    ) {

        String email =
                authentication.getName();


        return ResponseEntity.ok(
                reminderService.getMyReminders(email)
        );
    }


    // =========================================================
    // GET ONE
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<ReminderResponse> getReminder(
            @PathVariable Long id,
            Authentication authentication
    ) {

        String email =
                authentication.getName();


        return ResponseEntity.ok(
                reminderService.getReminder(
                        id,
                        email
                )
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<ReminderResponse> updateReminder(
            @PathVariable Long id,
            @RequestBody ReminderRequest request,
            Authentication authentication
    ) {

        String email =
                authentication.getName();


        return ResponseEntity.ok(
                reminderService.updateReminder(
                        id,
                        request,
                        email
                )
        );
    }


    // =========================================================
    // ENABLE / DISABLE
    // =========================================================

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ReminderResponse> toggleReminder(
            @PathVariable Long id,
            @RequestParam boolean enabled,
            Authentication authentication
    ) {

        String email =
                authentication.getName();


        return ResponseEntity.ok(
                reminderService.toggleReminder(
                        id,
                        enabled,
                        email
                )
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(
            @PathVariable Long id,
            Authentication authentication
    ) {

        String email =
                authentication.getName();


        reminderService.deleteReminder(
                id,
                email
        );


        return ResponseEntity.noContent().build();
    }
}