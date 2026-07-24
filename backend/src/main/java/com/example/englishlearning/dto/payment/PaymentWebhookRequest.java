package com.example.englishlearning.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Getter
@Setter
public class PaymentWebhookRequest {

    @NotBlank
    private String paymentCode;

    @NotBlank
    private String webhookCode;

    @NotBlank
    private String orderCode;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private Long timestamp;

    @NotBlank
    private String gatewayTransactionCode;

    @NotBlank
    private String status = "SUCCESS";

    @NotBlank
    private String signature;
}
