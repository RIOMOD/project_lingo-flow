package com.example.englishlearning.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "personalized_review_sessions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedReviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_attempt_id")
    private TestAttempt sourceAttempt;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "pre_accuracy", precision = 5, scale = 2)
    private BigDecimal preAccuracy;

    @Column(name = "post_accuracy", precision = 5, scale = 2)
    private BigDecimal postAccuracy;

    @Column(name = "improvement_percent", precision = 5, scale = 2)
    private BigDecimal improvementPercent;

    @Column(name = "feedback_tag", length = 50)
    private String feedbackTag;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private SessionStatus status = SessionStatus.IN_PROGRESS;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum SessionStatus {
        IN_PROGRESS,
        COMPLETED
    }
}
