package com.example.englishlearning.repository;

import com.example.englishlearning.entity.WritingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WritingSubmissionRepository extends JpaRepository<WritingSubmission, Long> {
    List<WritingSubmission> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
