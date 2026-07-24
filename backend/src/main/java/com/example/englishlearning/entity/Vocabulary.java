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
@Table(name = "vocabularies")
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @Column(nullable = false, length = 120)
    private String word;

    @Column(length = 120)
    private String ipa;

    @Column(nullable = false, length = 500)
    private String meaning;

    @Enumerated(EnumType.STRING)
    @Column(name = "part_of_speech", nullable = false)
    private PartOfSpeech partOfSpeech = PartOfSpeech.OTHER;

    @Column(name = "example_sentence", length = 500)
    private String exampleSentence;

    @Column(name = "example_meaning", length = 500)
    private String exampleMeaning;

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Course.CourseLevel level = Course.CourseLevel.BEGINNER;

    @Column(length = 120)
    private String topic;

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

    public enum PartOfSpeech {
        NOUN,
        VERB,
        ADJECTIVE,
        ADVERB,
        PREPOSITION,
        CONJUNCTION,
        PRONOUN,
        PHRASE,
        IDIOM,
        OTHER
    }
}
