package com.example.englishlearning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "writing_submissions")
public class WritingSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 200)
    private String title;

    @Column(name = "original_text", nullable = false, columnDefinition = "LONGTEXT")
    private String originalText;

    @Column(name = "corrected_text", columnDefinition = "LONGTEXT")
    private String correctedText;

    @Column(columnDefinition = "LONGTEXT")
    private String feedback;

    @Column(precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "grammar_score", precision = 5, scale = 2)
    private BigDecimal grammarScore;

    @Column(name = "vocabulary_score", precision = 5, scale = 2)
    private BigDecimal vocabularyScore;

    @Column(name = "coherence_score", precision = 5, scale = 2)
    private BigDecimal coherenceScore;

    @Column(name = "task_response_score", precision = 5, scale = 2)
    private BigDecimal taskResponseScore;

    @Column(name = "natural_suggestion", columnDefinition = "LONGTEXT")
    private String naturalSuggestion;

    @Column(name = "suggested_lessons", columnDefinition = "LONGTEXT")
    private String suggestedLessons;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SubmissionStatus {
        PENDING,
        COMPLETED,
        FAILED
    }
}
