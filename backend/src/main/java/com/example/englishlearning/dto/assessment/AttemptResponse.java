package com.example.englishlearning.dto.assessment;

import com.example.englishlearning.entity.TestAttempt;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.example.englishlearning.dto.progress.LearningRecommendationResponse;

@Getter
@Builder
public class AttemptResponse {
    private Long id;
    private String targetType;
    private Long targetId;
    private String title;
    private String description;
    private Integer durationMinutes;
    private BigDecimal passScore;
    private BigDecimal totalPoints;
    private BigDecimal scorePercent;
    private Boolean passed;
    private long correctAnswers;
    private long incorrectAnswers;
    private Long elapsedSeconds;
    private LocalDateTime startedAt;
    private LocalDateTime dueAt;
    private LocalDateTime submittedAt;
    private BigDecimal score;
    private TestAttempt.AttemptStatus status;
    private List<QuestionResponse> questions;
    private List<AnswerResultResponse> answers;
    private List<LearningRecommendationResponse> recommendations;
}
