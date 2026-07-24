package com.example.englishlearning.dto.course;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectCourseRequest {

    @Size(max = 500)
    private String reason;
}
