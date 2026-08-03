package com.example.englishlearning.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personalized_review_questions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalizedReviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private PersonalizedReviewSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "topic", length = 100)
    private String topic;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_type", length = 50)
    private Question.SkillType skillType;

    @Column(name = "weight_order")
    private Integer weightOrder;
}
