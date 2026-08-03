package com.example.englishlearning.dto.review;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PersonalizedReviewSubmitResponse {
    private Long sessionId;
    private Integer totalQuestions;
    private Integer correctCount;
    private BigDecimal preAccuracy;
    private BigDecimal postAccuracy;
    private BigDecimal improvementPercent;
    private String feedbackTag;
    private String feedbackLabel;
    private String feedbackSummary;
    private LocalDateTime completedAt;
    private List<PersonalizedExplanationResponse> explanations;
}
