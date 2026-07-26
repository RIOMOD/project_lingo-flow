package com.example.englishlearning.dto.payment;

import com.example.englishlearning.entity.Order;
import com.example.englishlearning.entity.Payment;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class PaymentResponse {

    private String orderCode;
    private String paymentCode;
    private Payment.PaymentProvider provider;
    private Payment.PaymentStatus status;
    private Order.OrderStatus orderStatus;
    private BigDecimal amount;
    private String paymentUrl;
    private LocalDateTime paidAt;
    private String failedReason;
}
