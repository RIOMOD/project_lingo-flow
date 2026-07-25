package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.payment.CouponResponse;
import com.example.englishlearning.service.CommerceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/coupons")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCouponController {

    private final CommerceService commerceService;

    @PostMapping("/{id}/activate")
    public ApiResponse<CouponResponse> activateCoupon(@PathVariable Long id) {
        return ApiResponse.success("Coupon activated", commerceService.activateCoupon(id));
    }

    @PostMapping("/{id}/deactivate")
    public ApiResponse<CouponResponse> deactivateCoupon(@PathVariable Long id) {
        return ApiResponse.success("Coupon deactivated", commerceService.deactivateCoupon(id));
    }
}
