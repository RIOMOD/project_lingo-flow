package com.example.englishlearning.dto.course;

import com.example.englishlearning.entity.Lesson;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotNull
    private Lesson.LessonType lessonType;

    private String content;

    @Size(max = 500)
    private String audioUrl;

    @Size(max = 500)
    private String videoUrl;

    @NotNull
    @Min(1)
    private Integer position;

    @Min(0)
    private Integer durationMinutes;

    private Boolean preview = false;

    private Lesson.LessonStatus status = Lesson.LessonStatus.DRAFT;
}
