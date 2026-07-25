package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.course.AdminCourseSaleRequest;
import com.example.englishlearning.dto.course.CourseDetailResponse;
import com.example.englishlearning.dto.course.CourseReviewHistoryResponse;
import com.example.englishlearning.dto.course.CourseSummaryResponse;
import com.example.englishlearning.dto.course.RejectCourseRequest;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/courses")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseService courseService;

    public AdminCourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ApiResponse<PageResponse<CourseSummaryResponse>> getCourses(
            @RequestParam(required = false) Course.CourseStatus status,
            @PageableDefault(size = 12) Pageable pageable
    ) {
        return ApiResponse.success(courseService.getAdminCourses(status, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseDetailResponse> getCourseDetail(@PathVariable Long id) {
        return ApiResponse.success(courseService.getAdminCourseDetail(id));
    }

    @GetMapping("/{id}/chapters")
    public ApiResponse<java.util.List<com.example.englishlearning.dto.course.ChapterResponse>> getCourseChapters(@PathVariable Long id) {
        return ApiResponse.success(courseService.getAdminCourseChapters(id));
    }

    @GetMapping("/{id}/review-history")
    public ApiResponse<List<CourseReviewHistoryResponse>> getCourseReviewHistory(@PathVariable Long id) {
        return ApiResponse.success(courseService.getAdminCourseReviewHistory(id));
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<CourseDetailResponse> approve(@PathVariable Long id) {
        return ApiResponse.success("Course approved", courseService.approveCourse(id));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<CourseDetailResponse> reject(
            @PathVariable Long id,
            @Valid @RequestBody RejectCourseRequest request
    ) {
        return ApiResponse.success("Course rejected", courseService.rejectCourse(id, request));
    }

    @PostMapping("/{id}/publish")
    public ApiResponse<CourseDetailResponse> publish(@PathVariable Long id) {
        return ApiResponse.success("Course published", courseService.publishCourse(id));
    }

    @PostMapping("/{id}/hide")
    public ApiResponse<CourseDetailResponse> hide(@PathVariable Long id) {
        return ApiResponse.success("Course hidden", courseService.hideCourse(id));
    }

    @PostMapping("/{id}/archive")
    public ApiResponse<CourseDetailResponse> archive(@PathVariable Long id) {
        return ApiResponse.success("Course archived", courseService.archiveCourse(id));
    }

    @PutMapping("/{id}/sale")
    public ApiResponse<CourseDetailResponse> upsertSale(
            @PathVariable Long id,
            @Valid @RequestBody AdminCourseSaleRequest request
    ) {
        return ApiResponse.success("Course sale updated", courseService.upsertCourseSale(id, request));
    }

    @DeleteMapping("/{id}/sale")
    public ApiResponse<CourseDetailResponse> clearSale(@PathVariable Long id) {
        return ApiResponse.success("Course sale removed", courseService.clearCourseSale(id));
    }
}
