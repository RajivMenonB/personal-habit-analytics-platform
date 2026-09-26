package com.personalhabitanalytics.backend.dto;

public class AuthResponse {

    private String token;

    private String message;

    private boolean otpRequired;

    private String email;

    private UserResponse user;


    public AuthResponse() {
    }


    public AuthResponse(
            String token,
            String message
    ) {

        this(
                token,
                message,
                false,
                null,
                null
        );
    }


    public AuthResponse(
            String token,
            String message,
            boolean otpRequired,
            String email
    ) {

        this(
                token,
                message,
                otpRequired,
                email,
                null
        );
    }


    public AuthResponse(
            String token,
            String message,
            UserResponse user
    ) {

        this(
                token,
                message,
                false,
                null,
                user
        );
    }


    public AuthResponse(
            String token,
            String message,
            boolean otpRequired,
            String email,
            UserResponse user
    ) {

        this.token = token;

        this.message = message;

        this.otpRequired =
                otpRequired;

        this.email =
                email;

        this.user =
                user;
    }


    public String getToken() {
        return token;
    }

    public void setToken(
            String token
    ) {
        this.token = token;
    }


    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message
    ) {
        this.message = message;
    }


    public boolean isOtpRequired() {
        return otpRequired;
    }

    public void setOtpRequired(
            boolean otpRequired
    ) {
        this.otpRequired =
                otpRequired;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email
    ) {
        this.email = email;
    }


    public UserResponse getUser() {
        return user;
    }

    public void setUser(
            UserResponse user
    ) {
        this.user = user;
    }
}