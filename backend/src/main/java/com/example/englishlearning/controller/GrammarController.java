package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.grammar.GrammarAttemptResponse;
import com.example.englishlearning.dto.grammar.GrammarAttemptSubmitRequest;
import com.example.englishlearning.dto.grammar.GrammarQuestionResponse;
import com.example.englishlearning.service.GrammarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/grammar")
@RequiredArgsConstructor
public class GrammarController {

    private final GrammarService grammarService;

    @GetMapping("/topics/{topicId}/exercise")
    public ApiResponse<List<GrammarQuestionResponse>> getExerciseByTopic(@PathVariable Long topicId) {
        return ApiResponse.success(grammarService.getQuestionsByTopicForStudent(topicId));
    }

    @PostMapping("/topics/{topicId}/submit")
    public ApiResponse<GrammarAttemptResponse> submitAttempt(
            Authentication authentication,
            @PathVariable Long topicId,
            @Valid @RequestBody GrammarAttemptSubmitRequest request) {
        return ApiResponse.success(grammarService.submitAttempt(authentication.getName(), topicId, request));
    }

    @GetMapping("/attempts/me")
    public ApiResponse<List<GrammarAttemptResponse>> getMyAttempts(Authentication authentication) {
        return ApiResponse.success(grammarService.getMyAttempts(authentication.getName()));
    }

    @GetMapping("/attempts/{attemptId}")
    public ApiResponse<GrammarAttemptResponse> getAttemptById(
            Authentication authentication,
            @PathVariable Long attemptId) {
        return ApiResponse.success(grammarService.getAttemptById(authentication.getName(), attemptId));
    }
}
