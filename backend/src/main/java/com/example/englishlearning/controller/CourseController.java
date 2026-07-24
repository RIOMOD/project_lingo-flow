package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.course.ChapterResponse;
import com.example.englishlearning.dto.course.CourseAccessResponse;
import com.example.englishlearning.dto.course.CourseDetailResponse;
import com.example.englishlearning.dto.course.CourseSummaryResponse;
import com.example.englishlearning.dto.course.LessonResponse;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.service.CourseService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ApiResponse<PageResponse<CourseSummaryResponse>> getCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Course.CourseLevel level,
            @RequestParam(required = false) Course.CourseType courseType,
            @PageableDefault(size = 12) Pageable pageable
    ) {
        return ApiResponse.success(courseService.getPublishedCourses(search, level, courseType, pageable));
    }

    @GetMapping("/{slug}")
    public ApiResponse<CourseDetailResponse> getCourse(@PathVariable String slug) {
        return ApiResponse.success(courseService.getPublishedCourseBySlug(slug));
    }

    @GetMapping("/{courseId}/chapters")
    public ApiResponse<List<ChapterResponse>> getChapters(@PathVariable Long courseId, Authentication authentication) {
        return ApiResponse.success(courseService.getCourseChapters(courseId, currentEmail(authentication)));
    }

    @GetMapping("/{courseId}/lessons/{lessonId}")
    public ApiResponse<LessonResponse> getLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            Authentication authentication
    ) {
        return ApiResponse.success(courseService.getLesson(courseId, lessonId, currentEmail(authentication)));
    }

    @PostMapping("/{courseId}/enroll-free")
    public ApiResponse<CourseAccessResponse> enrollFree(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ApiResponse.success("Enrolled successfully", courseService.enrollFree(courseId, currentEmail(authentication)));
    }

    @GetMapping("/{courseId}/access")
    public ApiResponse<CourseAccessResponse> getAccess(
            @PathVariable Long courseId,
            Authentication authentication
    ) {
        return ApiResponse.success(courseService.getAccess(courseId, currentEmail(authentication)));
    }

    private String currentEmail(Authentication authentication) {
        return authentication == null ? null : authentication.getName();
    }
}
