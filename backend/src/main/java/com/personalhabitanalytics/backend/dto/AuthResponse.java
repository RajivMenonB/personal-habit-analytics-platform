package com.personalhabitanalytics.backend.dto;

public class AuthResponse {

    private String token;
    private String message;

    // Default constructor
    public AuthResponse() {
    }

    // Parameterized constructor
    public AuthResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }

    // Getter for token
    public String getToken() {
        return token;
    }

    // Setter for token
    public void setToken(String token) {
        this.token = token;
    }

    // Getter for message
    public String getMessage() {
        return message;
    }

    // Setter for message
    public void setMessage(String message) {
        this.message = message;
    }
}