package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findTopByOrderIdOrderByCreatedAtDesc(Long orderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Payment> findByPaymentCode(String paymentCode);
}
