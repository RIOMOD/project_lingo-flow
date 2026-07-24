package com.example.englishlearning.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "test_attempts")
public class TestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id")
    private Test test;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(precision = 6, scale = 2)
    private BigDecimal score;

    @Column(name = "test_snapshot", columnDefinition = "JSON")
    private String testSnapshot;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @PrePersist
    void onCreate() {
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }

    public enum AttemptStatus {
        IN_PROGRESS, SUBMITTED, GRADED
    }
}
