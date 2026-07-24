package com.example.englishlearning.dto.learning;

import com.example.englishlearning.entity.Course;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GrammarResponse {

    private Long id;
    private Long courseId;
    private Long lessonId;
    private String title;
    private String description;
    private String formula;
    private String usage;
    private String example;
    private String note;
    private Course.CourseLevel level;
}
