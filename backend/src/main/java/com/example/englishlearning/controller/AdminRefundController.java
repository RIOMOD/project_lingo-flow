package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.payment.RefundResponse;
import com.example.englishlearning.service.CommerceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/refunds")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminRefundController {

    private final CommerceService commerceService;

    @PostMapping("/{id}/approve")
    public ApiResponse<RefundResponse> approveRefund(@PathVariable Long id, @RequestParam String note) {
        return ApiResponse.success("Refund approved", commerceService.approveRefund(id, note));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<RefundResponse> rejectRefund(@PathVariable Long id, @RequestParam String note) {
        return ApiResponse.success("Refund rejected", commerceService.rejectRefund(id, note));
    }
}
