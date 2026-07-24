package com.example.englishlearning.dto.learning;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VocabularyProgressRequest {

    private Boolean favorite;
}
