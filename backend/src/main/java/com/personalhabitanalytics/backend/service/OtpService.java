package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.OtpPurpose;
import com.personalhabitanalytics.backend.entity.OtpVerification;
import com.personalhabitanalytics.backend.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Value("${app.otp.expiration-minutes:5}")
    private int expirationMinutes;

    @Value("${app.otp.resend-seconds:60}")
    private int resendSeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    public OtpService(
            OtpVerificationRepository otpRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // ============================================================
    // GENERATE OTP
    // ============================================================

    private String generateOtp() {

        int number =
                100000 +
                secureRandom.nextInt(900000);

        return String.valueOf(number);
    }

    // ============================================================
    // SEND OTP
    // ============================================================

    @Transactional
    public void sendOtp(
            String email,
            OtpPurpose purpose
    ) {

        email = email
                .trim()
                .toLowerCase();

        LocalDateTime now =
                LocalDateTime.now();

        // --------------------------------------------------------
        // Check resend cooldown
        // --------------------------------------------------------

        OtpVerification latest =
                otpRepository
                        .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                                email,
                                purpose
                        )
                        .orElse(null);

        if (latest != null) {

            LocalDateTime allowedTime =
                    latest.getCreatedAt()
                            .plusSeconds(
                                    resendSeconds
                            );

            if (now.isBefore(allowedTime)) {

                long remaining =
                        java.time.Duration
                                .between(
                                        now,
                                        allowedTime
                                )
                                .getSeconds();

                throw new RuntimeException(
                        "Please wait " +
                        remaining +
                        " seconds before requesting another OTP."
                );
            }
        }

        // --------------------------------------------------------
        // Remove old unused OTPs
        // --------------------------------------------------------

        otpRepository
                .deleteByEmailAndPurposeAndUsedFalse(
                        email,
                        purpose
                );

        // --------------------------------------------------------
        // Generate new OTP
        // --------------------------------------------------------

        String otp =
                generateOtp();

        // --------------------------------------------------------
        // Hash OTP
        // --------------------------------------------------------

        String otpHash =
                passwordEncoder.encode(
                        otp
                );

        // --------------------------------------------------------
        // Create OTP entity
        // --------------------------------------------------------

        OtpVerification verification =
                new OtpVerification();

        verification.setEmail(email);

        verification.setPurpose(
                purpose
        );

        verification.setOtpHash(
                otpHash
        );

        verification.setCreatedAt(
                now
        );

        verification.setExpiresAt(
                now.plusMinutes(
                        expirationMinutes
                )
        );

        verification.setAttempts(0);

        verification.setUsed(false);

        // --------------------------------------------------------
        // Save OTP
        // --------------------------------------------------------

        OtpVerification saved =
                otpRepository.save(
                        verification
                );

        try {

            // ----------------------------------------------------
            // Send email
            // ----------------------------------------------------

            emailService.sendOtpEmail(
                    email,
                    otp,
                    purpose,
                    expirationMinutes
            );

        } catch (Exception exception) {

            /*
             * If Gmail sending fails, remove the OTP we
             * just created.
             *
             * We are inside @Transactional, so the remove
             * operation has an active EntityManager.
             */

            otpRepository.delete(
                    saved
            );

            throw new RuntimeException(
                    "Unable to send OTP email. Please check the email configuration.",
                    exception
            );
        }
    }

    // ============================================================
    // VERIFY OTP
    // ============================================================

    @Transactional
    public void verifyOtp(
            String email,
            OtpPurpose purpose,
            String otp
    ) {

        email = email
                .trim()
                .toLowerCase();

        otp = otp.trim();

        // --------------------------------------------------------
        // Basic validation
        // --------------------------------------------------------

        if (!otp.matches("\\d{6}")) {

            throw new RuntimeException(
                    "OTP must contain exactly 6 digits."
            );
        }

        // --------------------------------------------------------
        // Find latest OTP
        // --------------------------------------------------------

        OtpVerification verification =
                otpRepository
                        .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                                email,
                                purpose
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "OTP not found. Please request a new OTP."
                                )
                        );

        // --------------------------------------------------------
        // Already used
        // --------------------------------------------------------

        if (verification.isUsed()) {

            throw new RuntimeException(
                    "This OTP has already been used. Please request a new OTP."
            );
        }

        // --------------------------------------------------------
        // Expired
        // --------------------------------------------------------

        if (LocalDateTime.now()
                .isAfter(
                        verification.getExpiresAt()
                )) {

            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP."
            );
        }

        // --------------------------------------------------------
        // Maximum attempts
        // --------------------------------------------------------

        if (verification.getAttempts()
                >= maxAttempts) {

            throw new RuntimeException(
                    "Too many incorrect OTP attempts. Please request a new OTP."
            );
        }

        // --------------------------------------------------------
        // Check OTP
        // --------------------------------------------------------

        boolean matches =
                passwordEncoder.matches(
                        otp,
                        verification.getOtpHash()
                );

        if (!matches) {

            verification.setAttempts(
                    verification.getAttempts() + 1
            );

            otpRepository.save(
                    verification
            );

            int remaining =
                    Math.max(
                            0,
                            maxAttempts -
                            verification.getAttempts()
                    );

            throw new RuntimeException(
                    "Invalid OTP. " +
                    remaining +
                    " attempts remaining."
            );
        }

        // --------------------------------------------------------
        // OTP correct
        // --------------------------------------------------------

        verification.setUsed(true);

        otpRepository.save(
                verification
        );
    }
}