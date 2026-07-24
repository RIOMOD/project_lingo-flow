package com.example.englishlearning.dto.progress;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CourseProgressResponse {
    private Long courseId;
    private String courseTitle;
    private long totalLessons;
    private long startedLessons;
    private long completedLessons;
    private BigDecimal progressPercent;
    private Integer studyTimeMinutes;
    private String nextLessonTitle;
    private Long nextLessonId;
    private String nextChapterTitle;
    private String thumbnailUrl;
    private LocalDateTime lastAccessedAt;
    private boolean completed;
}
