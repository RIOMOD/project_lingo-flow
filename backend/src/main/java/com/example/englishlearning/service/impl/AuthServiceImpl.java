package com.example.englishlearning.service.impl;

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
import com.example.englishlearning.entity.PasswordResetToken;
import com.example.englishlearning.entity.RefreshToken;
import com.example.englishlearning.entity.Role;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.entity.UserProfile;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.exception.UnauthorizedException;
import com.example.englishlearning.repository.PasswordResetTokenRepository;
import com.example.englishlearning.repository.RefreshTokenRepository;
import com.example.englishlearning.repository.RoleRepository;
import com.example.englishlearning.repository.UserProfileRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.service.AuthService;
import com.example.englishlearning.service.JwtService;
import com.example.englishlearning.service.PasswordResetEmailService;
import com.example.englishlearning.util.TokenHashUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String ROLE_STUDENT = "STUDENT";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenHashUtil tokenHashUtil;
    private final PasswordResetEmailService passwordResetEmailService;

    @Value("${app.jwt.reset-password-token-expiration-minutes}")
    private long resetPasswordExpirationMinutes;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserProfileRepository userProfileRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            TokenHashUtil tokenHashUtil,
            PasswordResetEmailService passwordResetEmailService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userProfileRepository = userProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenHashUtil = tokenHashUtil;
        this.passwordResetEmailService = passwordResetEmailService;
    }

    @Override
    @Transactional
    public AuthResponse registerStudent(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new BadRequestException("Email is already registered");
        }

        Role studentRole = roleRepository.findByCode(ROLE_STUDENT)
                .orElseThrow(() -> new ResourceNotFoundException("Default STUDENT role not found"));

        User user = new User();
        user.setRole(studentRole);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setStatus(User.UserStatus.ACTIVE);
        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        userProfileRepository.save(profile);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = getActiveUserForLogin(normalizeEmail(request.getEmail()));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        Claims claims;
        try {
            claims = jwtService.parseRefreshToken(request.getRefreshToken());
        } catch (JwtException exception) {
            throw new UnauthorizedException("Refresh token is invalid or expired");
        }

        if (!"REFRESH".equals(claims.get("type", String.class))) {
            throw new UnauthorizedException("Refresh token is invalid");
        }

        String tokenHash = tokenHashUtil.sha256(request.getRefreshToken());
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token has been revoked"));

        if (storedToken.getRevokedAt() != null || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token has expired or been revoked");
        }

        User user = getActiveUserForLogin(claims.getSubject());
        storedToken.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(storedToken);

        return issueTokens(user);
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        String tokenHash = tokenHashUtil.sha256(request.getRefreshToken());
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String email) {
        User user = findUserByEmail(email);
        return CurrentUserResponse.from(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findUserByEmail(email);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .map(this::createResetToken)
                .orElseGet(() -> ForgotPasswordResponse.builder()
                        .note("If the email exists, reset instructions will be sent")
                        .build());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = tokenHashUtil.sha256(request.getResetToken());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Reset token is invalid"));

        if (resetToken.getUsedAt() != null || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token is expired or already used");
        }

        User user = resetToken.getUser();
        ensureAccountCanAuthenticate(user);
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    @Transactional
    public void setAccountLocked(Long userId, boolean locked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(locked ? User.UserStatus.LOCKED : User.UserStatus.ACTIVE);
        userRepository.save(user);
        if (locked) {
            refreshTokenRepository.deleteByUser(user);
        }
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        Claims refreshClaims = jwtService.parseRefreshToken(refreshToken);

        RefreshToken storedToken = new RefreshToken();
        storedToken.setUser(user);
        storedToken.setTokenHash(tokenHashUtil.sha256(refreshToken));
        storedToken.setExpiresAt(LocalDateTime.ofInstant(
                refreshClaims.getExpiration().toInstant(),
                ZoneId.systemDefault()
        ));
        refreshTokenRepository.save(storedToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresInSeconds(jwtService.getAccessTokenExpirationSeconds())
                .user(CurrentUserResponse.from(user))
                .build();
    }

    private ForgotPasswordResponse createResetToken(User user) {
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            return ForgotPasswordResponse.builder()
                    .note("If the email exists, reset instructions will be sent")
                    .build();
        }

        String resetToken = UUID.randomUUID().toString() + UUID.randomUUID();
        PasswordResetToken storedToken = new PasswordResetToken();
        storedToken.setUser(user);
        storedToken.setTokenHash(tokenHashUtil.sha256(resetToken));
        storedToken.setExpiresAt(LocalDateTime.now().plusMinutes(resetPasswordExpirationMinutes));
        passwordResetTokenRepository.save(storedToken);
        passwordResetEmailService.send(user.getEmail(), resetToken);

        return ForgotPasswordResponse.builder()
                .note("If the email exists, reset instructions will be sent")
                .build();
    }

    private User getActiveUserForLogin(String email) {
        User user = findUserByEmail(email);
        ensureAccountCanAuthenticate(user);
        return user;
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureAccountCanAuthenticate(User user) {
        if (user.getStatus() == User.UserStatus.LOCKED) {
            throw new UnauthorizedException("Account is locked");
        }
        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new UnauthorizedException("Account is not active");
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}

