package com.example.englishlearning.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatRequest {
    private Long conversationId;

    @Size(max = 80, message = "Topic must be at most 80 characters")
    private String topic;

    @Size(max = 30, message = "Level must be at most 30 characters")
    private String level;

    @NotBlank(message = "Message is required")
    @Size(max = 3000, message = "Message must be at most 3000 characters")
    private String message;
}
