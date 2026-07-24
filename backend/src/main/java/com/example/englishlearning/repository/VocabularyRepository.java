package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.CourseOwnership;
import com.example.englishlearning.entity.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    @Query("""
            select v from Vocabulary v
            where v.deletedAt is null
            and (:courseId is null or v.course.id = :courseId)
            and (:lessonId is null or v.lesson.id = :lessonId)
            and (:level is null or v.level = :level)
            and (:topic is null or lower(v.topic) = lower(:topic))
            and (:search is null or lower(v.word) like lower(concat('%', :search, '%'))
                or lower(v.meaning) like lower(concat('%', :search, '%')))
            order by v.updatedAt desc
            """)
    Page<Vocabulary> search(
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("search") String search,
            @Param("level") Course.CourseLevel level,
            @Param("topic") String topic,
            Pageable pageable
    );

    @Query("""
            select v from Vocabulary v
            where v.deletedAt is null
            and (:courseId is null or v.course.id = :courseId)
            and (:lessonId is null or v.lesson.id = :lessonId)
            and (:level is null or v.level = :level)
            and (:topic is null or lower(v.topic) = lower(:topic))
            and (:search is null or lower(v.word) like lower(concat('%', :search, '%'))
                or lower(v.meaning) like lower(concat('%', :search, '%')))
            and exists (
                select 1 from CourseOwnership o
                where o.user.id = :userId
                and o.course.id = v.course.id
                and o.status = :ownershipStatus
            )
            order by v.updatedAt desc
            """)
    Page<Vocabulary> searchAccessible(
            @Param("userId") Long userId,
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("search") String search,
            @Param("level") Course.CourseLevel level,
            @Param("topic") String topic,
            @Param("ownershipStatus") CourseOwnership.OwnershipStatus ownershipStatus,
            Pageable pageable
    );

    @Query("""
            select v from Vocabulary v
            where v.deletedAt is null
            and v.course.teacher.id = :teacherId
            and (:courseId is null or v.course.id = :courseId)
            and (:lessonId is null or v.lesson.id = :lessonId)
            and (:level is null or v.level = :level)
            and (:topic is null or lower(v.topic) = lower(:topic))
            and (:search is null or lower(v.word) like lower(concat('%', :search, '%'))
                or lower(v.meaning) like lower(concat('%', :search, '%')))
            order by v.updatedAt desc
            """)
    Page<Vocabulary> searchTeacherContent(
            @Param("teacherId") Long teacherId,
            @Param("courseId") Long courseId,
            @Param("lessonId") Long lessonId,
            @Param("search") String search,
            @Param("level") Course.CourseLevel level,
            @Param("topic") String topic,
            Pageable pageable
    );
}
