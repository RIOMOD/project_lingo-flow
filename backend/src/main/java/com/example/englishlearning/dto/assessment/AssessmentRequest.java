package com.example.englishlearning.dto.assessment;

import com.example.englishlearning.entity.Exercise;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class AssessmentRequest {
    @NotNull
    private Long courseId;
    private Long lessonId;
    @NotBlank
    private String title;
    private String description;
    private Exercise.ExerciseType exerciseType = Exercise.ExerciseType.MIXED;
    private Integer durationMinutes = 30;
    private Integer maxAttempts = 1;
    private BigDecimal passScore = BigDecimal.ZERO;
    private Exercise.ContentStatus status = Exercise.ContentStatus.DRAFT;
    private List<Long> questionIds = new ArrayList<>();
}
