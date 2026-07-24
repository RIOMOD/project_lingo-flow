package com.example.englishlearning.dto.learning;

import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.Vocabulary;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class VocabularyResponse {

    private Long id;
    private Long courseId;
    private Long lessonId;
    private String word;
    private String ipa;
    private String meaning;
    private Vocabulary.PartOfSpeech partOfSpeech;
    private String exampleSentence;
    private String exampleMeaning;
    private String audioUrl;
    private String imageUrl;
    private Course.CourseLevel level;
    private String topic;
    private java.math.BigDecimal masteryScore;
    private com.example.englishlearning.entity.VocabularyStatus status;
    private Boolean favorite;
    private Integer correctCount;
    private Integer incorrectCount;
    private Integer reviewCount;
    private LocalDateTime reviewedAt;
    private LocalDateTime nextReviewAt;
    private Boolean reviewDue;
}
