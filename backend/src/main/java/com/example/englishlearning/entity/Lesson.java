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

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private Chapter chapter;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "lesson_type", nullable = false)
    private LessonType lessonType;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "checkpoint_question", length = 500)
    private String checkpointQuestion;

    @Column(name = "checkpoint_answer", length = 255)
    private String checkpointAnswer;

    @Column(name = "checkpoint_explanation", length = 1000)
    private String checkpointExplanation;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "is_preview", nullable = false)
    private Boolean preview = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LessonStatus status = LessonStatus.DRAFT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

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

    public enum LessonType {
        VIDEO,
        AUDIO,
        TEXT,
        MIXED
    }

    public enum LessonStatus {
        DRAFT,
        PUBLISHED,
        HIDDEN
    }
}
