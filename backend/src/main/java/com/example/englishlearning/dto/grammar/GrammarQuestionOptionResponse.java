package com.example.englishlearning.dto.grammar;

import lombok.Data;

@Data
public class GrammarQuestionOptionResponse {
    private Long id;
    private String optionText;
    private Boolean isCorrect; // Can be null if returned to student before submission
}
