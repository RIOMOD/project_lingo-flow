package com.example.englishlearning.repository;

import com.example.englishlearning.entity.TestAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    long countByUserIdAndTestId(Long userId, Long testId);
    long countByUserIdAndExerciseId(Long userId, Long exerciseId);
    Page<TestAttempt> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);
    List<TestAttempt> findByUserIdAndSubmittedAtIsNotNull(Long userId);
    @Query("select count(distinct a.exercise.id) from TestAttempt a where a.user.id = :userId and a.exercise is not null and a.submittedAt is not null")
    long countByUserIdAndExerciseIsNotNullAndSubmittedAtIsNotNull(Long userId);
    Page<TestAttempt> findByTestCourseTeacherIdOrExerciseCourseTeacherIdOrderByStartedAtDesc(Long testTeacherId, Long exerciseTeacherId, Pageable pageable);
}
