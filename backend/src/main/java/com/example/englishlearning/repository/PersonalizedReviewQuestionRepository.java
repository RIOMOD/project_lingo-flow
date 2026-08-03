package com.example.englishlearning.repository;

import com.example.englishlearning.entity.PersonalizedReviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonalizedReviewQuestionRepository extends JpaRepository<PersonalizedReviewQuestion, Long> {
    List<PersonalizedReviewQuestion> findBySessionIdOrderByIdAsc(Long sessionId);
}
