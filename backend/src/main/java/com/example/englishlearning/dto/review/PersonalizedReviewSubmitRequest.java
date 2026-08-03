package com.example.englishlearning.dto.review;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class PersonalizedReviewSubmitRequest {
    private List<UserAnswerSubmission> answers;

    @Getter
    @Setter
    public static class UserAnswerSubmission {
        private Long questionId;
        private String selectedOptionId;
        private List<String> selectedOptionIds;
        private String answerText;
    }
}
