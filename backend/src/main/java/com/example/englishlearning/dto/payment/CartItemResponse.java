package com.example.englishlearning.dto.payment;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class CartItemResponse {

    private Long courseId;
    private String title;
    private String slug;
    private String thumbnailUrl;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private BigDecimal finalPrice;
}
