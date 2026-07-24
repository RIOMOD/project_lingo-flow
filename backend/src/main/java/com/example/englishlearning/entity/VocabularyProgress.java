package com.example.englishlearning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "vocabulary_progress")
public class VocabularyProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id", nullable = false)
    private Vocabulary vocabulary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VocabularyStatus status = VocabularyStatus.NEW;

    @Column(name = "mastery_score", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal masteryScore = java.math.BigDecimal.ZERO;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount = 0;

    @Column(name = "incorrect_count", nullable = false)
    private Integer incorrectCount = 0;

    @Column(name = "consecutive_correct", nullable = false)
    private Integer consecutiveCorrect = 0;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Column(name = "average_response_time")
    private Long averageResponseTime = 0L;

    @Column(nullable = false)
    private Boolean favorite = false;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "next_review_at")
    private LocalDateTime nextReviewAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
