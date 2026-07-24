package com.example.englishlearning.dto.course;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class AdminCourseSaleRequest {

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal salePrice;

    @NotNull
    private LocalDateTime saleStartAt;

    @NotNull
    private LocalDateTime saleEndAt;
}
