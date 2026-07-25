package com.example.englishlearning.dto.user;

import com.example.englishlearning.entity.Order;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class UserOrderResponse {

    private Long id;
    private String orderCode;
    private BigDecimal subtotalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    public static UserOrderResponse from(Order order) {
        return UserOrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .subtotalAmount(order.getSubtotalAmount())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .paidAt(order.getPaidAt())
                .createdAt(order.getCreatedAt())
                .build();
    }
}

