package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.CourseOwnership;
import com.example.englishlearning.entity.GrammarTopic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GrammarTopicRepository extends JpaRepository<GrammarTopic, Long> {

    @Query("""
            select g from GrammarTopic g
            where g.deletedAt is null
            and (:courseId is null or g.course.id = :courseId)
            and (:lessonId is null or g.lesson.id = :lessonId)
            and (:level is null or g.level = :level)
            and (:search is null or lower(g.title) like lower(concat('%', :search, '%'))
                or lower(g.description) like lower(concat('%', :search, '%')))
            order by g.updatedAt desc
            """)
    Page<GrammarTopic> search(
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("search") String search,
            @Param("level") Course.CourseLevel level,
            Pageable pageable
    );

    @Query("""
            select g from GrammarTopic g
            where g.deletedAt is null
            and (:courseId is null or g.course.id = :courseId)
            and (:lessonId is null or g.lesson.id = :lessonId)
            and (:level is null or g.level = :level)
            and (:search is null or lower(g.title) like lower(concat('%', :search, '%'))
                or lower(g.description) like lower(concat('%', :search, '%')))
            and exists (
                select 1 from CourseOwnership o
                where o.user.id = :userId
                and o.course.id = g.course.id
                and o.status = :ownershipStatus
            )
            order by g.updatedAt desc
            """)
    Page<GrammarTopic> searchAccessible(
            @Param("userId") Long userId,
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("search") String search,
            @Param("level") Course.CourseLevel level,
            @Param("ownershipStatus") CourseOwnership.OwnershipStatus ownershipStatus,
            Pageable pageable
    );

    @Query("""
            select g from GrammarTopic g
            where g.deletedAt is null
            and g.course.teacher.id = :teacherId
            and (:courseId is null or g.course.id = :courseId)
            and (:lessonId is null or g.lesson.id = :lessonId)
            and (:level is null or g.level = :level)
            and (:search is null or lower(g.title) like lower(concat('%', :search, '%'))
                or lower(g.description) like lower(concat('%', :search, '%')))
            order by g.updatedAt desc
            """)
    Page<GrammarTopic> searchTeacherContent(
            @Param("teacherId") Long teacherId,
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("search") String search,
            @Param("level") Course.CourseLevel level,
            Pageable pageable
    );
}
