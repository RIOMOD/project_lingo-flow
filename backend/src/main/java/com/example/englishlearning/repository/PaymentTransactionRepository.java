package com.example.englishlearning.repository;

import com.example.englishlearning.entity.PaymentTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Page<PaymentTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    boolean existsByTransactionCode(String transactionCode);
    boolean existsByGatewayTransactionCode(String gatewayTransactionCode);
}
