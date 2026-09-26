package com.personalhabitanalytics.backend.service;

import com.personalhabitanalytics.backend.entity.OtpPurpose;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;


    public EmailService(
            JavaMailSender mailSender
    ) {

        this.mailSender =
                mailSender;
    }


    // =========================================================
    // OTP EMAIL
    // =========================================================

    public void sendOtpEmail(
            String email,
            String otp,
            OtpPurpose purpose,
            int expirationMinutes
    ) {

        String subject;

        String action;


        if (
                purpose ==
                        OtpPurpose.REGISTER
        ) {

            subject =
                    "HabitMile 365 — Verify Your Email";

            action =
                    "complete your account registration";

        } else {

            subject =
                    "HabitMile 365 — Password Reset Code";

            action =
                    "reset your HabitMile 365 password";
        }


        SimpleMailMessage message =
                new SimpleMailMessage();


        message.setFrom(
                fromEmail
        );


        message.setTo(
                email
        );


        message.setSubject(
                subject
        );


        message.setText(

                "Hello,\n\n"

                        +

                "Your HabitMile 365 verification code is:\n\n"

                        +

                otp

                        +

                "\n\n"

                        +

                "Use this code to "

                        +

                action

                        +

                ".\n\n"

                        +

                "This code expires in "

                        +

                expirationMinutes

                        +

                " minutes.\n\n"

                        +

                "If you did not request this code, "
                        +
                "you can safely ignore this email.\n\n"

                        +

                "Regards,\n"

                        +

                "HabitMile 365"
        );


        mailSender.send(
                message
        );
    }


    // =========================================================
    // LOGIN SUCCESS EMAIL
    // =========================================================

    public void sendLoginSuccessEmail(
            String email,
            String name
    ) {

        String safeName =
                (
                        name == null ||
                        name.isBlank()
                )
                        ? "there"
                        : name.trim();


        String time =
                LocalDateTime.now()
                        .format(
                                DateTimeFormatter.ofPattern(
                                        "dd MMM yyyy, hh:mm a"
                                )
                        );


        try {

            MimeMessage message =
                    mailSender.createMimeMessage();


            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            false,
                            "UTF-8"
                    );


            helper.setFrom(
                    fromEmail
            );


            helper.setTo(
                    email
            );


            helper.setReplyTo(
                    fromEmail
            );


            helper.setSubject(
                    "Welcome back to HabitMile 365 — Sign-in successful"
            );


            String html =

                    "<!DOCTYPE html>"

                    +

                    "<html>"

                    +

                    "<head>"

                    +

                    "<meta charset=\"UTF-8\">"

                    +

                    "<meta name=\"viewport\" "
                    +
                    "content=\"width=device-width, initial-scale=1.0\">"

                    +

                    "</head>"

                    +

                    "<body style=\""
                    +
                    "margin:0;"
                    +
                    "padding:0;"
                    +
                    "background:#08090b;"
                    +
                    "font-family:Arial,Helvetica,sans-serif;"
                    +
                    "\">"

                    +

                    "<div style=\""
                    +
                    "max-width:620px;"
                    +
                    "margin:40px auto;"
                    +
                    "background:#111318;"
                    +
                    "border:1px solid #2b2d32;"
                    +
                    "border-radius:18px;"
                    +
                    "overflow:hidden;"
                    +
                    "color:#f5f5f5;"
                    +
                    "\">"

                    +

                    "<div style=\""
                    +
                    "padding:28px;"
                    +
                    "background:linear-gradient(135deg,#17181d,#0c0d10);"
                    +
                    "border-bottom:1px solid #2b2d32;"
                    +
                    "\">"

                    +

                    "<div style=\""
                    +
                    "font-size:13px;"
                    +
                    "letter-spacing:3px;"
                    +
                    "color:#c98a55;"
                    +
                    "font-weight:bold;"
                    +
                    "\">"

                    +

                    "HABITMILE"

                    +

                    "<span style=\"color:#ffffff;\"> 365</span>"

                    +

                    "</div>"

                    +

                    "<h1 style=\""
                    +
                    "margin:18px 0 8px;"
                    +
                    "font-size:27px;"
                    +
                    "color:#ffffff;"
                    +
                    "\">"

                    +

                    "Welcome back, "

                    +

                    escapeHtml(
                            safeName
                    )

                    +

                    " 👋"

                    +

                    "</h1>"

                    +

                    "<p style=\""
                    +
                    "margin:0;"
                    +
                    "color:#a7a7aa;"
                    +
                    "font-size:15px;"
                    +
                    "\">"

                    +

                    "Your sign-in was successful."

                    +

                    "</p>"

                    +

                    "</div>"

                    +

                    "<div style=\"padding:28px;\">"

                    +

                    "<p style=\""
                    +
                    "font-size:16px;"
                    +
                    "line-height:1.7;"
                    +
                    "color:#dddddf;"
                    +
                    "\">"

                    +

                    "You have successfully signed in to your "
                    +
                    "<strong style=\"color:#ffffff;\">HabitMile 365</strong>"
                    +
                    " account."

                    +

                    "</p>"

                    +

                    "<div style=\""
                    +
                    "margin:24px 0;"
                    +
                    "padding:18px;"
                    +
                    "background:#181a20;"
                    +
                    "border:1px solid #303238;"
                    +
                    "border-radius:12px;"
                    +
                    "\">"

                    +

                    "<div style=\""
                    +
                    "font-size:12px;"
                    +
                    "letter-spacing:1px;"
                    +
                    "text-transform:uppercase;"
                    +
                    "color:#8f9095;"
                    +
                    "\">"

                    +

                    "SIGN-IN TIME"

                    +

                    "</div>"

                    +

                    "<div style=\""
                    +
                    "margin-top:7px;"
                    +
                    "font-size:15px;"
                    +
                    "color:#ffffff;"
                    +
                    "\">"

                    +

                    escapeHtml(
                            time
                    )

                    +

                    "</div>"

                    +

                    "</div>"

                    +

                    "<p style=\""
                    +
                    "font-size:15px;"
                    +
                    "line-height:1.7;"
                    +
                    "color:#b8b8bd;"
                    +
                    "\">"

                    +

                    "You can now continue tracking your habits, "
                    +
                    "goals and personal progress."

                    +

                    "</p>"

                    +

                    "<div style=\""
                    +
                    "margin-top:24px;"
                    +
                    "padding:16px;"
                    +
                    "background:#241b16;"
                    +
                    "border-left:3px solid #c98a55;"
                    +
                    "border-radius:8px;"
                    +
                    "\">"

                    +

                    "<strong style=\"color:#e1a16d;\">Security notice</strong>"

                    +

                    "<p style=\""
                    +
                    "margin:7px 0 0;"
                    +
                    "font-size:14px;"
                    +
                    "line-height:1.6;"
                    +
                    "color:#bcb7b3;"
                    +
                    "\">"

                    +

                    "If you did not sign in to your account, "
                    +
                    "please reset your password immediately."

                    +

                    "</p>"

                    +

                    "</div>"

                    +

                    "<p style=\""
                    +
                    "margin-top:30px;"
                    +
                    "font-size:14px;"
                    +
                    "line-height:1.6;"
                    +
                    "color:#888990;"
                    +
                    "\">"

                    +

                    "Warm regards,<br>"

                    +

                    "<strong style=\"color:#ffffff;\">"
                    +
                    "HabitMile 365"
                    +
                    "</strong>"

                    +

                    "<br>"

                    +

                    "Personal Habit Analytics"

                    +

                    "</p>"

                    +

                    "</div>"

                    +

                    "<div style=\""
                    +
                    "padding:18px 28px;"
                    +
                    "background:#0c0d10;"
                    +
                    "border-top:1px solid #24262b;"
                    +
                    "font-size:12px;"
                    +
                    "color:#6f7075;"
                    +
                    "text-align:center;"
                    +
                    "\">"

                    +

                    "This is an automated security notification from HabitMile 365."

                    +

                    "</div>"

                    +

                    "</div>"

                    +

                    "</body>"

                    +

                    "</html>";


            helper.setText(
                    html,
                    true
            );


            mailSender.send(
                    message
            );


        } catch (MessagingException exception) {

            throw new RuntimeException(
                    "Unable to build the login-success email.",
                    exception
            );
        }
    }


    // =========================================================
    // HTML ESCAPING
    // =========================================================

    private String escapeHtml(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return value
                .replace(
                        "&",
                        "&amp;"
                )
                .replace(
                        "<",
                        "&lt;"
                )
                .replace(
                        ">",
                        "&gt;"
                )
                .replace(
                        "\"",
                        "&quot;"
                )
                .replace(
                        "'",
                        "&#39;"
                );
    }
}