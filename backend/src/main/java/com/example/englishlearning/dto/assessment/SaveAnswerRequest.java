package com.example.englishlearning.dto.assessment;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SaveAnswerRequest {
    private Long selectedOptionId;
    private List<Long> selectedOptionIds;
    private String answerText;
    private String answerJson;
}
