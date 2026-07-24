package com.example.englishlearning.dto.learning;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class VocabularyActivityDto {
    private String activityType; // DISCOVERY, INTRO, RECOGNITION, PRODUCTION
    private Long wordId;
    private String word;
    private String ipa;
    private String audioUrl;
    private String meaning;
    private String exampleSentence;
    private String question;
    private List<String> options;
}
