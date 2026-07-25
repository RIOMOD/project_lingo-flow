package com.example.englishlearning.repository;

import com.example.englishlearning.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    boolean existsByUserIdAndCourseIdAndStatus(
            Long userId,
            Long courseId,
            CourseEnrollment.EnrollmentStatus status
    );

    List<CourseEnrollment> findByUserIdAndStatus(Long userId, CourseEnrollment.EnrollmentStatus status);
}
