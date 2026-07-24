package com.example.englishlearning.dto.assessment;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class AnswerResultResponse {
    private Long questionId;
    private Long selectedOptionId;
    private String selectedOptionIds;
    private String answerText;
    private String answerJson;
    private Boolean correct;
    private BigDecimal pointsEarned;
}
