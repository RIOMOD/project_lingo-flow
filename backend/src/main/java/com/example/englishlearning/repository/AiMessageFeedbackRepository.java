package com.example.englishlearning.repository;

import com.example.englishlearning.entity.AiMessageFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiMessageFeedbackRepository extends JpaRepository<AiMessageFeedback, Long> {
    Optional<AiMessageFeedback> findByUserIdAndMessageId(Long userId, Long messageId);
    Page<AiMessageFeedback> findByRatingOrderByCreatedAtDesc(AiMessageFeedback.Rating rating, Pageable pageable);
    Page<AiMessageFeedback> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByRating(AiMessageFeedback.Rating rating);
}
