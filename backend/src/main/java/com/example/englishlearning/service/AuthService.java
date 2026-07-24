package com.example.englishlearning.service;

import com.example.englishlearning.dto.auth.AuthResponse;
import com.example.englishlearning.dto.auth.ChangePasswordRequest;
import com.example.englishlearning.dto.auth.CurrentUserResponse;
import com.example.englishlearning.dto.auth.ForgotPasswordRequest;
import com.example.englishlearning.dto.auth.ForgotPasswordResponse;
import com.example.englishlearning.dto.auth.LoginRequest;
import com.example.englishlearning.dto.auth.LogoutRequest;
import com.example.englishlearning.dto.auth.RefreshTokenRequest;
import com.example.englishlearning.dto.auth.RegisterRequest;
import com.example.englishlearning.dto.auth.ResetPasswordRequest;

public interface AuthService {

    AuthResponse registerStudent(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    void logout(LogoutRequest request);

    CurrentUserResponse getCurrentUser(String email);

    void changePassword(String email, ChangePasswordRequest request);

    ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void setAccountLocked(Long userId, boolean locked);
}

