package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.grammar.GrammarAttemptResponse;
import com.example.englishlearning.dto.grammar.GrammarQuestionRequest;
import com.example.englishlearning.dto.grammar.GrammarQuestionResponse;
import com.example.englishlearning.service.GrammarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/grammar")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
public class TeacherGrammarController {

    private final GrammarService grammarService;

    @GetMapping("/topics/{topicId}/questions")
    public ApiResponse<List<GrammarQuestionResponse>> getQuestionsByTopic(@PathVariable Long topicId) {
        return ApiResponse.success(grammarService.getQuestionsByTopicForTeacher(topicId));
    }

    @PostMapping("/topics/{topicId}/questions")
    public ApiResponse<GrammarQuestionResponse> createQuestion(
            @PathVariable Long topicId,
            @Valid @RequestBody GrammarQuestionRequest request) {
        return ApiResponse.success(grammarService.createQuestion(topicId, request));
    }

    @PutMapping("/questions/{questionId}")
    public ApiResponse<GrammarQuestionResponse> updateQuestion(
            @PathVariable Long questionId,
            @Valid @RequestBody GrammarQuestionRequest request) {
        return ApiResponse.success(grammarService.updateQuestion(questionId, request));
    }

    @DeleteMapping("/questions/{questionId}")
    public ApiResponse<Void> deleteQuestion(@PathVariable Long questionId) {
        grammarService.deleteQuestion(questionId);
        return ApiResponse.success(null);
    }

    @GetMapping("/topics/{topicId}/results")
    public ApiResponse<List<GrammarAttemptResponse>> getStudentResults(@PathVariable Long topicId) {
        return ApiResponse.success(grammarService.getAttemptsByTopicForTeacher(topicId));
    }
}
