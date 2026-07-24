package com.example.englishlearning.dto.course;

import com.example.englishlearning.entity.Course;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CourseRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 220)
    private String slug;

    @Size(max = 500)
    private String shortDescription;

    private String description;

    @Size(max = 500)
    private String thumbnailUrl;

    @NotNull
    private Course.CourseLevel level;

    @NotNull
    private Course.CourseType courseType;

    @DecimalMin("0.00")
    private BigDecimal originalPrice;

    @DecimalMin("0.00")
    private BigDecimal salePrice;

    private LocalDateTime saleStartAt;
    private LocalDateTime saleEndAt;
}
