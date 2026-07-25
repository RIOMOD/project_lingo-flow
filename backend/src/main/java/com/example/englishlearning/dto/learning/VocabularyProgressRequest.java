package com.example.englishlearning.dto.learning;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VocabularyProgressRequest {

    private Boolean favorite;

    private Boolean answeredCorrect;

    private Long responseTimeMillis;
}
