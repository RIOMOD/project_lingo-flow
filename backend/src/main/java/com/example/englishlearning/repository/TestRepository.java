package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Exercise;
import com.example.englishlearning.entity.CourseOwnership;
import com.example.englishlearning.entity.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TestRepository extends JpaRepository<Test, Long> {
    Page<Test> findByCourseIdAndDeletedAtIsNullOrderByUpdatedAtDesc(Long courseId, Pageable pageable);
    Page<Test> findByStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(Exercise.ContentStatus status, Pageable pageable);

    @Query("""
            select t from Test t
            where t.deletedAt is null
            and t.status = :status
            and (:courseId is null or t.course.id = :courseId)
            and exists (
                select 1 from CourseOwnership o
                where o.user.id = :userId
                and o.course.id = t.course.id
                and o.status = :ownershipStatus
            )
            order by t.updatedAt desc
            """)
    Page<Test> findAccessiblePublished(
            @Param("userId") Long userId,
            @Param("courseId") Long courseId,
            @Param("status") Exercise.ContentStatus status,
            @Param("ownershipStatus") CourseOwnership.OwnershipStatus ownershipStatus,
            Pageable pageable
    );

    @Query("""
            select t from Test t
            where t.deletedAt is null
            and (:courseId is null or t.course.id = :courseId)
            and t.course.teacher.id = :teacherId
            order by t.updatedAt desc
            """)
    Page<Test> findTeacherTests(@Param("teacherId") Long teacherId, @Param("courseId") Long courseId, Pageable pageable);
}
