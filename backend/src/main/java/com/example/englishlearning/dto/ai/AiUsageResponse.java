package com.example.englishlearning.dto.ai;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AiUsageResponse {
    private long usedToday;
    private int dailyLimit;
    private long remainingToday;
    private List<AiUsageSummaryResponse> recentLogs;
}
