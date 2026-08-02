package com.example.englishlearning.ai;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AiPromptRequest {
    private String topic;
    private String level;
    private String userText;
    private String systemInstruction;
    private String taskPrompt;
    private String contextText;
    private String guidanceMode;
    private List<AiPromptMessage> history;
}
