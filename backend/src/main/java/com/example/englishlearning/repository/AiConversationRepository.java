package com.example.englishlearning.repository;

import com.example.englishlearning.entity.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(Long userId);
    Optional<AiConversation> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);
}
