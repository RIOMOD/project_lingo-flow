package com.example.englishlearning.dto.payment;

import com.example.englishlearning.entity.Order;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class OrderResponse {

    private String orderCode;
    private BigDecimal subtotalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private String couponCode;
    private LocalDateTime paidAt;
    private LocalDateTime canceledAt;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private InvoiceResponse invoice;
}
