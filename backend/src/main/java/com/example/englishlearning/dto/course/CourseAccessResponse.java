package com.example.englishlearning.dto.course;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CourseAccessResponse {

    private Long courseId;
    private Boolean owned;
    private Boolean canPreview;
    private Boolean canEnrollFree;
    private Boolean canBuy;
    private String actionLabel;
}
