package com.example.englishlearning.repository;

import com.example.englishlearning.entity.PaymentWebhookLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentWebhookLogRepository extends JpaRepository<PaymentWebhookLog, Long> {

    boolean existsByWebhookCode(String webhookCode);
    Optional<PaymentWebhookLog> findByWebhookCode(String webhookCode);
}
