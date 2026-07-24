package com.example.englishlearning.repository;

import com.example.englishlearning.entity.AnswerOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerOptionRepository extends JpaRepository<AnswerOption, Long> {
    List<AnswerOption> findByQuestionIdOrderByPositionAsc(Long questionId);
    void deleteByQuestionId(Long questionId);
}
