package com.example.englishlearning.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class PasswordResetEmailService {
    private final JavaMailSender mailSender;
    private final String resetPasswordUrl;

    public PasswordResetEmailService(
            JavaMailSender mailSender,
            @Value("${app.frontend.reset-password-url}") String resetPasswordUrl
    ) {
        this.mailSender = mailSender;
        this.resetPasswordUrl = resetPasswordUrl;
    }

    public void send(String recipient, String rawToken) {
        String link = UriComponentsBuilder.fromUriString(resetPasswordUrl)
                .queryParam("token", rawToken)
                .build()
                .encode()
                .toUriString();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject("Lingo Flow password reset");
        message.setText("Use this one-time link to reset your password. The link expires soon:\n\n" + link);
        mailSender.send(message);
    }
}
