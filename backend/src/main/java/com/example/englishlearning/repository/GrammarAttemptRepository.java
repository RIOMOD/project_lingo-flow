package com.example.englishlearning.repository;

import com.example.englishlearning.entity.GrammarAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarAttemptRepository extends JpaRepository<GrammarAttempt, Long> {
    List<GrammarAttempt> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<GrammarAttempt> findByExerciseIdOrderByCreatedAtDesc(Long exerciseId);
}
