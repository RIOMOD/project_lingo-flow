package com.example.englishlearning.repository;

import com.example.englishlearning.entity.VocabularySessionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VocabularySessionItemRepository extends JpaRepository<VocabularySessionItem, Long> {
    List<VocabularySessionItem> findBySessionId(Long sessionId);
    Optional<VocabularySessionItem> findBySessionIdAndVocabularyId(Long sessionId, Long vocabularyId);
}
