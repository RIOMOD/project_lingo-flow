package com.example.englishlearning.dto.payment;

import com.example.englishlearning.entity.PaymentTransaction;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TransactionResponse {

    private String transactionCode;
    private String paymentCode;
    private BigDecimal amount;
    private PaymentTransaction.TransactionStatus status;
    private LocalDateTime transactedAt;
}
