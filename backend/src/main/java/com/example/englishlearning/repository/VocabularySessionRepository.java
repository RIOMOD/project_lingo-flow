package com.example.englishlearning.repository;

import com.example.englishlearning.entity.VocabularySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularySessionRepository extends JpaRepository<VocabularySession, Long> {
    List<VocabularySession> findByUserIdAndTopicNameOrderByStartedAtDesc(Long userId, String topicName);
    List<VocabularySession> findByUserIdOrderByStartedAtDesc(Long userId);
}
