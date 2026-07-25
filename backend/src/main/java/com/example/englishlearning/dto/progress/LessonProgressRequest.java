package com.example.englishlearning.dto.progress;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class LessonProgressRequest {
    private Integer studyTimeMinutes = 0;
    private BigDecimal score;
    private BigDecimal mediaPositionSeconds;
    private BigDecimal mediaDurationSeconds;
    private BigDecimal contentProgressPercent;
    private String checkpointAnswer;
}
