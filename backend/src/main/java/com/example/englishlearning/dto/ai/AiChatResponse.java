package com.example.englishlearning.dto.ai;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiChatResponse {
    private Long conversationId;
    private String reply;
    private String provider;
    private Integer totalTokens;
    private boolean fallback;
}
