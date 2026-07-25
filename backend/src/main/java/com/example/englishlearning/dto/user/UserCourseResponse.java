package com.example.englishlearning.dto.user;

import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.CourseOwnership;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class UserCourseResponse {

    private Long courseId;
    private String title;
    private String slug;
    private String thumbnailUrl;
    private String level;
    private String courseType;
    private BigDecimal salePrice;
    private String courseStatus;
    private String ownershipType;
    private String ownershipStatus;
    private LocalDateTime grantedAt;

    public static UserCourseResponse from(CourseOwnership ownership) {
        Course course = ownership.getCourse();
        return UserCourseResponse.builder()
                .courseId(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .thumbnailUrl(course.getThumbnailUrl())
                .level(course.getLevel().name())
                .courseType(course.getCourseType().name())
                .salePrice(course.getSalePrice())
                .courseStatus(course.getStatus().name())
                .ownershipType(ownership.getOwnershipType().name())
                .ownershipStatus(ownership.getStatus().name())
                .grantedAt(ownership.getGrantedAt())
                .build();
    }
}
