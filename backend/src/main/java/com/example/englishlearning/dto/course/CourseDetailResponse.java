package com.example.englishlearning.dto.course;

import com.example.englishlearning.entity.Course;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private BigDecimal currentPrice;
    private LocalDateTime saleStartAt;
    private LocalDateTime saleEndAt;
    private String saleStatus;
    private Integer completionPercent;
    private Boolean readyForReview;
    private List<String> validationErrors;
    private String lastRejectedReason;
    private Course.CourseStatus status;
    private LocalDateTime publishedAt;
    private Long teacherId;
    private String teacherName;
}
