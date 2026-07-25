package com.example.englishlearning.dto.grammar;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class GrammarAttemptSubmitRequest {
    @NotNull(message = "Answers are required")
    private List<GrammarAttemptAnswerRequest> answers;
}
