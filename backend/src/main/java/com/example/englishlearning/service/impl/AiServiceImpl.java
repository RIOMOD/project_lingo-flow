package com.example.englishlearning.service.impl;

import com.example.englishlearning.ai.AiPromptRequest;
import com.example.englishlearning.ai.AiProviderResult;
import com.example.englishlearning.ai.FallbackAiProvider;
import com.example.englishlearning.ai.OpenAiProvider;
import com.example.englishlearning.ai.WritingProviderResult;
import com.example.englishlearning.dto.ai.AiChatRequest;
import com.example.englishlearning.dto.ai.AiChatResponse;
import com.example.englishlearning.dto.ai.AiConversationResponse;
import com.example.englishlearning.dto.ai.AiMessageResponse;
import com.example.englishlearning.dto.ai.AiUsageResponse;
import com.example.englishlearning.dto.ai.AiUsageSummaryResponse;
import com.example.englishlearning.dto.ai.WritingFeedbackRequest;
import com.example.englishlearning.dto.ai.WritingFeedbackResponse;
import com.example.englishlearning.entity.AiConversation;
import com.example.englishlearning.entity.AiMessage;
import com.example.englishlearning.entity.AiUsageLog;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.entity.WritingSubmission;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.exception.UnauthorizedException;
import com.example.englishlearning.repository.AiConversationRepository;
import com.example.englishlearning.repository.AiMessageRepository;
import com.example.englishlearning.repository.AiUsageLogRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.repository.WritingSubmissionRepository;
import com.example.englishlearning.service.AiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AiServiceImpl implements AiService {

    private final OpenAiProvider openAiProvider;
    private final FallbackAiProvider fallbackAiProvider;
    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final WritingSubmissionRepository writingRepository;
    private final AiUsageLogRepository usageLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final String provider;
    private final int dailyUsageLimit;
    private final boolean fallbackEnabled;

    public AiServiceImpl(
            OpenAiProvider openAiProvider,
            FallbackAiProvider fallbackAiProvider,
            AiConversationRepository conversationRepository,
            AiMessageRepository messageRepository,
            WritingSubmissionRepository writingRepository,
            AiUsageLogRepository usageLogRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper,
            @Value("${app.ai.provider:openai}") String provider,
            @Value("${app.ai.daily-usage-limit:50}") int dailyUsageLimit,
            @Value("${app.ai.fallback-enabled:true}") boolean fallbackEnabled
    ) {
        this.openAiProvider = openAiProvider;
        this.fallbackAiProvider = fallbackAiProvider;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.writingRepository = writingRepository;
        this.usageLogRepository = usageLogRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.provider = provider == null ? "openai" : provider.trim();
        this.dailyUsageLimit = dailyUsageLimit;
        this.fallbackEnabled = fallbackEnabled;
    }

    @Override
    public AiChatResponse chat(String email, AiChatRequest request) {
        User user = getUser(email);
        ensureUsageLimit(user);
        AiConversation conversation = resolveConversation(user, request);
        AiMessage userMessage = saveMessage(conversation, AiMessage.Sender.USER, request.getMessage(), estimateTokens(request.getMessage()));
        AiPromptRequest prompt = AiPromptRequest.builder()
                .topic(defaultValue(request.getTopic(), "daily communication"))
                .level(defaultValue(request.getLevel(), "A2"))
                .userText(request.getMessage())
                .systemInstruction("""
                        Bạn là trợ lý học tiếng Anh thông minh.
                        Trả lời bằng tiếng Việt dễ hiểu, có ví dụ tiếng Anh ngắn.
                        Nếu người học viết sai câu, hãy sửa câu, giải thích lỗi và gợi ý câu tự nhiên hơn.
                        """)
                .build();
        AiProviderResult result = callChatProvider(prompt);
        saveMessage(conversation, AiMessage.Sender.AI, result.getText(), result.getCompletionTokens());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        saveUsage(user, "CHATBOT", result, result.isFallback() ? fallbackAiProvider.name() : openAiProvider.name());
        return AiChatResponse.builder()
                .conversationId(conversation.getId())
                .reply(result.getText())
                .provider(result.isFallback() ? fallbackAiProvider.name() : openAiProvider.name())
                .totalTokens(result.getTotalTokens())
                .fallback(result.isFallback())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiConversationResponse> getConversations(String email) {
        User user = getUser(email);
        return conversationRepository.findByUserIdAndDeletedAtIsNullOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(conversation -> toConversationResponse(conversation, false))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AiConversationResponse getConversation(String email, Long id) {
        User user = getUser(email);
        AiConversation conversation = conversationRepository.findByIdAndUserIdAndDeletedAtIsNull(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("AI conversation not found"));
        return toConversationResponse(conversation, true);
    }

    @Override
    public void deleteConversation(String email, Long id) {
        User user = getUser(email);
        AiConversation conversation = conversationRepository.findByIdAndUserIdAndDeletedAtIsNull(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("AI conversation not found"));
        conversation.setDeletedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
    }

    @Override
    public WritingFeedbackResponse writingFeedback(String email, WritingFeedbackRequest request) {
        User user = getUser(email);
        ensureUsageLimit(user);
        WritingSubmission submission = new WritingSubmission();
        submission.setUser(user);
        submission.setTitle(defaultValue(request.getTitle(), "Writing feedback"));
        submission.setOriginalText(request.getText());
        submission.setStatus(WritingSubmission.SubmissionStatus.PENDING);
        writingRepository.save(submission);

        AiPromptRequest prompt = AiPromptRequest.builder()
                .level(defaultValue(request.getLevel(), "B1"))
                .taskPrompt(defaultValue(request.getTaskPrompt(), "General writing practice"))
                .userText(request.getText())
                .build();
        WritingProviderResult result = callWritingProvider(prompt);
        applyWritingResult(submission, result);
        writingRepository.save(submission);
        saveUsage(user, "WRITING_FEEDBACK", result, result.isFallback() ? fallbackAiProvider.name() : openAiProvider.name());
        return toWritingResponse(submission, result.isFallback() ? fallbackAiProvider.name() : openAiProvider.name(), result.getTotalTokens(), result.isFallback());
    }

    @Override
    @Transactional(readOnly = true)
    public AiUsageResponse getUsage(String email) {
        User user = getUser(email);
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        long used = usageLogRepository.countByUserIdAndCreatedAtBetween(user.getId(), start, end);
        List<AiUsageSummaryResponse> logs = usageLogRepository
                .findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(user.getId(), start, end)
                .stream()
                .map(this::toUsageSummary)
                .toList();
        return AiUsageResponse.builder()
                .usedToday(used)
                .dailyLimit(dailyUsageLimit)
                .remainingToday(Math.max(0, dailyUsageLimit - used))
                .recentLogs(logs)
                .build();
    }

    private AiConversation resolveConversation(User user, AiChatRequest request) {
        if (request.getConversationId() != null) {
            return conversationRepository.findByIdAndUserIdAndDeletedAtIsNull(request.getConversationId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("AI conversation not found"));
        }
        AiConversation conversation = new AiConversation();
        conversation.setUser(user);
        conversation.setConversationType(AiConversation.ConversationType.CHATBOT);
        conversation.setTitle(titleFrom(request.getTopic(), request.getMessage()));
        return conversationRepository.save(conversation);
    }

    private AiProviderResult callChatProvider(AiPromptRequest prompt) {
        if ("fallback".equalsIgnoreCase(provider)) {
            return fallbackAiProvider.chat(prompt);
        }
        try {
            if (openAiProvider.isAvailable()) {
                return openAiProvider.chat(prompt);
            }
            throw new BadRequestException(openAiProvider.configurationError());
        } catch (RuntimeException exception) {
            if (!fallbackEnabled) throw exception;
            return fallbackAiProvider.chat(prompt);
        }
    }

    private WritingProviderResult callWritingProvider(AiPromptRequest prompt) {
        if ("fallback".equalsIgnoreCase(provider)) {
            return fallbackAiProvider.writingFeedback(prompt);
        }
        try {
            if (openAiProvider.isAvailable()) {
                return openAiProvider.writingFeedback(prompt);
            }
            throw new BadRequestException(openAiProvider.configurationError());
        } catch (RuntimeException exception) {
            if (!fallbackEnabled) throw exception;
            return fallbackAiProvider.writingFeedback(prompt);
        }
    }

    private void applyWritingResult(WritingSubmission submission, WritingProviderResult result) {
        submission.setCorrectedText(result.getCorrectedText());
        submission.setFeedback(result.getFeedback());
        submission.setNaturalSuggestion(result.getNaturalSuggestion());
        submission.setScore(result.getOverallScore());
        submission.setGrammarScore(result.getGrammarScore());
        submission.setVocabularyScore(result.getVocabularyScore());
        submission.setCoherenceScore(result.getCoherenceScore());
        submission.setTaskResponseScore(result.getTaskResponseScore());
        submission.setSuggestedLessons(toJson(result.getSuggestedLessons()));
        submission.setStatus(WritingSubmission.SubmissionStatus.COMPLETED);
    }

    private AiMessage saveMessage(AiConversation conversation, AiMessage.Sender sender, String text, Integer tokenCount) {
        AiMessage message = new AiMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setMessage(text);
        message.setTokenCount(tokenCount == null ? 0 : tokenCount);
        return messageRepository.save(message);
    }

    private void saveUsage(User user, String feature, AiProviderResult result, String provider) {
        saveUsage(user, feature, provider, result.getPromptTokens(), result.getCompletionTokens(), result.getTotalTokens());
    }

    private void saveUsage(User user, String feature, WritingProviderResult result, String provider) {
        saveUsage(user, feature, provider, result.getPromptTokens(), result.getCompletionTokens(), result.getTotalTokens());
    }

    private void saveUsage(User user, String feature, String provider, Integer promptTokens, Integer completionTokens, Integer totalTokens) {
        AiUsageLog log = new AiUsageLog();
        log.setUser(user);
        log.setFeature(feature);
        log.setProvider(provider);
        log.setPromptTokens(promptTokens == null ? 0 : promptTokens);
        log.setCompletionTokens(completionTokens == null ? 0 : completionTokens);
        log.setTotalTokens(totalTokens == null ? 0 : totalTokens);
        log.setEstimatedCost(BigDecimal.ZERO);
        usageLogRepository.save(log);
    }

    private void ensureUsageLimit(User user) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        long used = usageLogRepository.countByUserIdAndCreatedAtBetween(user.getId(), start, end);
        if (used >= dailyUsageLimit) {
            throw new BadRequestException("Daily AI usage limit reached");
        }
    }

    private AiConversationResponse toConversationResponse(AiConversation conversation, boolean includeMessages) {
        List<AiMessageResponse> messages = includeMessages
                ? messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId()).stream().map(this::toMessageResponse).toList()
                : List.of();
        return AiConversationResponse.builder()
                .id(conversation.getId())
                .title(conversation.getTitle())
                .conversationType(conversation.getConversationType())
                .updatedAt(conversation.getUpdatedAt())
                .messages(messages)
                .build();
    }

    private AiMessageResponse toMessageResponse(AiMessage message) {
        return AiMessageResponse.builder()
                .id(message.getId())
                .sender(message.getSender())
                .message(message.getMessage())
                .tokenCount(message.getTokenCount())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private WritingFeedbackResponse toWritingResponse(WritingSubmission submission, String provider, Integer totalTokens, boolean fallback) {
        return WritingFeedbackResponse.builder()
                .submissionId(submission.getId())
                .correctedText(submission.getCorrectedText())
                .feedback(submission.getFeedback())
                .naturalSuggestion(submission.getNaturalSuggestion())
                .overallScore(submission.getScore())
                .grammarScore(submission.getGrammarScore())
                .vocabularyScore(submission.getVocabularyScore())
                .coherenceScore(submission.getCoherenceScore())
                .taskResponseScore(submission.getTaskResponseScore())
                .suggestedLessons(fromJson(submission.getSuggestedLessons()))
                .provider(provider)
                .totalTokens(totalTokens)
                .fallback(fallback)
                .build();
    }

    private AiUsageSummaryResponse toUsageSummary(AiUsageLog log) {
        return AiUsageSummaryResponse.builder()
                .feature(log.getFeature())
                .provider(log.getProvider())
                .promptTokens(log.getPromptTokens())
                .completionTokens(log.getCompletionTokens())
                .totalTokens(log.getTotalTokens())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private User getUser(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UnauthorizedException("Authentication is required"));
    }

    private String titleFrom(String topic, String message) {
        String source = topic != null && !topic.isBlank() ? topic : message;
        if (source == null || source.isBlank()) return "AI conversation";
        return source.length() <= 80 ? source : source.substring(0, 80);
    }

    private String defaultValue(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    private int estimateTokens(String text) {
        return text == null ? 0 : Math.max(1, text.length() / 4);
    }

    private String toJson(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (JsonProcessingException exception) {
            return "[]";
        }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception exception) {
            return List.of();
        }
    }
}
