package com.example.englishlearning.dto.progress;

import com.example.englishlearning.entity.Question;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class LearningRecommendationResponse {
    private Question.SkillType skillType;
    private String skillLabel;
    private String topic;
    private BigDecimal accuracyPercent;
    private long attemptCount;
    private long totalQuestions;
    private long incorrectAnswers;
    private String reason;
    private Long courseId;
    private String courseTitle;
    private Long lessonId;
    private String lessonTitle;
    private Long exerciseId;
}
