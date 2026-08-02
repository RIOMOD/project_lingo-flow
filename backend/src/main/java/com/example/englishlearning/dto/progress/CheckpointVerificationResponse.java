package com.example.englishlearning.dto.progress;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CheckpointVerificationResponse {
    private boolean correct;
    private String message;
    private String explanation;
}
