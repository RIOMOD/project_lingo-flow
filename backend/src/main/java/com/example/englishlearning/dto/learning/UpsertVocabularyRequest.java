package com.example.englishlearning.dto.learning;

import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.Vocabulary;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpsertVocabularyRequest {

    @NotNull
    private Long courseId;

    private Long lessonId;

    @NotBlank
    @Size(max = 120)
    private String word;

    @Size(max = 120)
    private String ipa;

    @NotBlank
    @Size(max = 500)
    private String meaning;

    private Vocabulary.PartOfSpeech partOfSpeech = Vocabulary.PartOfSpeech.OTHER;

    @Size(max = 500)
    private String exampleSentence;

    @Size(max = 500)
    private String exampleMeaning;

    @Size(max = 500)
    private String audioUrl;

    @Size(max = 500)
    private String imageUrl;

    private Course.CourseLevel level = Course.CourseLevel.BEGINNER;

    @NotBlank
    @Size(max = 120)
    private String topic;
}
