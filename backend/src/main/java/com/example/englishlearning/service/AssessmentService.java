package com.example.englishlearning.service;

import com.example.englishlearning.dto.assessment.*;
import com.example.englishlearning.dto.common.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AssessmentService {
    QuestionResponse createQuestion(String email, QuestionRequest request);
    QuestionResponse updateQuestion(String email, Long id, QuestionRequest request);
    void deleteQuestion(String email, Long id);
    AssessmentResponse createExercise(String email, AssessmentRequest request);
    AssessmentResponse updateExercise(String email, Long id, AssessmentRequest request);
    AssessmentResponse createTest(String email, AssessmentRequest request);
    AssessmentResponse updateTest(String email, Long id, AssessmentRequest request);
    PageResponse<AssessmentResponse> getExercises(String email, Long courseId, Pageable pageable);
    PageResponse<AssessmentResponse> getTests(String email, Long courseId, Pageable pageable);
    AttemptResponse startExercise(String email, Long exerciseId);
    AttemptResponse startTest(String email, Long testId);
    AttemptResponse saveAnswer(String email, Long attemptId, Long questionId, SaveAnswerRequest request);
    AttemptResponse submitAttempt(String email, Long attemptId);
    AttemptResponse getAttempt(String email, Long attemptId);
    PageResponse<AttemptResponse> getMyAttempts(String email, Pageable pageable);
    PageResponse<AttemptResponse> getTeacherResults(String email, Pageable pageable);
}
