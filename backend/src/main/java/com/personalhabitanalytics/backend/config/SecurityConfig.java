package com.personalhabitanalytics.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // BCrypt password encoder bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Security configuration
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for APIs

                .authorizeHttpRequests(auth -> auth
                        // Allow all APIs for now
                        .requestMatchers("/api/users/**").permitAll()
                        .anyRequest().permitAll()
                )

                // Disable default Spring Security login page
                .formLogin(form -> form.disable())

                // Disable browser popup authentication
                .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }
}