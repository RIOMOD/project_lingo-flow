package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.payment.OrderResponse;
import com.example.englishlearning.service.CommerceService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final CommerceService commerceService;

    public OrderController(CommerceService commerceService) {
        this.commerceService = commerceService;
    }

    @PostMapping
    public ApiResponse<OrderResponse> createOrder(Authentication authentication) {
        return ApiResponse.success("Order created", commerceService.createOrderFromCart(authentication.getName()));
    }

    @GetMapping
    public ApiResponse<PageResponse<OrderResponse>> getOrders(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ApiResponse.success(commerceService.getMyOrders(authentication.getName(), pageable));
    }

    @GetMapping("/{orderCode}")
    public ApiResponse<OrderResponse> getOrder(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ApiResponse.success(commerceService.getMyOrder(authentication.getName(), orderCode));
    }

    @PostMapping("/{orderCode}/cancel")
    public ApiResponse<OrderResponse> cancelOrder(
            Authentication authentication,
            @PathVariable String orderCode
    ) {
        return ApiResponse.success("Order canceled", commerceService.cancelMyOrder(authentication.getName(), orderCode));
    }
}
