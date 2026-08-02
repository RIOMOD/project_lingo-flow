package com.example.englishlearning.dto.ai;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiLearningContextRequest {
    private String type;
    private Long courseId;
    private Long lessonId;
    private Long attemptId;
    private Long questionId;
    private Long grammarTopicId;
}
