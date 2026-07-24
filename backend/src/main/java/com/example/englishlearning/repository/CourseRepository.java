package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {

    Optional<Course> findBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlugAndDeletedAtIsNull(String slug);

    Page<Course> findByTeacherIdAndDeletedAtIsNullOrderByUpdatedAtDesc(Long teacherId, Pageable pageable);

    Page<Course> findByStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(Course.CourseStatus status, Pageable pageable);

    @Query("""
            select c from Course c
            where c.deletedAt is null
            and c.status = :status
            and (:search is null or lower(c.title) like lower(concat('%', :search, '%')))
            and (:level is null or c.level = :level)
            and (:courseType is null or c.courseType = :courseType)
            order by c.publishedAt desc, c.updatedAt desc
            """)
    Page<Course> searchPublished(
            @Param("status") Course.CourseStatus status,
            @Param("search") String search,
            @Param("level") Course.CourseLevel level,
            @Param("courseType") Course.CourseType courseType,
            Pageable pageable
    );
}
