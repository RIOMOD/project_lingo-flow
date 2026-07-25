package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExerciseIdAndDeletedAtIsNullOrderByPositionAsc(Long exerciseId);
}
