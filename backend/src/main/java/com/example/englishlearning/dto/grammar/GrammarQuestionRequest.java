package com.example.englishlearning.dto.grammar;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class GrammarQuestionRequest {
    @NotBlank(message = "Question text is required")
    private String questionText;

    private String explanation;

    @NotBlank(message = "Level is required")
    private String level;

    @NotNull(message = "Options are required")
    @Size(min = 4, max = 4, message = "Exactly 4 options are required")
    private List<GrammarQuestionOptionRequest> options;
}
