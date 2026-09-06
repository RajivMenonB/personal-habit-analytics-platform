package com.personalhabitanalytics.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }


    // ============================================================
    // PASSWORD ENCODER
    // ============================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // ============================================================
    // CORS CONFIGURATION
    // ============================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // --------------------------------------------------------
        // React frontend
        // --------------------------------------------------------

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173"
                )
        );


        // --------------------------------------------------------
        // HTTP methods
        // --------------------------------------------------------

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );


        // --------------------------------------------------------
        // Request headers
        // --------------------------------------------------------

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "Origin",
                        "X-Requested-With"
                )
        );


        // --------------------------------------------------------
        // Response headers
        // --------------------------------------------------------

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );


        // --------------------------------------------------------
        // Credentials
        // --------------------------------------------------------

        configuration.setAllowCredentials(true);


        // --------------------------------------------------------
        // Cache preflight response
        // --------------------------------------------------------

        configuration.setMaxAge(3600L);


        // --------------------------------------------------------
        // Register CORS configuration
        // --------------------------------------------------------

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // ============================================================
    // SECURITY FILTER CHAIN
    // ============================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // ------------------------------------------------
                // CORS
                // ------------------------------------------------

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )


                // ------------------------------------------------
                // CSRF
                // ------------------------------------------------

                .csrf(csrf ->
                        csrf.disable()
                )


                // ------------------------------------------------
                // STATELESS SESSION
                // ------------------------------------------------

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // ------------------------------------------------
                // AUTHORIZATION
                // ------------------------------------------------

                .authorizeHttpRequests(auth -> auth

                        // ----------------------------------------
                        // CORS preflight requests
                        // ----------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        ).permitAll()


                        // ----------------------------------------
                        // Authentication
                        // ----------------------------------------

                        .requestMatchers(
                                "/api/users/**"
                        ).permitAll()


                        // ----------------------------------------
                        // Goals
                        // ----------------------------------------

                        .requestMatchers(
                                "/api/goals/**"
                        ).authenticated()


                        // ----------------------------------------
                        // Habits
                        // ----------------------------------------

                        .requestMatchers(
                                "/api/habits/**"
                        ).authenticated()


                        // ----------------------------------------
                        // Goal Topics
                        // ----------------------------------------

                        .requestMatchers(
                                "/api/goal-topics/**"
                        ).authenticated()


                        // ----------------------------------------
                        // Reminders
                        // ----------------------------------------

                        .requestMatchers(
                                "/api/reminders/**"
                        ).authenticated()


                        // ----------------------------------------
                        // Device Tokens
                        // ----------------------------------------

                        .requestMatchers(
                                "/api/devices/**"
                        ).authenticated()


                        // ----------------------------------------
                        // Everything else
                        // ----------------------------------------

                        .anyRequest().authenticated()
                )


                // ------------------------------------------------
                // Disable form login
                // ------------------------------------------------

                .formLogin(
                        form -> form.disable()
                )


                // ------------------------------------------------
                // Disable HTTP Basic
                // ------------------------------------------------

                .httpBasic(
                        httpBasic -> httpBasic.disable()
                )


                // ------------------------------------------------
                // JWT FILTER
                // ------------------------------------------------

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}