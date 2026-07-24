package com.example.englishlearning.controller;

import com.example.englishlearning.dto.learning.*;
import com.example.englishlearning.service.VocabularyLearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning/vocabulary")
@RequiredArgsConstructor
public class VocabularyLearningController {

    private final VocabularyLearningService vocabularyLearningService;

    private Long getUserId(Authentication auth) {
        // TODO: Map auth to user ID correctly. Assuming UserDetails or JWT stores ID.
        // For now, we will extract email from auth and find userId.
        return null;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<VocabularyDashboardResponse> getDashboard(Authentication authentication) {
        // Note: For actual implementation we need user ID. We can let Service take email.
        return ResponseEntity.ok(new VocabularyDashboardResponse());
    }

    @GetMapping("/topics")
    public ResponseEntity<List<VocabularyTopicDto>> getAllTopics(Authentication authentication) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/topics/{topicName}")
    public ResponseEntity<VocabularyTopicDto> getTopicDetails(Authentication authentication, @PathVariable String topicName) {
        return ResponseEntity.ok(new VocabularyTopicDto());
    }

    @PostMapping("/session/start")
    public ResponseEntity<SessionStartResponse> startSession(Authentication authentication, @RequestParam String topicName) {
        return ResponseEntity.ok(new SessionStartResponse());
    }

    @PostMapping("/session/{sessionId}/answer")
    public ResponseEntity<ActivityAnswerResponse> submitAnswer(Authentication authentication, @PathVariable Long sessionId, @RequestBody ActivityAnswerRequest request) {
        return ResponseEntity.ok(new ActivityAnswerResponse());
    }

    @PostMapping("/session/{sessionId}/complete")
    public ResponseEntity<SessionCompleteResponse> completeSession(Authentication authentication, @PathVariable Long sessionId) {
        return ResponseEntity.ok(new SessionCompleteResponse());
    }

    @PostMapping("/challenge/start")
    public ResponseEntity<SessionStartResponse> startReviewChallenge(Authentication authentication) {
        return ResponseEntity.ok(new SessionStartResponse());
    }
}
