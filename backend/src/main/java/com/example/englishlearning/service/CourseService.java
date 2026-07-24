package com.example.englishlearning.service;

import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.course.ChapterRequest;
import com.example.englishlearning.dto.course.ChapterResponse;
import com.example.englishlearning.dto.course.AdminCourseSaleRequest;
import com.example.englishlearning.dto.course.CourseAccessResponse;
import com.example.englishlearning.dto.course.CourseDetailResponse;
import com.example.englishlearning.dto.course.CourseRequest;
import com.example.englishlearning.dto.course.CourseReviewHistoryResponse;
import com.example.englishlearning.dto.course.CourseSummaryResponse;
import com.example.englishlearning.dto.course.LessonRequest;
import com.example.englishlearning.dto.course.LessonResponse;
import com.example.englishlearning.dto.course.RejectCourseRequest;
import com.example.englishlearning.entity.Course;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CourseService {

    PageResponse<CourseSummaryResponse> getPublishedCourses(String search, Course.CourseLevel level, Course.CourseType courseType, Pageable pageable);

    CourseDetailResponse getPublishedCourseBySlug(String slug);

    List<ChapterResponse> getCourseChapters(Long courseId, String currentEmail);

    LessonResponse getLesson(Long courseId, Long lessonId, String currentEmail);

    CourseAccessResponse getAccess(Long courseId, String currentEmail);

    CourseAccessResponse enrollFree(Long courseId, String currentEmail);

    PageResponse<CourseSummaryResponse> getTeacherCourses(String teacherEmail, Pageable pageable);

    CourseDetailResponse getTeacherCourseDetail(Long courseId, String teacherEmail);

    CourseDetailResponse createCourse(CourseRequest request, String teacherEmail);

    CourseDetailResponse updateCourse(Long courseId, CourseRequest request, String teacherEmail);

    void deleteTeacherCourse(Long courseId, String teacherEmail);

    CourseDetailResponse submitReview(Long courseId, String teacherEmail);

    ChapterResponse createChapter(Long courseId, ChapterRequest request, String teacherEmail);

    ChapterResponse updateChapter(Long chapterId, ChapterRequest request, String teacherEmail);

    LessonResponse createLesson(Long chapterId, LessonRequest request, String teacherEmail);

    LessonResponse updateLesson(Long lessonId, LessonRequest request, String teacherEmail);

    void deleteChapter(Long chapterId, String teacherEmail);

    void deleteLesson(Long lessonId, String teacherEmail);

    List<ChapterResponse> getTeacherCourseChapters(Long courseId, String teacherEmail);

    PageResponse<CourseSummaryResponse> getAdminCourses(Course.CourseStatus status, Pageable pageable);

    CourseDetailResponse getAdminCourseDetail(Long courseId);

    List<ChapterResponse> getAdminCourseChapters(Long courseId);

    List<CourseReviewHistoryResponse> getAdminCourseReviewHistory(Long courseId);

    CourseDetailResponse approveCourse(Long courseId);

    CourseDetailResponse rejectCourse(Long courseId, RejectCourseRequest request);

    CourseDetailResponse publishCourse(Long courseId);

    CourseDetailResponse hideCourse(Long courseId);

    CourseDetailResponse archiveCourse(Long courseId);

    CourseDetailResponse upsertCourseSale(Long courseId, AdminCourseSaleRequest request);

    CourseDetailResponse clearCourseSale(Long courseId);
}
