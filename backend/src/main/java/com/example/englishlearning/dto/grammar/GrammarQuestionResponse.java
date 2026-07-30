package com.example.englishlearning.dto.grammar;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class GrammarQuestionResponse {
    private Long id;
    private String questionText;
    private String explanation;
    private String level;
    private List<GrammarQuestionOptionResponse> options;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
