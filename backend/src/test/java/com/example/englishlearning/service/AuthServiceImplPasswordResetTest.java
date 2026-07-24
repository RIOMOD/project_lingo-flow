package com.example.englishlearning.service;

import com.example.englishlearning.dto.auth.ForgotPasswordRequest;
import com.example.englishlearning.dto.auth.ForgotPasswordResponse;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.repository.*;
import com.example.englishlearning.service.impl.AuthServiceImpl;
import com.example.englishlearning.util.TokenHashUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplPasswordResetTest {
    @Mock UserRepository userRepository;
    @Mock RoleRepository roleRepository;
    @Mock UserProfileRepository profileRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordResetTokenRepository resetTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock PasswordResetEmailService emailService;
    private AuthServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new AuthServiceImpl(userRepository, roleRepository, profileRepository, refreshTokenRepository,
                resetTokenRepository, passwordEncoder, jwtService, new TokenHashUtil(), emailService);
        ReflectionTestUtils.setField(service, "resetPasswordExpirationMinutes", 15L);
    }

    @Test
    void existingAndUnknownEmailReceiveSamePublicResponse() throws Exception {
        User user = new User();
        user.setEmail("known@example.com");
        user.setStatus(User.UserStatus.ACTIVE);
        when(userRepository.findByEmailAndDeletedAtIsNull("known@example.com")).thenReturn(Optional.of(user));
        when(userRepository.findByEmailAndDeletedAtIsNull("unknown@example.com")).thenReturn(Optional.empty());

        ForgotPasswordResponse known = service.forgotPassword(request("known@example.com"));
        ForgotPasswordResponse unknown = service.forgotPassword(request("unknown@example.com"));

        assertEquals(known.getNote(), unknown.getNote());
        String json = new ObjectMapper().writeValueAsString(known);
        assertFalse(json.toLowerCase().contains("token"));
        verify(emailService).send(eq("known@example.com"), anyString());
        verifyNoMoreInteractions(emailService);
    }

    @Test
    void storesOnlyHashAndSendsRawTokenOnlyToMailBoundary() {
        User user = new User();
        user.setEmail("known@example.com");
        user.setStatus(User.UserStatus.ACTIVE);
        when(userRepository.findByEmailAndDeletedAtIsNull("known@example.com")).thenReturn(Optional.of(user));
        ArgumentCaptor<com.example.englishlearning.entity.PasswordResetToken> stored = ArgumentCaptor.forClass(com.example.englishlearning.entity.PasswordResetToken.class);
        ArgumentCaptor<String> mailed = ArgumentCaptor.forClass(String.class);

        service.forgotPassword(request("known@example.com"));

        verify(resetTokenRepository).save(stored.capture());
        verify(emailService).send(eq("known@example.com"), mailed.capture());
        assertNotEquals(mailed.getValue(), stored.getValue().getTokenHash());
        assertEquals(new TokenHashUtil().sha256(mailed.getValue()), stored.getValue().getTokenHash());
        assertNotNull(stored.getValue().getExpiresAt());
    }

    private ForgotPasswordRequest request(String email) {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(email);
        return request;
    }
}
