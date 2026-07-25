package com.example.englishlearning.repository;

import com.example.englishlearning.entity.GrammarExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GrammarExerciseRepository extends JpaRepository<GrammarExercise, Long> {
    Optional<GrammarExercise> findByGrammarTopicId(Long topicId);
}
