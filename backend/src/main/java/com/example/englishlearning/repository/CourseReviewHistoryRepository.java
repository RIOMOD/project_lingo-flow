package com.example.englishlearning.repository;

import com.example.englishlearning.entity.CourseReviewHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseReviewHistoryRepository extends JpaRepository<CourseReviewHistory, Long> {
    List<CourseReviewHistory> findByCourseIdOrderByCreatedAtDesc(Long courseId);
}
