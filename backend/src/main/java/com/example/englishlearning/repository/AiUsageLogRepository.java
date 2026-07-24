package com.example.englishlearning.repository;

import com.example.englishlearning.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {
    long countByUserIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
    List<AiUsageLog> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, LocalDateTime start, LocalDateTime end);
}
