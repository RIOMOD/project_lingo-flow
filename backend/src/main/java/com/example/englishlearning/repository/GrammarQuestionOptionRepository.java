package com.example.englishlearning.repository;

import com.example.englishlearning.entity.GrammarQuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrammarQuestionOptionRepository extends JpaRepository<GrammarQuestionOption, Long> {
    List<GrammarQuestionOption> findByQuestionId(Long questionId);
}
