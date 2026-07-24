package com.example.englishlearning.service.impl;

import com.example.englishlearning.entity.User;
import com.example.englishlearning.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtServiceImpl implements JwtService {

    @Value("${app.jwt.access-token-secret}")
    private String accessTokenSecret;

    @Value("${app.jwt.refresh-token-secret}")
    private String refreshTokenSecret;

    @Value("${app.jwt.access-token-expiration-minutes}")
    private long accessTokenExpirationMinutes;

    @Value("${app.jwt.refresh-token-expiration-days}")
    private long refreshTokenExpirationDays;

    @Override
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(accessTokenExpirationMinutes * 60);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().getCode())
                .claim("type", "ACCESS")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key(accessTokenSecret))
                .compact();
    }

    @Override
    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(refreshTokenExpirationDays * 24 * 60 * 60);

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("type", "REFRESH")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key(refreshTokenSecret))
                .compact();
    }

    @Override
    public Claims parseAccessToken(String token) {
        return Jwts.parser()
                .verifyWith(key(accessTokenSecret))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public Claims parseRefreshToken(String token) {
        return Jwts.parser()
                .verifyWith(key(refreshTokenSecret))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public long getAccessTokenExpirationSeconds() {
        return accessTokenExpirationMinutes * 60;
    }

    private SecretKey key(String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
