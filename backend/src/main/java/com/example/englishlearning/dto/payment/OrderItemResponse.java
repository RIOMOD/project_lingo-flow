package com.example.englishlearning.dto.payment;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class OrderItemResponse {

    private Long courseId;
    private String title;
    private String slug;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private BigDecimal finalPrice;
}
