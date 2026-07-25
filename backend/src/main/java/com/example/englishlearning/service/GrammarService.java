package com.example.englishlearning.service;

import com.example.englishlearning.dto.grammar.GrammarAttemptResponse;
import com.example.englishlearning.dto.grammar.GrammarAttemptSubmitRequest;
import com.example.englishlearning.dto.grammar.GrammarQuestionRequest;
import com.example.englishlearning.dto.grammar.GrammarQuestionResponse;

import java.util.List;

public interface GrammarService {
    // Teacher methods
    GrammarQuestionResponse createQuestion(Long topicId, GrammarQuestionRequest request);
    GrammarQuestionResponse updateQuestion(Long questionId, GrammarQuestionRequest request);
    void deleteQuestion(Long questionId);
    List<GrammarQuestionResponse> getQuestionsByTopicForTeacher(Long topicId);
    List<GrammarAttemptResponse> getAttemptsByTopicForTeacher(Long topicId);

    // Student methods
    List<GrammarQuestionResponse> getQuestionsByTopicForStudent(Long topicId);
    GrammarAttemptResponse submitAttempt(String email, Long topicId, GrammarAttemptSubmitRequest request);
    List<GrammarAttemptResponse> getMyAttempts(String email);
    GrammarAttemptResponse getAttemptById(String email, Long attemptId);
}
