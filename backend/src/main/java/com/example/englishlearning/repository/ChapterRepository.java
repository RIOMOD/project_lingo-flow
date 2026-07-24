package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {

    List<Chapter> findByCourseIdAndDeletedAtIsNullOrderByPositionAsc(Long courseId);
}
