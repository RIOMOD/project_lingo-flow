package com.example.englishlearning.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "learning_progress")
public class LearningProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgressStatus status = ProgressStatus.NOT_STARTED;

    @Column(name = "progress_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal progressPercent = BigDecimal.ZERO;

    @Column(precision = 6, scale = 2)
    private BigDecimal score;

    @Column(name = "study_time_minutes", nullable = false)
    private Integer studyTimeMinutes = 0;

    @Column(name = "study_time_seconds", nullable = false)
    private Integer studyTimeSeconds = 0;

    @Column(name = "media_position_seconds", nullable = false, precision = 10, scale = 2)
    private BigDecimal mediaPositionSeconds = BigDecimal.ZERO;

    @Column(name = "media_duration_seconds", nullable = false, precision = 10, scale = 2)
    private BigDecimal mediaDurationSeconds = BigDecimal.ZERO;

    @Column(name = "content_progress_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal contentProgressPercent = BigDecimal.ZERO;

    @Column(name = "checkpoint_score", precision = 5, scale = 2)
    private BigDecimal checkpointScore;

    @Column(name = "checkpoint_passed", nullable = false)
    private Boolean checkpointPassed = false;

    @Column(name = "checkpoint_attempts", nullable = false)
    private Integer checkpointAttempts = 0;

    @Column(name = "preview_only", nullable = false)
    private Boolean previewOnly = false;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

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

    public enum ProgressStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }
}
