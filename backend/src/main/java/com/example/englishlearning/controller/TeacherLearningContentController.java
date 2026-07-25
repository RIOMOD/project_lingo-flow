package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.learning.GrammarResponse;
import com.example.englishlearning.dto.learning.UpsertGrammarRequest;
import com.example.englishlearning.dto.learning.UpsertVocabularyRequest;
import com.example.englishlearning.dto.learning.VocabularyResponse;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.service.LearningContentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher")
public class TeacherLearningContentController {

    private final LearningContentService learningContentService;

    public TeacherLearningContentController(LearningContentService learningContentService) {
        this.learningContentService = learningContentService;
    }

    @GetMapping("/vocabularies")
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

    @PostMapping("/vocabularies")
    public ApiResponse<VocabularyResponse> createVocabulary(
            Authentication authentication,
            @Valid @RequestBody UpsertVocabularyRequest request
    ) {
        return ApiResponse.success("Vocabulary created", learningContentService.createVocabulary(authentication.getName(), request));
    }

    @PutMapping("/vocabularies/{id}")
    public ApiResponse<VocabularyResponse> updateVocabulary(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpsertVocabularyRequest request
    ) {
        return ApiResponse.success("Vocabulary updated", learningContentService.updateVocabulary(authentication.getName(), id, request));
    }

    @DeleteMapping("/vocabularies/{id}")
    public ApiResponse<Void> deleteVocabulary(Authentication authentication, @PathVariable Long id) {
        learningContentService.deleteVocabulary(authentication.getName(), id);
        return ApiResponse.success("Vocabulary deleted", null);
    }

    @GetMapping("/grammar")
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

    @PostMapping("/grammar")
    public ApiResponse<GrammarResponse> createGrammar(
            Authentication authentication,
            @Valid @RequestBody UpsertGrammarRequest request
    ) {
        return ApiResponse.success("Grammar topic created", learningContentService.createGrammar(authentication.getName(), request));
    }

    @PutMapping("/grammar/{id}")
    public ApiResponse<GrammarResponse> updateGrammar(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpsertGrammarRequest request
    ) {
        return ApiResponse.success("Grammar topic updated", learningContentService.updateGrammar(authentication.getName(), id, request));
    }

    @DeleteMapping("/grammar/{id}")
    public ApiResponse<Void> deleteGrammar(Authentication authentication, @PathVariable Long id) {
        learningContentService.deleteGrammar(authentication.getName(), id);
        return ApiResponse.success("Grammar topic deleted", null);
    }
}
