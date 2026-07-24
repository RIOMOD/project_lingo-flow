package com.example.englishlearning.service;

import com.example.englishlearning.entity.User;
import io.jsonwebtoken.Claims;

public interface JwtService {

    String generateAccessToken(User user);

    String generateRefreshToken(User user);

    Claims parseAccessToken(String token);

    Claims parseRefreshToken(String token);

    long getAccessTokenExpirationSeconds();
}

