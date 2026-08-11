package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.dto.AuthResponse;
import com.personalhabitanalytics.backend.dto.LoginRequest;
import com.personalhabitanalytics.backend.dto.RegisterRequest;
import com.personalhabitanalytics.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {

        String message = userService.register(request);

        return ResponseEntity.ok(new AuthResponse(null, message));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {

        String token = userService.login(request);

        return ResponseEntity.ok(new AuthResponse(token, "Login successful"));
    }
}