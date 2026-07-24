package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByChapterIdAndDeletedAtIsNullOrderByPositionAsc(Long chapterId);

    Optional<Lesson> findByIdAndChapterCourseIdAndDeletedAtIsNull(Long id, Long courseId);

    List<Lesson> findByChapterCourseIdAndDeletedAtIsNullOrderByPositionAsc(Long courseId);

    long countByChapterCourseIdAndDeletedAtIsNull(Long courseId);

    @Query("""
            select l from Lesson l
            join fetch l.chapter ch
            where ch.course.id = :courseId
              and l.deletedAt is null
              and ch.deletedAt is null
              and l.status = com.example.englishlearning.entity.Lesson.LessonStatus.PUBLISHED
            order by ch.position asc, l.position asc
            """)
    List<Lesson> findCourseLessonsInLearningOrder(Long courseId);
}
