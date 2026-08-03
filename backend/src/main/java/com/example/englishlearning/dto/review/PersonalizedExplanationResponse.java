package com.example.englishlearning.dto.review;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PersonalizedExplanationResponse {
    private Long questionId;
    private String questionText;
    private String userSelectedOption;
    private String correctAnswer;
    private boolean isCorrect;
    private String source; // "TEACHER" | "AI_FALLBACK"
    private String explanation;
    private String similarExample;
}
