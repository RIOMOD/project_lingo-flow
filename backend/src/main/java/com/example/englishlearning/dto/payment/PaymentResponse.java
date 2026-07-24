package com.example.englishlearning.dto.payment;

import com.example.englishlearning.entity.Payment;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class PaymentResponse {

    private String orderCode;
    private String paymentCode;
    private Payment.PaymentProvider provider;
    private Payment.PaymentStatus status;
    private BigDecimal amount;
    private String paymentUrl;
}
