package com.example.englishlearning.dto.ai;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AiUsageSummaryResponse {
    private String feature;
    private String provider;
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer totalTokens;
    private LocalDateTime createdAt;
}
