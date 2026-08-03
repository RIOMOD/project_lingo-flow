package com.example.englishlearning.dto.assessment;

import com.example.englishlearning.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private Long id;
    private Long exerciseId;
    private Question.QuestionType questionType;
    private String questionText;
    private String explanation;
    private Question.SkillType skillType;
    private String topic;
    private Long recommendedLessonId;
    private Long recommendedLessonCourseId;
    private String recommendedLessonTitle;
    private BigDecimal points;
    private String correctAnswer;
    private Integer position;
    private List<OptionResponse> options;
}
