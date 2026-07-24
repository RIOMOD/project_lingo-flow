package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.payment.CouponResponse;
import com.example.englishlearning.dto.payment.OrderResponse;
import com.example.englishlearning.dto.payment.RefundResponse;
import com.example.englishlearning.dto.payment.TransactionResponse;
import com.example.englishlearning.service.CommerceService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminCommerceController {

    private final CommerceService commerceService;

    public AdminCommerceController(CommerceService commerceService) {
        this.commerceService = commerceService;
    }

    @GetMapping("/orders")
    public ApiResponse<PageResponse<OrderResponse>> getOrders(@PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.success(commerceService.getAdminOrders(pageable));
    }

    @GetMapping("/transactions")
    public ApiResponse<PageResponse<TransactionResponse>> getTransactions(@PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.success(commerceService.getAdminTransactions(pageable));
    }

    @GetMapping("/coupons")
    public ApiResponse<PageResponse<CouponResponse>> getCoupons(@PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.success(commerceService.getAdminCoupons(pageable));
    }

    @GetMapping("/refunds")
    public ApiResponse<PageResponse<RefundResponse>> getRefunds(@PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.success(commerceService.getAdminRefunds(pageable));
    }
}
