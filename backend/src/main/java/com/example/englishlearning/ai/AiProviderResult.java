package com.example.englishlearning.ai;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiProviderResult {
    private String text;
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer totalTokens;
    private boolean fallback;
}
