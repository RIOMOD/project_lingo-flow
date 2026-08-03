package com.example.englishlearning.ai;

import com.example.englishlearning.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.ResourceAccessException;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class OpenAiProvider implements AiProvider {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String baseUrl;
    private final String model;
    private final int maxRetries;

    public OpenAiProvider(
            ObjectMapper objectMapper,
            @Value("${app.ai.api-key:}") String apiKey,
            @Value("${app.ai.base-url:https://api.openai.com/v1}") String baseUrl,
            @Value("${app.ai.model:}") String model,
            @Value("${app.ai.timeout-seconds:20}") int timeoutSeconds,
            @Value("${app.ai.max-retries:2}") int maxRetries
    ) {
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.model = model;
        this.maxRetries = Math.max(0, maxRetries);
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(timeoutSeconds));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }

    @Override
    public String name() {
        return "openai";
    }

    @Override
    public boolean isAvailable() {
        return configurationError() == null;
    }

    public String configurationError() {
        if (apiKey == null || apiKey.isBlank()) {
            return "OpenAI chưa được cấu hình: backend đang thiếu OPENAI_API_KEY";
        }
        if (model == null || model.isBlank()) {
            return "OpenAI chưa được cấu hình: backend đang thiếu AI_MODEL";
        }
        return null;
    }

    @Override
    public AiProviderResult chat(AiPromptRequest request) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", request.getSystemInstruction()));
        String userContent = """
                Topic: %s
                Level: %s
                Student message: %s
                """.formatted(request.getTopic(), request.getLevel(), request.getUserText());
        messages.add(Map.of("role", "user", "content", userContent));

        JsonNode node = createResponse(messages);
        String text = extractText(node);
        return AiProviderResult.builder()
                .text(text)
                .promptTokens(extractUsage(node, "prompt_tokens"))
                .completionTokens(extractUsage(node, "completion_tokens"))
                .totalTokens(extractUsage(node, "total_tokens"))
                .fallback(false)
                .build();
    }

    @Override
    public WritingProviderResult writingFeedback(AiPromptRequest request) {
        List<Map<String, String>> messages = new ArrayList<>();
        String systemInstruction = """
                Bạn là giáo viên tiếng Anh. Trả về JSON hợp lệ, không markdown.
                Schema:
                {
                  "correctedText": "...",
                  "feedback": "Giải thích lỗi bằng tiếng Việt",
                  "naturalSuggestion": "Câu/bài tự nhiên hơn",
                  "overallScore": 0-10,
                  "grammarScore": 0-10,
                  "vocabularyScore": 0-10,
                  "coherenceScore": 0-10,
                  "taskResponseScore": 0-10,
                  "suggestedLessons": ["..."]
                }""";
        messages.add(Map.of("role", "system", "content", systemInstruction));
        String userContent = """
                Level: %s
                Task prompt: %s
                Student writing:
                %s
                """.formatted(request.getLevel(), request.getTaskPrompt(), request.getUserText());
        messages.add(Map.of("role", "user", "content", userContent));

        JsonNode node = createResponse(messages);
        String jsonText = stripCodeFence(extractText(node));
        try {
            JsonNode data = objectMapper.readTree(jsonText);
            return WritingProviderResult.builder()
                    .correctedText(text(data, "correctedText", request.getUserText()))
                    .feedback(text(data, "feedback", "Không có phản hồi chi tiết."))
                    .naturalSuggestion(text(data, "naturalSuggestion", "Hãy viết rõ ý chính và dùng cụm từ tự nhiên hơn."))
                    .overallScore(decimal(data, "overallScore"))
                    .grammarScore(decimal(data, "grammarScore"))
                    .vocabularyScore(decimal(data, "vocabularyScore"))
                    .coherenceScore(decimal(data, "coherenceScore"))
                    .taskResponseScore(decimal(data, "taskResponseScore"))
                    .suggestedLessons(list(data, "suggestedLessons"))
                    .promptTokens(extractUsage(node, "prompt_tokens"))
                    .completionTokens(extractUsage(node, "completion_tokens"))
                    .totalTokens(extractUsage(node, "total_tokens"))
                    .fallback(false)
                    .build();
        } catch (Exception exception) {
            throw new BadRequestException("AI returned invalid writing feedback");
        }
    }

    private JsonNode createResponse(List<Map<String, String>> messages) {
        if (!isAvailable()) {
            throw new BadRequestException(configurationError());
        }
        RuntimeException lastError = null;
        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                Map<String, Object> body = new LinkedHashMap<>();
                body.put("model", model);
                body.put("messages", messages);
                body.put("max_tokens", 900);
                String path = baseUrl.endsWith("/") ? "chat/completions" : "/chat/completions";
                String response = restClient.post()
                        .uri(path)
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + apiKey)
                        .body(body)
                        .retrieve()
                        .body(String.class);
                if (response == null || response.isBlank()) {
                    throw new BadRequestException("AI returned an empty response");
                }
                return objectMapper.readTree(response);
            } catch (RestClientResponseException exception) {
                int status = exception.getStatusCode().value();
                lastError = new BadRequestException(openAiErrorMessage(status));
                if (!isRetryableStatus(status) || attempt == maxRetries) throw lastError;
                backoff(attempt);
            } catch (ResourceAccessException exception) {
                lastError = new BadRequestException("AI connection failed or timed out");
                if (attempt == maxRetries) throw lastError;
                backoff(attempt);
            } catch (BadRequestException exception) {
                throw exception;
            } catch (Exception exception) {
                throw new BadRequestException("AI returned an invalid response");
            }
        }
        throw lastError == null ? new BadRequestException("AI provider error") : lastError;
    }

    private String extractText(JsonNode node) {
        JsonNode choices = node.path("choices");
        if (choices.isArray() && !choices.isEmpty()) {
            JsonNode message = choices.get(0).path("message");
            if (message.has("content")) {
                return message.path("content").asText().trim();
            }
        }
        throw new BadRequestException("AI response does not contain output text");
    }

    private boolean isRetryableStatus(int status) {
        return status == 429 || status >= 500;
    }

    private String openAiErrorMessage(int status) {
        return switch (status) {
            case 400 -> "OpenAI rejected the request or model configuration";
            case 401 -> "OpenAI API key is invalid";
            case 403 -> "OpenAI access is forbidden for this project or model";
            case 429 -> "OpenAI rate limit or quota was exceeded";
            default -> status >= 500 ? "OpenAI service is temporarily unavailable" : "OpenAI request failed with HTTP " + status;
        };
    }

    private void backoff(int attempt) {
        try {
            Thread.sleep(Math.min(4_000L, 250L * (1L << Math.min(attempt, 4))));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("OpenAI retry was interrupted");
        }
    }

    private Integer extractUsage(JsonNode node, String field) {
        JsonNode value = node.path("usage").path(field);
        return value.isNumber() ? value.asInt() : 0;
    }

    private String stripCodeFence(String text) {
        if (text == null) return "{}";
        return text.replaceFirst("^```json\\s*", "").replaceFirst("^```\\s*", "").replaceFirst("\\s*```$", "").trim();
    }

    private String text(JsonNode node, String field, String defaultValue) {
        JsonNode value = node.path(field);
        return value.isTextual() ? value.asText() : defaultValue;
    }

    private BigDecimal decimal(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isNumber() ? BigDecimal.valueOf(value.asDouble()).setScale(2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private List<String> list(JsonNode node, String field) {
        JsonNode values = node.path(field);
        List<String> result = new ArrayList<>();
        if (values.isArray()) {
            values.forEach(item -> {
                if (item.isTextual()) result.add(item.asText());
            });
        }
        return result;
    }
}
