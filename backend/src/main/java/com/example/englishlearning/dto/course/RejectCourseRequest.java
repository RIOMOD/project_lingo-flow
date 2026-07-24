package com.example.englishlearning.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectCourseRequest {

    @NotBlank(message = "Lý do từ chối là bắt buộc.")
    @Size(min = 10, max = 500, message = "Lý do từ chối phải từ 10 đến 500 ký tự.")
    private String reason;
}
