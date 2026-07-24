package com.example.englishlearning.dto.learning;

import lombok.Data;
import java.util.List;

@Data
public class SessionStartResponse {
    private Long sessionId;
    private String topicName;
    private Integer wordsToLearn;
    private VocabularyActivityDto firstActivity;
}
