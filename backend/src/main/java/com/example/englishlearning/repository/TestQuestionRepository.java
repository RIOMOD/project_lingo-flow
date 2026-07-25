package com.example.englishlearning.repository;

import com.example.englishlearning.entity.TestQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestQuestionRepository extends JpaRepository<TestQuestion, Long> {
    List<TestQuestion> findByTestIdOrderByPositionAsc(Long testId);
    List<TestQuestion> findByQuestionId(Long questionId);
    void deleteByTestId(Long testId);
}
