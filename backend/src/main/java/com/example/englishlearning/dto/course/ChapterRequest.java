package com.example.englishlearning.dto.course;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChapterRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    private String description;

    @NotNull
    @Min(1)
    private Integer position;
}
