package com.example.englishlearning.repository;

import com.example.englishlearning.entity.GrammarAttemptAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarAttemptAnswerRepository extends JpaRepository<GrammarAttemptAnswer, Long> {
    List<GrammarAttemptAnswer> findByAttemptId(Long attemptId);
}
