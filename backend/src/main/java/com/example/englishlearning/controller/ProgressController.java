package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.progress.CourseProgressResponse;
import com.example.englishlearning.dto.progress.LessonProgressRequest;
import com.example.englishlearning.dto.progress.ProgressDashboardResponse;
import com.example.englishlearning.dto.progress.LearningRecommendationResponse;
import com.example.englishlearning.service.ProgressService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PutMapping("/progress/lessons/{lessonId}")
    public ApiResponse<CourseProgressResponse> trackLesson(
            Authentication authentication,
            @PathVariable Long lessonId,
            @RequestBody LessonProgressRequest request
    ) {
        return ApiResponse.success("Đã lưu tiến độ", progressService.trackLesson(
                authentication.getName(), lessonId, request));
    }

    @GetMapping("/progress/dashboard")
    public ApiResponse<ProgressDashboardResponse> getStudentDashboard(Authentication authentication) {
        return ApiResponse.success(progressService.getStudentDashboard(authentication.getName()));
    }

    @GetMapping("/progress/leaderboard")
    public ApiResponse<List<com.example.englishlearning.dto.progress.LeaderboardRowResponse>> getLeaderboard(
            Authentication authentication,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "weekly") String period
    ) {
        return ApiResponse.success(progressService.getLeaderboard(authentication.getName(), period));
    }

    @GetMapping("/progress/recommendations")
    public ApiResponse<List<LearningRecommendationResponse>> getRecommendations(Authentication authentication) {
        return ApiResponse.success(progressService.getRecommendations(authentication.getName()));
    }

    @GetMapping("/progress/courses")
    public ApiResponse<List<CourseProgressResponse>> getCourses(Authentication authentication) {
        return ApiResponse.success(progressService.getCourseProgress(authentication.getName()));
    }

    @GetMapping("/progress/certificate-eligibility")
    public ApiResponse<com.example.englishlearning.dto.progress.CertificateEligibilityResponse> getCertificateEligibility(Authentication authentication) {
        return ApiResponse.success(progressService.getCertificateEligibility(authentication.getName()));
    }

    @GetMapping("/progress/courses/{courseId}")
    public ApiResponse<CourseProgressResponse> getCourse(
            Authentication authentication,
            @PathVariable Long courseId
    ) {
        return ApiResponse.success(progressService.getCourseProgress(authentication.getName(), courseId));
    }

    @PostMapping("/progress/lessons/{lessonId}/start")
    public ApiResponse<CourseProgressResponse> startLesson(
            Authentication authentication,
            @PathVariable Long lessonId,
            @RequestBody(required = false) LessonProgressRequest request
    ) {
        return ApiResponse.success("Lesson started", progressService.startLesson(
                authentication.getName(), lessonId, request == null ? new LessonProgressRequest() : request));
    }

    @PostMapping("/progress/lessons/{lessonId}/complete")
    public ApiResponse<CourseProgressResponse> completeLesson(
            Authentication authentication,
            @PathVariable Long lessonId,
            @RequestBody(required = false) LessonProgressRequest request
    ) {
        return ApiResponse.success("Lesson completed", progressService.completeLesson(
                authentication.getName(), lessonId, request == null ? new LessonProgressRequest() : request));
    }

    @PostMapping("/progress/vocabulary/complete")
    public ApiResponse<String> recordVocabularyComplete(
            Authentication authentication,
            @RequestBody(required = false) java.util.Map<String, Object> payload
    ) {
        int count = payload != null && payload.containsKey("masteredCount") ? ((Number) payload.get("masteredCount")).intValue() : 5;
        progressService.recordVocabularyProgress(authentication.getName(), count);
        return ApiResponse.success("Đã ghi nhận tiến độ từ vựng thành công");
    }

    @GetMapping("/teacher/progress/dashboard")
    public ApiResponse<ProgressDashboardResponse> getTeacherDashboard(Authentication authentication) {
        return ApiResponse.success(progressService.getTeacherDashboard(authentication.getName()));
    }
}
