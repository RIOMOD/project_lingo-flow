package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.review.*;
import com.example.englishlearning.service.PersonalizedReviewService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/personalized-review")
public class PersonalizedReviewController {

    private final PersonalizedReviewService reviewService;

    public PersonalizedReviewController(PersonalizedReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/generate")
    public ApiResponse<PersonalizedReviewSessionResponse> generateReviewSession(
            Authentication authentication,
            @RequestParam(required = false) Long sourceAttemptId
    ) {
        return ApiResponse.success(reviewService.generateReviewSession(authentication.getName(), sourceAttemptId));
    }

    @GetMapping("/{sessionId}")
    public ApiResponse<PersonalizedReviewSessionResponse> getReviewSession(
            Authentication authentication,
            @PathVariable Long sessionId
    ) {
        return ApiResponse.success(reviewService.getReviewSession(authentication.getName(), sessionId));
    }

    @PostMapping("/{sessionId}/submit")
    public ApiResponse<PersonalizedReviewSubmitResponse> submitReviewSession(
            Authentication authentication,
            @PathVariable Long sessionId,
            @RequestBody PersonalizedReviewSubmitRequest request
    ) {
        return ApiResponse.success(reviewService.submitReviewSession(authentication.getName(), sessionId, request));
    }

    @GetMapping("/history")
    public ApiResponse<PageResponse<PersonalizedReviewSessionResponse>> getMyReviewHistory(
            Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ApiResponse.success(PageResponse.from(reviewService.getMyReviewHistory(authentication.getName(), pageable)));
    }
}
