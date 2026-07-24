package com.example.englishlearning.repository;

import com.example.englishlearning.entity.VocabularyTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VocabularyTopicProgressRepository extends JpaRepository<VocabularyTopicProgress, Long> {
    List<VocabularyTopicProgress> findByUserId(Long userId);
    Optional<VocabularyTopicProgress> findByUserIdAndTopicName(Long userId, String topicName);
}
