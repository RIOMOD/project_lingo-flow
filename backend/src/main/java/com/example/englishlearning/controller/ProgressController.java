package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.progress.CourseProgressResponse;
import com.example.englishlearning.dto.progress.LessonProgressRequest;
import com.example.englishlearning.dto.progress.ProgressDashboardResponse;
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

    @GetMapping("/progress/courses")
    public ApiResponse<List<CourseProgressResponse>> getCourses(Authentication authentication) {
        return ApiResponse.success(progressService.getCourseProgress(authentication.getName()));
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

    @GetMapping("/teacher/progress/dashboard")
    public ApiResponse<ProgressDashboardResponse> getTeacherDashboard(Authentication authentication) {
        return ApiResponse.success(progressService.getTeacherDashboard(authentication.getName()));
    }
}
