package com.example.englishlearning.controller;

import com.example.englishlearning.dto.assessment.*;
import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @GetMapping("/api/exercises")
    public ApiResponse<PageResponse<AssessmentResponse>> getExercises(Authentication authentication, @RequestParam(required = false) Long courseId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(assessmentService.getExercises(authentication.getName(), courseId, pageable));
    }

    @GetMapping("/api/tests")
    public ApiResponse<PageResponse<AssessmentResponse>> getTests(Authentication authentication, @RequestParam(required = false) Long courseId, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(assessmentService.getTests(authentication.getName(), courseId, pageable));
    }

    @PostMapping("/api/exercises/{id}/attempts")
    public ApiResponse<AttemptResponse> startExercise(Authentication authentication, @PathVariable Long id) {
        return ApiResponse.success("Exercise attempt started", assessmentService.startExercise(authentication.getName(), id));
    }

    @PostMapping("/api/tests/{id}/attempts")
    public ApiResponse<AttemptResponse> startTest(Authentication authentication, @PathVariable Long id) {
        return ApiResponse.success("Test attempt started", assessmentService.startTest(authentication.getName(), id));
    }

    @PutMapping("/api/attempts/{attemptId}/answers/{questionId}")
    public ApiResponse<AttemptResponse> saveAnswer(Authentication authentication, @PathVariable Long attemptId, @PathVariable Long questionId, @RequestBody SaveAnswerRequest request) {
        return ApiResponse.success("Answer saved", assessmentService.saveAnswer(authentication.getName(), attemptId, questionId, request));
    }

    @PostMapping("/api/attempts/{attemptId}/submit")
    public ApiResponse<AttemptResponse> submit(Authentication authentication, @PathVariable Long attemptId) {
        return ApiResponse.success("Attempt submitted", assessmentService.submitAttempt(authentication.getName(), attemptId));
    }

    @GetMapping("/api/attempts/{attemptId}")
    public ApiResponse<AttemptResponse> getAttempt(Authentication authentication, @PathVariable Long attemptId) {
        return ApiResponse.success(assessmentService.getAttempt(authentication.getName(), attemptId));
    }

    @GetMapping("/api/attempts")
    public ApiResponse<PageResponse<AttemptResponse>> getMyAttempts(Authentication authentication, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(assessmentService.getMyAttempts(authentication.getName(), pageable));
    }
}
