package com.example.englishlearning.ai;

public interface AiProvider {
    String name();
    boolean isAvailable();
    AiProviderResult chat(AiPromptRequest request);
    WritingProviderResult writingFeedback(AiPromptRequest request);
}
