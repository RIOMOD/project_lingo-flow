package com.example.englishlearning.dto.learning;

import lombok.Data;

@Data
public class ActivityAnswerResponse {
    private Boolean isCorrect;
    private String feedback;
    private VocabularyActivityDto nextActivity;
    private Boolean sessionCompleted;
    private SessionCompleteResponse completionSummary;
}
