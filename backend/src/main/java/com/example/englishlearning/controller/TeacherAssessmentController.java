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
@RequestMapping("/api/teacher")
public class TeacherAssessmentController {

    private final AssessmentService assessmentService;

    public TeacherAssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping("/questions")
    public ApiResponse<QuestionResponse> createQuestion(Authentication authentication, @Valid @RequestBody QuestionRequest request) {
        return ApiResponse.success("Question created", assessmentService.createQuestion(authentication.getName(), request));
    }

    @PutMapping("/questions/{id}")
    public ApiResponse<QuestionResponse> updateQuestion(Authentication authentication, @PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
        return ApiResponse.success("Question updated", assessmentService.updateQuestion(authentication.getName(), id, request));
    }

    @DeleteMapping("/questions/{id}")
    public ApiResponse<Void> deleteQuestion(Authentication authentication, @PathVariable Long id) {
        assessmentService.deleteQuestion(authentication.getName(), id);
        return ApiResponse.success("Question deleted", null);
    }

    @PostMapping("/exercises")
    public ApiResponse<AssessmentResponse> createExercise(Authentication authentication, @Valid @RequestBody AssessmentRequest request) {
        return ApiResponse.success("Exercise created", assessmentService.createExercise(authentication.getName(), request));
    }

    @PutMapping("/exercises/{id}")
    public ApiResponse<AssessmentResponse> updateExercise(Authentication authentication, @PathVariable Long id, @Valid @RequestBody AssessmentRequest request) {
        return ApiResponse.success("Exercise updated", assessmentService.updateExercise(authentication.getName(), id, request));
    }

    @PostMapping("/tests")
    public ApiResponse<AssessmentResponse> createTest(Authentication authentication, @Valid @RequestBody AssessmentRequest request) {
        return ApiResponse.success("Test created", assessmentService.createTest(authentication.getName(), request));
    }

    @PutMapping("/tests/{id}")
    public ApiResponse<AssessmentResponse> updateTest(Authentication authentication, @PathVariable Long id, @Valid @RequestBody AssessmentRequest request) {
        return ApiResponse.success("Test updated", assessmentService.updateTest(authentication.getName(), id, request));
    }

    @GetMapping("/assessment-results")
    public ApiResponse<PageResponse<AttemptResponse>> getResults(Authentication authentication, @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.success(assessmentService.getTeacherResults(authentication.getName(), pageable));
    }
}
