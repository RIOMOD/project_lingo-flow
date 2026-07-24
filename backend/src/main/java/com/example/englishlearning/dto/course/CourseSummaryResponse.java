package com.example.englishlearning.dto.course;

import com.example.englishlearning.entity.Course;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class CourseSummaryResponse {

    private Long id;
    private String title;
    private String slug;
    private String shortDescription;
    private String thumbnailUrl;
    private Course.CourseLevel level;
    private Course.CourseType courseType;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private Course.CourseStatus status;
    private String teacherName;
}
