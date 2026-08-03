package com.example.englishlearning.service;

import com.example.englishlearning.dto.review.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PersonalizedReviewService {
    PersonalizedReviewSessionResponse generateReviewSession(String email, String sourceAttemptId);
    PersonalizedReviewSessionResponse getReviewSession(String email, Long sessionId);
    PersonalizedReviewSubmitResponse submitReviewSession(String email, Long sessionId, PersonalizedReviewSubmitRequest request);
    Page<PersonalizedReviewSessionResponse> getMyReviewHistory(String email, Pageable pageable);
}
