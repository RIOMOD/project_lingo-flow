package com.example.englishlearning.repository;

import com.example.englishlearning.entity.VocabularyProgress;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VocabularyProgressRepository extends JpaRepository<VocabularyProgress, Long> {

    Optional<VocabularyProgress> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, com.example.englishlearning.entity.VocabularyStatus status);

    long countByUserIdAndNextReviewAtLessThanEqual(Long userId, LocalDateTime now);

    @Query("""
            select p from VocabularyProgress p
            where p.user.id = :userId
            and (p.nextReviewAt is null or p.nextReviewAt <= :now or p.status = 'WEAK')
            order by p.nextReviewAt asc, p.updatedAt desc
            """)
    Page<VocabularyProgress> findReviewDue(@Param("userId") Long userId, @Param("now") LocalDateTime now, Pageable pageable);
}
