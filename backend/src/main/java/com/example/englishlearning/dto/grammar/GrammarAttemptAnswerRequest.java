package com.example.englishlearning.dto.grammar;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GrammarAttemptAnswerRequest {
    @NotNull(message = "Question ID is required")
    private Long questionId;

    // Can be null if student didn't answer
    private Long selectedOptionId;
}
