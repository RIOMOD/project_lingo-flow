package com.example.englishlearning.dto.grammar;

import lombok.Data;

@Data
public class GrammarAttemptAnswerResponse {
    private Long questionId;
    private Long selectedOptionId;
    private Long correctOptionId;
    private Boolean isCorrect;
    private String explanation;
}
