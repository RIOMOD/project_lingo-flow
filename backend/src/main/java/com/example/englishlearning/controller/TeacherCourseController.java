package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.course.ChapterRequest;
import com.example.englishlearning.dto.course.ChapterResponse;
import com.example.englishlearning.dto.course.CourseDetailResponse;
import com.example.englishlearning.dto.course.CourseRequest;
import com.example.englishlearning.dto.course.CourseSummaryResponse;
import com.example.englishlearning.dto.course.LessonRequest;
import com.example.englishlearning.dto.course.LessonResponse;
import com.example.englishlearning.service.CourseService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher")
public class TeacherCourseController {

    private final CourseService courseService;

    public TeacherCourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/courses")
    public ApiResponse<PageResponse<CourseSummaryResponse>> getMyCourses(
            Authentication authentication,
            @PageableDefault(size = 12) Pageable pageable
    ) {
        return ApiResponse.success(courseService.getTeacherCourses(authentication.getName(), pageable));
    }

    @PostMapping("/courses")
    public ApiResponse<CourseDetailResponse> createCourse(
            @Valid @RequestBody CourseRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Course created", courseService.createCourse(request, authentication.getName()));
    }

    @PutMapping("/courses/{id}")
    public ApiResponse<CourseDetailResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Course updated", courseService.updateCourse(id, request, authentication.getName()));
    }

    @DeleteMapping("/courses/{id}")
    public ApiResponse<Void> deleteCourse(@PathVariable Long id, Authentication authentication) {
        courseService.deleteTeacherCourse(id, authentication.getName());
        return ApiResponse.success("Course deleted", null);
    }

    @PostMapping("/courses/{id}/submit-review")
    public ApiResponse<CourseDetailResponse> submitReview(@PathVariable Long id, Authentication authentication) {
        return ApiResponse.success("Course submitted for review", courseService.submitReview(id, authentication.getName()));
    }

    @PostMapping("/courses/{id}/chapters")
    public ApiResponse<ChapterResponse> createChapter(
            @PathVariable Long id,
            @Valid @RequestBody ChapterRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Chapter created", courseService.createChapter(id, request, authentication.getName()));
    }

    @PutMapping("/chapters/{chapterId}")
    public ApiResponse<ChapterResponse> updateChapter(
            @PathVariable Long chapterId,
            @Valid @RequestBody ChapterRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Chapter updated", courseService.updateChapter(chapterId, request, authentication.getName()));
    }

    @PostMapping("/chapters/{chapterId}/lessons")
    public ApiResponse<LessonResponse> createLesson(
            @PathVariable Long chapterId,
            @Valid @RequestBody LessonRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Lesson created", courseService.createLesson(chapterId, request, authentication.getName()));
    }

    @PutMapping("/lessons/{lessonId}")
    public ApiResponse<LessonResponse> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request,
            Authentication authentication
    ) {
        return ApiResponse.success("Lesson updated", courseService.updateLesson(lessonId, request, authentication.getName()));
    }

    @GetMapping("/courses/{id}/chapters")
    public ApiResponse<java.util.List<ChapterResponse>> getChapters(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ApiResponse.success(courseService.getTeacherCourseChapters(id, authentication.getName()));
    }

    @DeleteMapping("/chapters/{chapterId}")
    public ApiResponse<Void> deleteChapter(@PathVariable Long chapterId, Authentication authentication) {
        courseService.deleteChapter(chapterId, authentication.getName());
        return ApiResponse.success("Chapter deleted", null);
    }

    @DeleteMapping("/lessons/{lessonId}")
    public ApiResponse<Void> deleteLesson(@PathVariable Long lessonId, Authentication authentication) {
        courseService.deleteLesson(lessonId, authentication.getName());
        return ApiResponse.success("Lesson deleted", null);
    }
}
