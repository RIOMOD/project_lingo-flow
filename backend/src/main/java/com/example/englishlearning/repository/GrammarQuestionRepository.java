package com.example.englishlearning.repository;

import com.example.englishlearning.entity.GrammarQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarQuestionRepository extends JpaRepository<GrammarQuestion, Long> {
    List<GrammarQuestion> findByExerciseId(Long exerciseId);
}
