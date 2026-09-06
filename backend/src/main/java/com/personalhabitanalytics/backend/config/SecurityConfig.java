package com.personalhabitanalytics.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }


    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // -------------------------------------------------
                // CORS
                // -------------------------------------------------

                .cors(Customizer.withDefaults())


                // -------------------------------------------------
                // CSRF
                // -------------------------------------------------

                // Disabled because this is a stateless REST API
                .csrf(csrf -> csrf.disable())


                // -------------------------------------------------
                // SESSION
                // -------------------------------------------------

                // JWT authentication does not use server sessions
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // -------------------------------------------------
                // AUTHORIZATION
                // -------------------------------------------------

                .authorizeHttpRequests(auth -> auth

                        // =========================================
                        // PUBLIC ENDPOINTS
                        // =========================================

                        // Login
                        // Register
                        // User-related public APIs
                        .requestMatchers(
                                "/api/users/**"
                        ).permitAll()


                        // =========================================
                        // PROTECTED ENDPOINTS
                        // =========================================

                        // Goals
                        .requestMatchers(
                                "/api/goals/**"
                        ).authenticated()


                        // Habits
                        .requestMatchers(
                                "/api/habits/**"
                        ).authenticated()


                        // Goal Topics
                        .requestMatchers(
                                "/api/goal-topics/**"
                        ).authenticated()


                        // Reminders
                        .requestMatchers(
                                "/api/reminders/**"
                        ).authenticated()


                        // =========================================
                        // EVERYTHING ELSE
                        // =========================================

                        // Any endpoint not explicitly public
                        // requires authentication
                        .anyRequest().authenticated()
                )


                // -------------------------------------------------
                // DISABLE DEFAULT LOGIN
                // -------------------------------------------------

                .formLogin(form ->
                        form.disable()
                )


                // -------------------------------------------------
                // DISABLE HTTP BASIC
                // -------------------------------------------------

                .httpBasic(httpBasic ->
                        httpBasic.disable()
                )


                // -------------------------------------------------
                // JWT FILTER
                // -------------------------------------------------

                // Run our JWT authentication filter before
                // Spring Security's username/password filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}