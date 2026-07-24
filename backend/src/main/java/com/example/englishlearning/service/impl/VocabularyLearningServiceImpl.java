package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.learning.*;
import com.example.englishlearning.entity.*;
import com.example.englishlearning.repository.*;
import com.example.englishlearning.service.VocabularyLearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VocabularyLearningServiceImpl implements VocabularyLearningService {

    private final VocabularyRepository vocabularyRepository;
    private final VocabularyProgressRepository progressRepository;
    private final VocabularySessionRepository sessionRepository;
    private final VocabularySessionItemRepository sessionItemRepository;
    private final VocabularyTopicProgressRepository topicProgressRepository;

    @Override
    public VocabularyDashboardResponse getDashboardSummary(Long userId) {
        long reviewDue = progressRepository.countByUserIdAndNextReviewAtLessThanEqual(userId, LocalDateTime.now());
        long totalMastered = progressRepository.countByUserIdAndStatus(userId, VocabularyStatus.MASTERED);
        
        VocabularyDashboardResponse response = new VocabularyDashboardResponse();
        response.setReviewDueCount((int) reviewDue);
        response.setTotalMastered((int) totalMastered);
        // TODO: get recent topics and recommended session
        response.setRecentTopics(new ArrayList<>());
        return response;
    }

    @Override
    public List<VocabularyTopicDto> getAllTopics(Long userId) {
        // Placeholder
        return new ArrayList<>();
    }

    @Override
    public VocabularyTopicDto getTopicDetails(Long userId, String topicName) {
        return new VocabularyTopicDto();
    }

    @Override
    @Transactional
    public SessionStartResponse startSession(Long userId, String topicName) {
        // Create session
        VocabularySession session = new VocabularySession();
        // session logic...
        SessionStartResponse response = new SessionStartResponse();
        response.setSessionId(1L);
        return response;
    }

    @Override
    @Transactional
    public ActivityAnswerResponse submitAnswer(Long userId, Long sessionId, ActivityAnswerRequest request) {
        return new ActivityAnswerResponse();
    }

    @Override
    @Transactional
    public SessionCompleteResponse completeSession(Long userId, Long sessionId) {
        return new SessionCompleteResponse();
    }

    @Override
    @Transactional
    public SessionStartResponse startReviewChallenge(Long userId) {
        return new SessionStartResponse();
    }
}
