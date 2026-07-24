package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.learning.GrammarResponse;
import com.example.englishlearning.dto.learning.VocabularyProgressRequest;
import com.example.englishlearning.dto.learning.VocabularyResponse;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.service.LearningContentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LearningContentController {

    private final LearningContentService learningContentService;

    public LearningContentController(LearningContentService learningContentService) {
        this.learningContentService = learningContentService;
    }

    @GetMapping("/api/vocabularies")
    public ApiResponse<PageResponse<VocabularyResponse>> getVocabularies(
            Authentication authentication,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long lessonId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Course.CourseLevel level,
            @RequestParam(required = false) String topic,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(learningContentService.getVocabularies(
                authentication.getName(), courseId, lessonId, search, level, topic, pageable));
    }

    @GetMapping("/api/vocabularies/review")
    public ApiResponse<PageResponse<VocabularyResponse>> getReviewVocabularies(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(learningContentService.getReviewVocabularies(authentication.getName(), pageable));
    }

    @PatchMapping("/api/vocabularies/{id}/progress")
    public ApiResponse<VocabularyResponse> updateVocabularyProgress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody VocabularyProgressRequest request
    ) {
        return ApiResponse.success("Vocabulary progress updated",
                learningContentService.updateVocabularyProgress(authentication.getName(), id, request));
    }

    @GetMapping("/api/grammar")
    public ApiResponse<PageResponse<GrammarResponse>> getGrammarTopics(
            Authentication authentication,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long lessonId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Course.CourseLevel level,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ApiResponse.success(learningContentService.getGrammarTopics(
                authentication.getName(), courseId, lessonId, search, level, pageable));
    }
}
