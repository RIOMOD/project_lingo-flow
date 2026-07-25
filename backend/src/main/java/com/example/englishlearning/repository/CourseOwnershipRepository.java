package com.example.englishlearning.repository;

import com.example.englishlearning.entity.CourseOwnership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseOwnershipRepository extends JpaRepository<CourseOwnership, Long> {

    Page<CourseOwnership> findByUserId(Long userId, Pageable pageable);

    boolean existsByUserIdAndCourseIdAndStatus(
            Long userId,
            Long courseId,
            CourseOwnership.OwnershipStatus status
    );

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    java.util.List<CourseOwnership> findByOrderItemOrderId(Long orderId);
}
