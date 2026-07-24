package com.example.englishlearning.dto.course;

import com.example.englishlearning.entity.Course;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CourseDetailResponse {

    private Long id;
    private String title;
    private String slug;
    private String shortDescription;
    private String description;
    private String thumbnailUrl;
    private Course.CourseLevel level;
    private Course.CourseType courseType;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private LocalDateTime saleStartAt;
    private LocalDateTime saleEndAt;
    private Course.CourseStatus status;
    private LocalDateTime publishedAt;
    private Long teacherId;
    private String teacherName;
}
