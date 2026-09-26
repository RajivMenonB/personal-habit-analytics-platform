package com.personalhabitanalytics.backend.controller;

import com.personalhabitanalytics.backend.dto.AuthResponse;
import com.personalhabitanalytics.backend.dto.ForgotPasswordRequest;
import com.personalhabitanalytics.backend.dto.LoginRequest;
import com.personalhabitanalytics.backend.dto.OtpRequest;
import com.personalhabitanalytics.backend.dto.RegisterRequest;
import com.personalhabitanalytics.backend.dto.ResendOtpRequest;
import com.personalhabitanalytics.backend.dto.ResetPasswordRequest;

import com.personalhabitanalytics.backend.entity.OtpPurpose;

import com.personalhabitanalytics.backend.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    private final UserService userService;


    public UserController(
            UserService userService
    ) {

        this.userService =
                userService;
    }


    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid
            @RequestBody
            RegisterRequest request
    ) {

        String email =
                userService.register(
                        request
                );


        return ResponseEntity.ok(

                new AuthResponse(

                        null,

                        "Verification code sent to your email.",

                        true,

                        email
                )
        );
    }


    // =========================================================
    // VERIFY REGISTER OTP
    // =========================================================

    @PostMapping(
            "/verify-register-otp"
    )
    public ResponseEntity<AuthResponse>
    verifyRegisterOtp(
            @Valid
            @RequestBody
            OtpRequest request
    ) {

        String message =
                userService.verifyRegistrationOtp(

                        request.getEmail(),

                        request.getOtp()
                );


        return ResponseEntity.ok(

                new AuthResponse(

                        null,

                        message
                )
        );
    }


    // =========================================================
    // NORMAL LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid
            @RequestBody
            LoginRequest request
    ) {

        return ResponseEntity.ok(

                userService.login(
                        request
                )
        );
    }


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @PostMapping(
            "/forgot-password"
    )
    public ResponseEntity<AuthResponse>
    forgotPassword(
            @Valid
            @RequestBody
            ForgotPasswordRequest request
    ) {

        userService.forgotPassword(
                request.getEmail()
        );


        return ResponseEntity.ok(

                new AuthResponse(

                        null,

                        "If an account exists for that email, a verification code has been sent."
                )
        );
    }


    // =========================================================
    // VERIFY PASSWORD RESET OTP
    // =========================================================

    @PostMapping(
            "/verify-reset-otp"
    )
    public ResponseEntity<AuthResponse>
    verifyResetOtp(
            @Valid
            @RequestBody
            OtpRequest request
    ) {

        String resetToken =
                userService.verifyResetOtp(

                        request.getEmail(),

                        request.getOtp()
                );


        return ResponseEntity.ok(

                new AuthResponse(

                        resetToken,

                        "Verification successful. You can now set a new password."
                )
        );
    }


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @PostMapping(
            "/reset-password"
    )
    public ResponseEntity<AuthResponse>
    resetPassword(
            @Valid
            @RequestBody
            ResetPasswordRequest request
    ) {

        userService.resetPassword(

                request.getEmail(),

                request.getResetToken(),

                request.getNewPassword()
        );


        return ResponseEntity.ok(

                new AuthResponse(

                        null,

                        "Password changed successfully. You can now sign in."
                )
        );
    }


    // =========================================================
    // RESEND OTP
    // =========================================================

    @PostMapping(
            "/resend-otp"
    )
    public ResponseEntity<AuthResponse>
    resendOtp(
            @Valid
            @RequestBody
            ResendOtpRequest request
    ) {

        OtpPurpose purpose;


        try {

            purpose =
                    OtpPurpose.valueOf(

                            request.getPurpose()
                                    .trim()
                                    .toUpperCase()
                    );

        } catch (
                IllegalArgumentException exception
        ) {

            throw new RuntimeException(
                    "Invalid OTP purpose."
            );
        }


        userService.resendOtp(

                request.getEmail(),

                purpose
        );


        return ResponseEntity.ok(

                new AuthResponse(

                        null,

                        "A new verification code has been sent."
                )
        );
    }


    // =========================================================
    // CURRENT USER
    // =========================================================

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(
            Authentication authentication
    ) {

        return ResponseEntity.ok(

                new AuthResponse(

                        null,

                        "User profile loaded.",

                        userService.getCurrentUser(
                                authentication.getName()
                        )
                )
        );
    }
}