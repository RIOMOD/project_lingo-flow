package com.example.englishlearning.dto.assessment;

import com.example.englishlearning.entity.Question;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class QuestionRequest {
    private Long exerciseId;
    @NotNull
    private Question.QuestionType questionType;
    @NotBlank
    private String questionText;
    private String explanation;
    private BigDecimal points = BigDecimal.ONE;
    private String correctAnswer;
    private Integer position = 1;
    @Valid
    private List<AnswerOptionRequest> options = new ArrayList<>();
}
