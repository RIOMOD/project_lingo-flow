package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Exercise;
import com.example.englishlearning.entity.CourseOwnership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Page<Exercise> findByCourseIdAndDeletedAtIsNullOrderByUpdatedAtDesc(Long courseId, Pageable pageable);
    Page<Exercise> findByStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(Exercise.ContentStatus status, Pageable pageable);

    @Query("""
            select e from Exercise e
            where e.deletedAt is null
            and e.status = :status
            and (:courseId is null or e.course.id = :courseId)
            and exists (
                select 1 from CourseOwnership o
                where o.user.id = :userId
                and o.course.id = e.course.id
                and o.status = :ownershipStatus
            )
            order by e.updatedAt desc
            """)
    Page<Exercise> findAccessiblePublished(
            @Param("userId") Long userId,
            @Param("courseId") Long courseId,
            @Param("status") Exercise.ContentStatus status,
            @Param("ownershipStatus") CourseOwnership.OwnershipStatus ownershipStatus,
            Pageable pageable
    );

    @Query("""
            select e from Exercise e
            where e.deletedAt is null
            and (:courseId is null or e.course.id = :courseId)
            and e.course.teacher.id = :teacherId
            order by e.updatedAt desc
            """)
    Page<Exercise> findTeacherExercises(@Param("teacherId") Long teacherId, @Param("courseId") Long courseId, Pageable pageable);
}
