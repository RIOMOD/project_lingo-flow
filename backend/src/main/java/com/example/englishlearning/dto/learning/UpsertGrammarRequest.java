package com.example.englishlearning.dto.learning;

import com.example.englishlearning.entity.Course;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpsertGrammarRequest {

    @NotNull
    private Long courseId;

    private Long lessonId;

    @NotBlank
    @Size(max = 200)
    private String title;

    private String description;
    private String formula;
    private String usage;
    private String example;
    private String note;
    private Course.CourseLevel level = Course.CourseLevel.BEGINNER;
}
