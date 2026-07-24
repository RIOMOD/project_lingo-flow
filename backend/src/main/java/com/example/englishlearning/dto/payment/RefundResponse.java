package com.example.englishlearning.dto.payment;

import com.example.englishlearning.entity.RefundRequest;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class RefundResponse {

    private Long id;
    private String orderCode;
    private String userEmail;
    private String reason;
    private BigDecimal amount;
    private RefundRequest.RefundStatus status;
    private String adminNote;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
}
