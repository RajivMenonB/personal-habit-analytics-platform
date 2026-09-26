package com.personalhabitanalytics.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key;

    private final long expirationMs;

    private final long resetExpirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:86400000}") long expirationMs,
            @Value("${jwt.reset-expiration:600000}") long resetExpirationMs
    ) {

        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must contain at least 32 characters."
            );
        }

        this.key =
                Keys.hmacShaKeyFor(
                        secret.getBytes(StandardCharsets.UTF_8)
                );

        this.expirationMs = expirationMs;

        this.resetExpirationMs =
                resetExpirationMs;
    }


    // =========================================================
    // NORMAL LOGIN JWT
    // =========================================================

    public String generateToken(String email) {

        return buildToken(
                email,
                "ACCESS",
                expirationMs
        );
    }


    // =========================================================
    // PASSWORD RESET TOKEN
    // =========================================================

    public String generateResetToken(String email) {

        return buildToken(
                email,
                "PASSWORD_RESET",
                resetExpirationMs
        );
    }


    // =========================================================
    // BUILD TOKEN
    // =========================================================

    private String buildToken(
            String email,
            String purpose,
            long lifetime
    ) {

        Date now =
                new Date();

        Date expiration =
                new Date(
                        now.getTime()
                                + lifetime
                );

        return Jwts.builder()

                .setSubject(email)

                .claim(
                        "purpose",
                        purpose
                )

                .setIssuedAt(now)

                .setExpiration(
                        expiration
                )

                .signWith(
                        key,
                        SignatureAlgorithm.HS256
                )

                .compact();
    }


    // =========================================================
    // EXTRACT EMAIL
    // =========================================================

    public String extractEmail(
            String token
    ) {

        return extractClaims(
                token
        ).getSubject();
    }


    // =========================================================
    // NORMAL JWT VALIDATION
    // =========================================================

    public boolean validateToken(
            String token,
            String email
    ) {

        try {

            Claims claims =
                    extractClaims(
                            token
                    );

            return email != null

                    && email.equalsIgnoreCase(
                            claims.getSubject()
                    )

                    && "ACCESS".equals(
                            claims.get(
                                    "purpose",
                                    String.class
                            )
                    )

                    && claims.getExpiration()
                    .after(
                            new Date()
                    );

        } catch (Exception e) {

            return false;
        }
    }


    // =========================================================
    // RESET TOKEN VALIDATION
    // =========================================================

    public boolean validateResetToken(
            String token,
            String email
    ) {

        try {

            Claims claims =
                    extractClaims(
                            token
                    );

            return email != null

                    && email.equalsIgnoreCase(
                            claims.getSubject()
                    )

                    && "PASSWORD_RESET".equals(
                            claims.get(
                                    "purpose",
                                    String.class
                            )
                    )

                    && claims.getExpiration()
                    .after(
                            new Date()
                    );

        } catch (Exception e) {

            return false;
        }
    }


    // =========================================================
    // EXTRACT CLAIMS
    // =========================================================

    private Claims extractClaims(
            String token
    ) {

        return Jwts.parserBuilder()

                .setSigningKey(
                        key
                )

                .build()

                .parseClaimsJws(
                        token
                )

                .getBody();
    }
}