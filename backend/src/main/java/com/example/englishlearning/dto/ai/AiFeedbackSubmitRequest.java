package com.example.englishlearning.dto.ai;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiFeedbackSubmitRequest {
    private Long messageId;

    @NotNull(message = "Rating is required (LIKE or DISLIKE)")
    private String rating;

    private String comment;
}
