package com.example.englishlearning.dto.payment;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class InvoiceResponse {

    private String invoiceCode;
    private BigDecimal totalAmount;
    private String billingName;
    private String billingEmail;
    private LocalDateTime issuedAt;
}
