package com.example.englishlearning.ai;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiPromptRequest {
    private String topic;
    private String level;
    private String userText;
    private String systemInstruction;
    private String taskPrompt;
}
