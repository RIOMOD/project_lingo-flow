package com.example.englishlearning.ai;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class WritingProviderResult {
    private String correctedText;
    private String feedback;
    private String naturalSuggestion;
    private BigDecimal overallScore;
    private BigDecimal grammarScore;
    private BigDecimal vocabularyScore;
    private BigDecimal coherenceScore;
    private BigDecimal taskResponseScore;
    private List<String> suggestedLessons;
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer totalTokens;
    private boolean fallback;
}
