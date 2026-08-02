package com.example.englishlearning.ai;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FallbackAiProviderTest {

    private final FallbackAiProvider provider = new FallbackAiProvider();

    @Test
    void translatesHelloWhenAskedWithDichRaPhrase() {
        String reply = chat("Hello tiếng Anh dịch ra là gì");
        assertTrue(reply.toLowerCase().contains("xin chào"));
        assertFalse(reply.contains("Hello ra"));
    }

    @Test
    void translatesHelloWhenAskedForVietnameseMeaning() {
        String reply = chat("hello nghĩa tiếng Việt là gì");
        assertTrue(reply.toLowerCase().contains("xin chào"));
    }

    @Test
    void doesNotFabricateUnknownFreeFormAnswer() {
        String reply = chat("Hãy phân tích một chủ đề hoàn toàn mới");
        assertTrue(reply.contains("OPENAI_API_KEY"));
    }

    private String chat(String text) {
        return provider.chat(AiPromptRequest.builder()
                        .topic("Free chat")
                        .level("A2")
                        .userText(text)
                        .guidanceMode("FREE_CHAT")
                        .build())
                .getText();
    }
}
