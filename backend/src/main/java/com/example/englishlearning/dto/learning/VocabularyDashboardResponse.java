package com.example.englishlearning.dto.learning;

import lombok.Data;
import java.util.List;

@Data
public class VocabularyDashboardResponse {
    private Integer reviewDueCount;
    private Integer totalMastered;
    private SessionStartResponse recommendedSession;
    private List<VocabularyTopicDto> recentTopics;
}
