package com.example.englishlearning.dto.ai;

import com.example.englishlearning.entity.AiMessage;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AiMessageResponse {
    private Long id;
    private AiMessage.Sender sender;
    private String message;
    private Integer tokenCount;
    private LocalDateTime createdAt;
}
