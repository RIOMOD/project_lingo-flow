package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.payment.MockCompleteRequest;
import com.example.englishlearning.dto.payment.PaymentResponse;
import com.example.englishlearning.dto.payment.PaymentWebhookRequest;
import com.example.englishlearning.service.CommerceService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final CommerceService commerceService;

    public PaymentController(CommerceService commerceService) {
        this.commerceService = commerceService;
    }

    @PostMapping("/{orderCode}/create")
    public ApiResponse<PaymentResponse> createPayment(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ApiResponse.success("Payment initialized", commerceService.createPayment(authentication.getName(), orderCode));
    }

    @GetMapping("/return")
    public ApiResponse<PaymentResponse> paymentReturn(@RequestParam Map<String, String> params) {
        return ApiResponse.success("Payment return handled", commerceService.handlePaymentReturn(params));
    }

    @PostMapping("/webhook")
    public ApiResponse<PaymentResponse> paymentWebhook(@Valid @RequestBody PaymentWebhookRequest request) {
        return ApiResponse.success("Payment webhook handled", commerceService.handlePaymentWebhook(request));
    }

    @GetMapping("/{orderCode}/status")
    public ApiResponse<PaymentResponse> getPaymentStatus(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ApiResponse.success(commerceService.getPaymentStatus(authentication.getName(), orderCode));
    }

    /**
     * Mock payment completion endpoint — for testing only.
     * Only works with MOCK provider. Only the order owner can call this.
     */
    @PostMapping("/{orderCode}/mock-complete")
    public ApiResponse<PaymentResponse> mockComplete(
            Authentication authentication,
            @PathVariable String orderCode,
            @Valid @RequestBody MockCompleteRequest request
    ) {
        return ApiResponse.success(
                "Mock payment " + request.getStatus().toLowerCase(),
                commerceService.mockCompletePayment(authentication.getName(), orderCode, request.getStatus())
        );
    }
}
