package com.example.englishlearning.service;

import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.learning.GrammarResponse;
import com.example.englishlearning.dto.learning.UpsertGrammarRequest;
import com.example.englishlearning.dto.learning.UpsertVocabularyRequest;
import com.example.englishlearning.dto.learning.VocabularyProgressRequest;
import com.example.englishlearning.dto.learning.VocabularyResponse;
import com.example.englishlearning.entity.Course;
import org.springframework.data.domain.Pageable;

public interface LearningContentService {

    PageResponse<VocabularyResponse> getVocabularies(
            String email,
            Long courseId,
            Long lessonId,
            String search,
            Course.CourseLevel level,
            String topic,
            Pageable pageable
    );

    PageResponse<VocabularyResponse> getReviewVocabularies(String email, Pageable pageable);

    VocabularyResponse createVocabulary(String email, UpsertVocabularyRequest request);

    VocabularyResponse updateVocabulary(String email, Long id, UpsertVocabularyRequest request);

    void deleteVocabulary(String email, Long id);

    VocabularyResponse updateVocabularyProgress(String email, Long vocabularyId, VocabularyProgressRequest request);

    PageResponse<GrammarResponse> getGrammarTopics(
            String email,
            Long courseId,
            Long lessonId,
            String search,
            Course.CourseLevel level,
            Pageable pageable
    );

    GrammarResponse createGrammar(String email, UpsertGrammarRequest request);

    GrammarResponse updateGrammar(String email, Long id, UpsertGrammarRequest request);

    void deleteGrammar(String email, Long id);
}
