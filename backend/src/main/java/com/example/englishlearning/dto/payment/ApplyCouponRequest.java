package com.example.englishlearning.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplyCouponRequest {

    @NotBlank
    private String code;
}
