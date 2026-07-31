package com.example.englishlearning.dto.assessment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnswerOptionRequest {
    @NotBlank
    private String optionText;
    @com.fasterxml.jackson.annotation.JsonProperty("correct")
    private Boolean correct = false;
    @NotNull
    private Integer position;
}
