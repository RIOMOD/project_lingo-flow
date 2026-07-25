package com.example.englishlearning.dto.ai;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class WritingFeedbackResponse {
    private Long submissionId;
    private String correctedText;
    private String feedback;
    private String naturalSuggestion;
    private BigDecimal overallScore;
    private BigDecimal grammarScore;
    private BigDecimal vocabularyScore;
    private BigDecimal coherenceScore;
    private BigDecimal taskResponseScore;
    private List<String> suggestedLessons;
    private String provider;
    private Integer totalTokens;
    private boolean fallback;
}
