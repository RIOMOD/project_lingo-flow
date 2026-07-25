package com.example.englishlearning.dto.grammar;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GrammarQuestionOptionRequest {
    @NotBlank(message = "Option text is required")
    private String optionText;

    @NotNull(message = "isCorrect is required")
    private Boolean isCorrect;
}
