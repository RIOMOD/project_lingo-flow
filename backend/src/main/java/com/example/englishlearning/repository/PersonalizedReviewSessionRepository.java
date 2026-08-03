package com.example.englishlearning.repository;

import com.example.englishlearning.entity.PersonalizedReviewSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonalizedReviewSessionRepository extends JpaRepository<PersonalizedReviewSession, Long> {
    List<PersonalizedReviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<PersonalizedReviewSession> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
