package com.example.englishlearning.dto.course;

import com.example.englishlearning.entity.Chapter;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class ChapterResponse {

    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Integer position;
    private Chapter.ChapterStatus status;
    private List<LessonResponse> lessons;
}
