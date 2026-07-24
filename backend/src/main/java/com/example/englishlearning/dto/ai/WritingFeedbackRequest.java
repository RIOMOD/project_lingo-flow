package com.example.englishlearning.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WritingFeedbackRequest {
    @Size(max = 200, message = "Title must be at most 200 characters")
    private String title;

    @Size(max = 30, message = "Level must be at most 30 characters")
    private String level;

    @Size(max = 300, message = "Task prompt must be at most 300 characters")
    private String taskPrompt;

    @NotBlank(message = "Text is required")
    @Size(max = 6000, message = "Text must be at most 6000 characters")
    private String text;
}
