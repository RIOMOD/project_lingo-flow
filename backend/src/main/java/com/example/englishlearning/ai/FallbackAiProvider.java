package com.example.englishlearning.ai;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class FallbackAiProvider implements AiProvider {

    @Override
    public String name() {
        return "fallback";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public AiProviderResult chat(AiPromptRequest request) {
        String topic = blankToDefault(request.getTopic(), "daily English");
        String level = blankToDefault(request.getLevel(), "A2-B1");
        String reply = """
                Mình đang dùng chế độ AI dự phòng vì provider thật chưa sẵn sàng.
                Chủ đề: %s. Level: %s.
                
                Gợi ý luyện tập:
                1. Viết lại câu của bạn ngắn hơn và rõ chủ ngữ, động từ.
                2. Thêm một ví dụ bằng tiếng Anh liên quan đến chủ đề.
                3. Nếu muốn tự nhiên hơn, hãy dùng cụm từ thông dụng thay vì dịch từng chữ.
                
                Câu bạn gửi: "%s"
                """.formatted(topic, level, safeSnippet(request.getUserText()));
        return AiProviderResult.builder()
                .text(reply)
                .promptTokens(estimateTokens(request.getUserText()))
                .completionTokens(estimateTokens(reply))
                .totalTokens(estimateTokens(request.getUserText()) + estimateTokens(reply))
                .fallback(true)
                .build();
    }

    @Override
    public WritingProviderResult writingFeedback(AiPromptRequest request) {
        String text = request.getUserText();
        String corrected = text == null ? "" : text.trim();
        String feedback = """
                Đây là phản hồi dự phòng. Bài viết đã được ghi nhận, nhưng provider AI thật chưa phản hồi.
                Hãy kiểm tra lại thì, mạo từ, sự hòa hợp chủ ngữ - động từ và cách nối ý giữa các câu.
                """;
        String suggestion = "Thử viết câu ngắn hơn, dùng từ nối như however, therefore, firstly và finally để bài tự nhiên hơn.";
        return WritingProviderResult.builder()
                .correctedText(corrected)
                .feedback(feedback)
                .naturalSuggestion(suggestion)
                .overallScore(new BigDecimal("6.00"))
                .grammarScore(new BigDecimal("6.00"))
                .vocabularyScore(new BigDecimal("6.00"))
                .coherenceScore(new BigDecimal("6.00"))
                .taskResponseScore(new BigDecimal("6.00"))
                .suggestedLessons(List.of("Review basic sentence structure", "Practice linking words", "Revise common grammar errors"))
                .promptTokens(estimateTokens(text))
                .completionTokens(estimateTokens(feedback + suggestion))
                .totalTokens(estimateTokens(text) + estimateTokens(feedback + suggestion))
                .fallback(true)
                .build();
    }

    private String blankToDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private String safeSnippet(String value) {
        if (value == null) return "";
        return value.length() <= 300 ? value : value.substring(0, 300);
    }

    private int estimateTokens(String text) {
        return text == null ? 0 : Math.max(1, text.length() / 4);
    }
}
