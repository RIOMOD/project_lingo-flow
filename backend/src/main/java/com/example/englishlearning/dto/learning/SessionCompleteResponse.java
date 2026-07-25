package com.example.englishlearning.dto.learning;

import lombok.Data;

@Data
public class SessionCompleteResponse {
    private Integer correctAnswers;
    private Integer incorrectAnswers;
    private Integer xpEarned;
    private Integer streak;
    private Integer weakWordsCount;
}
