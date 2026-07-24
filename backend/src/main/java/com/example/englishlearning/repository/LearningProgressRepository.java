package com.example.englishlearning.repository;

import com.example.englishlearning.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    Optional<LearningProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<LearningProgress> findByUserIdOrderByLastAccessedAtDesc(Long userId);
    List<LearningProgress> findByUserIdAndCourseId(Long userId, Long courseId);
    long countByUserIdAndStatus(Long userId, LearningProgress.ProgressStatus status);
    long countByUserIdAndLastAccessedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
