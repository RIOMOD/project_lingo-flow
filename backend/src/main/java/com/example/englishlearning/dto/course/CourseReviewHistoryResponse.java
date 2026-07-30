package com.example.englishlearning.dto.course;

import com.example.englishlearning.entity.CourseReviewHistory;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class CourseReviewHistoryResponse {

    private Long id;
    private CourseReviewHistory.ReviewAction action;
    private String reason;
    private Long adminId;
    private String adminName;
    private LocalDateTime createdAt;
}
