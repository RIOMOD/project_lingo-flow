package com.example.englishlearning.dto.ai;

import com.example.englishlearning.entity.AiConversation;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AiConversationResponse {
    private Long id;
    private String title;
    private AiConversation.ConversationType conversationType;
    private LocalDateTime updatedAt;
    private List<AiMessageResponse> messages;
}
