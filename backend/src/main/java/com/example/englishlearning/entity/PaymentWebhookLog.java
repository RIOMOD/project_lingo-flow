package com.example.englishlearning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "payment_webhook_logs")
public class PaymentWebhookLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Payment.PaymentProvider provider;

    @Column(name = "webhook_code", nullable = false, unique = true, length = 150)
    private String webhookCode;

    @Column(nullable = false, columnDefinition = "JSON")
    private String payload;

    @Column(length = 500)
    private String signature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WebhookStatus status = WebhookStatus.RECEIVED;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        receivedAt = LocalDateTime.now();
    }

    public enum WebhookStatus {
        RECEIVED,
        PROCESSED,
        FAILED,
        DUPLICATED
    }
}
