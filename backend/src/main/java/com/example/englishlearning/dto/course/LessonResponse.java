package com.example.englishlearning.dto.course;

import com.example.englishlearning.entity.Lesson;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class LessonResponse {

    private Long id;
    private Long chapterId;
    private Long courseId;
    private String title;
    private Lesson.LessonType lessonType;
    private String content;
    private String audioUrl;
    private String videoUrl;
    private Integer position;
    private Integer durationMinutes;
    private Boolean preview;
    private Lesson.LessonStatus status;
    private Boolean locked;
    private String lockReason;
    private String progressStatus;
    private java.math.BigDecimal contentProgressPercent;
    private java.math.BigDecimal mediaPositionSeconds;
    private java.math.BigDecimal mediaDurationSeconds;
    private Boolean checkpointPassed;
    private String checkpointQuestion;
    private String checkpointAnswer;
    private String checkpointExplanation;
}
