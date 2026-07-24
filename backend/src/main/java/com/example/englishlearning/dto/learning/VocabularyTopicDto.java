package com.example.englishlearning.dto.learning;

import lombok.Data;

@Data
public class VocabularyTopicDto {
    private String name;
    private Integer totalWords;
    private Integer masteredWords;
    private String status;
    private Integer unlockedSessionIndex;
}
