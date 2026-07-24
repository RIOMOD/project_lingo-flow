package com.example.englishlearning.dto.learning;

import lombok.Data;

@Data
public class ActivityAnswerRequest {
    private Long wordId;
    private String activityType;
    private Boolean isCorrect;
    private Long responseTimeMs;
    private String userAnswer;
}
