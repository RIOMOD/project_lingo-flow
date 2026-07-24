package com.example.englishlearning.repository;

import com.example.englishlearning.entity.CourseReviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseReviewHistoryRepository extends JpaRepository<CourseReviewHistory, Long> {
    List<CourseReviewHistory> findByCourse_IdOrderByCreatedAtDesc(Long courseId);

    Optional<CourseReviewHistory> findFirstByCourse_IdAndActionOrderByCreatedAtDesc(
            Long courseId,
            CourseReviewHistory.ReviewAction action
    );
}
