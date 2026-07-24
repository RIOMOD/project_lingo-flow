package com.example.englishlearning.dto.assessment;

import com.example.englishlearning.entity.Exercise;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class AssessmentResponse {
    private Long id;
    private String type;
    private Long courseId;
    private Long lessonId;
    private String title;
    private String description;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private BigDecimal passScore;
    private Exercise.ContentStatus status;
    private List<QuestionResponse> questions;
}
