package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.config.JwtUtil;

import com.personalhabitanalytics.backend.dto.AuthResponse;
import com.personalhabitanalytics.backend.dto.LoginRequest;
import com.personalhabitanalytics.backend.dto.RegisterRequest;
import com.personalhabitanalytics.backend.dto.UserResponse;

import com.personalhabitanalytics.backend.entity.OtpPurpose;
import com.personalhabitanalytics.backend.entity.PendingRegistration;
import com.personalhabitanalytics.backend.entity.User;

import com.personalhabitanalytics.backend.repository.PendingRegistrationRepository;
import com.personalhabitanalytics.backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    UserService.class
            );


    private final UserRepository userRepository;

    private final PendingRegistrationRepository
            pendingRegistrationRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    private final OtpService otpService;

    private final EmailService emailService;


    public UserService(
            UserRepository userRepository,
            PendingRegistrationRepository
                    pendingRegistrationRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            OtpService otpService,
            EmailService emailService
    ) {

        this.userRepository =
                userRepository;

        this.pendingRegistrationRepository =
                pendingRegistrationRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.jwtUtil =
                jwtUtil;

        this.otpService =
                otpService;

        this.emailService =
                emailService;
    }


    // =========================================================
    // REGISTER
    // =========================================================

    @Transactional
    public String register(
            RegisterRequest request
    ) {

        String email =
                normalizeEmail(
                        request.getEmail()
                );

        String name =
                request.getName()
                        .trim();


        if (
                userRepository.existsByEmail(
                        email
                )
        ) {

            throw new RuntimeException(
                    "Email already registered. Please sign in."
            );
        }


        pendingRegistrationRepository
                .deleteByEmail(email);


        PendingRegistration pending =
                new PendingRegistration();


        pending.setName(
                name
        );

        pending.setEmail(
                email
        );


        pending.setPasswordHash(

                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        pendingRegistrationRepository.save(
                pending
        );


        otpService.sendOtp(
                email,
                OtpPurpose.REGISTER
        );


        return email;
    }


    // =========================================================
    // VERIFY REGISTRATION OTP
    // =========================================================

    @Transactional
    public String verifyRegistrationOtp(
            String email,
            String otp
    ) {

        email =
                normalizeEmail(
                        email
                );


        otpService.verifyOtp(
                email,
                OtpPurpose.REGISTER,
                otp
        );


        PendingRegistration pending =
                pendingRegistrationRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Registration request expired. Please register again."
                                        )
                        );


        if (
                userRepository.existsByEmail(
                        email
                )
        ) {

            pendingRegistrationRepository
                    .deleteByEmail(email);

            throw new RuntimeException(
                    "Email already registered. Please sign in."
            );
        }


        User user =
                new User();


        user.setName(
                pending.getName()
        );

        user.setEmail(
                pending.getEmail()
        );


        // Already BCrypt encoded
        user.setPassword(
                pending.getPasswordHash()
        );


        userRepository.save(
                user
        );


        pendingRegistrationRepository
                .deleteByEmail(email);


        return
                "Account created successfully. You can now sign in.";
    }


    // =========================================================
    // NORMAL LOGIN
    // =========================================================

    @Transactional
    public AuthResponse login(
            LoginRequest request
    ) {

        String email =
                normalizeEmail(
                        request.getEmail()
                );


        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Invalid email or password"
                                        )
                        );


        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )
        ) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }


        // =====================================================
        // THIS IS THE IMPORTANT FIX
        // =====================================================

        String token =
                jwtUtil.generateToken(
                        user.getEmail()
                );


        UserResponse userResponse =
                new UserResponse(

                        user.getId(),

                        user.getName(),

                        user.getEmail()
                );


        // =====================================================
        // LOGIN SUCCESS EMAIL
        // =====================================================

        try {

            emailService.sendLoginSuccessEmail(
                    user.getEmail(),
                    user.getName()
            );

        } catch (Exception exception) {

            /*
             * Do NOT cancel a valid login just because
             * the notification email temporarily failed.
             */

            log.warn(
                    "Login-success email could not be sent to {}",
                    user.getEmail(),
                    exception
            );
        }


        return new AuthResponse(

                token,

                "Welcome back! Sign-in successful.",

                userResponse
        );
    }


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    @Transactional
    public void forgotPassword(
            String email
    ) {

        email =
                normalizeEmail(
                        email
                );


        /*
         * Do not reveal whether the email exists.
         */

        if (
                !userRepository.existsByEmail(
                        email
                )
        ) {

            return;
        }


        otpService.sendOtp(
                email,
                OtpPurpose.RESET_PASSWORD
        );
    }


    // =========================================================
    // VERIFY RESET OTP
    // =========================================================

    @Transactional
    public String verifyResetOtp(
            String email,
            String otp
    ) {

        email =
                normalizeEmail(
                        email
                );


        if (
                !userRepository.existsByEmail(
                        email
                )
        ) {

            throw new RuntimeException(
                    "Invalid verification request."
            );
        }


        otpService.verifyOtp(
                email,
                OtpPurpose.RESET_PASSWORD,
                otp
        );


        /*
         * OTP is now verified.
         *
         * This short-lived JWT allows only password reset.
         */

        return jwtUtil.generateResetToken(
                email
        );
    }


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    @Transactional
    public void resetPassword(
            String email,
            String resetToken,
            String newPassword
    ) {

        email =
                normalizeEmail(
                        email
                );


        if (
                !jwtUtil.validateResetToken(
                        resetToken,
                        email
                )
        ) {

            throw new RuntimeException(
                    "Password reset session is invalid or expired. Please request a new OTP."
            );
        }


        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Unable to reset password."
                                        )
                        );


        user.setPassword(

                passwordEncoder.encode(
                        newPassword
                )
        );


        userRepository.save(
                user
        );
    }


    // =========================================================
    // RESEND OTP
    // =========================================================

    @Transactional
    public void resendOtp(
            String email,
            OtpPurpose purpose
    ) {

        email =
                normalizeEmail(
                        email
                );


        if (
                purpose == null
                        ||
                purpose == OtpPurpose.LOGIN
        ) {

            throw new RuntimeException(
                    "Only registration and password-reset OTPs are supported."
            );
        }


        if (
                purpose ==
                        OtpPurpose.REGISTER
        ) {

            if (
                    pendingRegistrationRepository
                            .findByEmail(email)
                            .isEmpty()
            ) {

                throw new RuntimeException(
                        "Registration request not found. Please register again."
                );
            }
        }


        if (
                purpose ==
                        OtpPurpose.RESET_PASSWORD
                        &&
                !userRepository.existsByEmail(
                        email
                )
        ) {

            return;
        }


        otpService.sendOtp(
                email,
                purpose
        );
    }


    // =========================================================
    // CURRENT USER
    // =========================================================

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(
            String email
    ) {

        User user =
                userRepository
                        .findByEmail(
                                normalizeEmail(
                                        email
                                )
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "User not found."
                                        )
                        );


        return new UserResponse(

                user.getId(),

                user.getName(),

                user.getEmail()
        );
    }


    // =========================================================
    // EMAIL NORMALIZATION
    // =========================================================

    private String normalizeEmail(
            String email
    ) {

        if (
                email == null
                        ||
                email.isBlank()
        ) {

            throw new RuntimeException(
                    "Email is required."
            );
        }


        return email
                .trim()
                .toLowerCase();
    }
}