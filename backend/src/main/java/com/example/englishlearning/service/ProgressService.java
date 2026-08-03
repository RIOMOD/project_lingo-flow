package com.example.englishlearning.service;

import com.example.englishlearning.dto.progress.CourseProgressResponse;
import com.example.englishlearning.dto.progress.LessonProgressRequest;
import com.example.englishlearning.dto.progress.ProgressDashboardResponse;
import com.example.englishlearning.dto.progress.LearningRecommendationResponse;

import com.example.englishlearning.dto.progress.CertificateEligibilityResponse;

import java.util.List;

public interface ProgressService {
    ProgressDashboardResponse getStudentDashboard(String email);
    List<CourseProgressResponse> getCourseProgress(String email);
    CourseProgressResponse getCourseProgress(String email, Long courseId);
    CourseProgressResponse startLesson(String email, Long lessonId, LessonProgressRequest request);
    CourseProgressResponse trackLesson(String email, Long lessonId, LessonProgressRequest request);
    CourseProgressResponse completeLesson(String email, Long lessonId, LessonProgressRequest request);
    void recordVocabularyProgress(String email, int masteredCount);
    ProgressDashboardResponse getTeacherDashboard(String email);
    List<LearningRecommendationResponse> getRecommendations(String email);
    CertificateEligibilityResponse getCertificateEligibility(String email);
    List<com.example.englishlearning.dto.progress.LeaderboardRowResponse> getLeaderboard(String email, String period);
}
