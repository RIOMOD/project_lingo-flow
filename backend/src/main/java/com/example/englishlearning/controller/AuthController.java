package com.example.englishlearning.controller;

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
import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Register a student account")
    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Registered successfully", authService.registerStudent(request));
    }

    @Operation(summary = "Login")
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Logged in successfully", authService.login(request));
    }

    @Operation(summary = "Refresh access token")
    @PostMapping("/refresh-token")
    public ApiResponse<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success("Token refreshed successfully", authService.refreshToken(request));
    }

    @Operation(summary = "Logout")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ApiResponse.success("Logged out successfully", null);
    }

    @Operation(summary = "Get current user", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public ApiResponse<CurrentUserResponse> me(Authentication authentication) {
        return ApiResponse.success(authService.getCurrentUser(authentication.getName()));
    }

    @Operation(summary = "Change current user's password", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(authentication.getName(), request);
        return ApiResponse.success("Password changed successfully", null);
    }

    @Operation(summary = "Request password reset token")
    @PostMapping("/forgot-password")
    public ApiResponse<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ApiResponse.success("If the email exists, reset instructions will be sent", authService.forgotPassword(request));
    }

    @Operation(summary = "Reset password")
    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Password reset successfully", null);
    }
}

