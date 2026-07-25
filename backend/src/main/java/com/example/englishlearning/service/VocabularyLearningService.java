package com.example.englishlearning.service;

import com.example.englishlearning.dto.learning.*;
import java.util.List;

public interface VocabularyLearningService {
    VocabularyDashboardResponse getDashboardSummary(Long userId);
    List<VocabularyTopicDto> getAllTopics(Long userId);
    VocabularyTopicDto getTopicDetails(Long userId, String topicName);
    SessionStartResponse startSession(Long userId, String topicName);
    ActivityAnswerResponse submitAnswer(Long userId, Long sessionId, ActivityAnswerRequest request);
    SessionCompleteResponse completeSession(Long userId, Long sessionId);
    SessionStartResponse startReviewChallenge(Long userId);
}
