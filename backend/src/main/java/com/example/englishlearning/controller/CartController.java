package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.payment.AddCartItemRequest;
import com.example.englishlearning.dto.payment.ApplyCouponRequest;
import com.example.englishlearning.dto.payment.CartResponse;
import com.example.englishlearning.service.CommerceService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CommerceService commerceService;

    public CartController(CommerceService commerceService) {
        this.commerceService = commerceService;
    }

    @GetMapping
    public ApiResponse<CartResponse> getCart(Authentication authentication) {
        return ApiResponse.success(commerceService.getCart(authentication.getName()));
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(
            Authentication authentication,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return ApiResponse.success("Course added to cart", commerceService.addCartItem(authentication.getName(), request.getCourseId()));
    }

    @DeleteMapping("/items/{courseId}")
    public ApiResponse<CartResponse> removeItem(
            Authentication authentication,
            @PathVariable Long courseId
    ) {
        return ApiResponse.success("Course removed from cart", commerceService.removeCartItem(authentication.getName(), courseId));
    }

    @DeleteMapping
    public ApiResponse<CartResponse> clearCart(Authentication authentication) {
        return ApiResponse.success("Cart cleared", commerceService.clearCart(authentication.getName()));
    }

    @PostMapping("/coupon")
    public ApiResponse<CartResponse> applyCoupon(
            Authentication authentication,
            @Valid @RequestBody ApplyCouponRequest request
    ) {
        return ApiResponse.success("Coupon applied", commerceService.applyCoupon(authentication.getName(), request.getCode()));
    }

    @DeleteMapping("/coupon")
    public ApiResponse<CartResponse> removeCoupon(Authentication authentication) {
        return ApiResponse.success("Coupon removed", commerceService.removeCoupon(authentication.getName()));
    }
}
