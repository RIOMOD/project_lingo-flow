package com.example.englishlearning.dto.ai;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AiFeedbackResponse {
    private Long id;
    private Long messageId;
    private String userEmail;
    private String userFullName;
    private String rating;
    private String comment;
    private String userMessage;
    private String aiResponse;
    private LocalDateTime createdAt;
}
