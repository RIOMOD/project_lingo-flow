package com.example.englishlearning.dto.payment;

import com.example.englishlearning.entity.Coupon;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class CouponResponse {

    private Long id;
    private String code;
    private String name;
    private Coupon.DiscountType discountType;
    private BigDecimal discountValue;
    private Coupon.CouponStatus status;
    private Integer usedCount;
}
