package com.example.englishlearning.dto.review;

import com.example.englishlearning.dto.assessment.QuestionResponse;
import com.example.englishlearning.entity.PersonalizedReviewSession;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PersonalizedReviewSessionResponse {
    private Long id;
    private Long sourceAttemptId;
    private Integer totalQuestions;
    private BigDecimal preAccuracy;
    private BigDecimal postAccuracy;
    private BigDecimal improvementPercent;
    private String feedbackTag;
    private String feedbackLabel;
    private PersonalizedReviewSession.SessionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private List<QuestionResponse> questions;
    private List<String> weakTopics;
}
