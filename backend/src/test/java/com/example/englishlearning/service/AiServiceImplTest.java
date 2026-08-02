package com.example.englishlearning.service;

import com.example.englishlearning.ai.AiPromptRequest;
import com.example.englishlearning.ai.AiProviderResult;
import com.example.englishlearning.ai.FallbackAiProvider;
import com.example.englishlearning.ai.OpenAiProvider;
import com.example.englishlearning.dto.ai.AiChatRequest;
import com.example.englishlearning.dto.ai.AiChatResponse;
import com.example.englishlearning.entity.AiConversation;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.repository.AiConversationRepository;
import com.example.englishlearning.repository.AiMessageRepository;
import com.example.englishlearning.repository.AiUsageLogRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.repository.WritingSubmissionRepository;
import com.example.englishlearning.service.impl.AiServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiServiceImplTest {

    @Mock
    private OpenAiProvider openAiProvider;

    @Mock
    private FallbackAiProvider fallbackAiProvider;

    @Mock
    private AiConversationRepository conversationRepository;

    @Mock
    private AiMessageRepository messageRepository;

    @Mock
    private WritingSubmissionRepository writingRepository;

    @Mock
    private AiUsageLogRepository usageLogRepository;

    @Mock
    private UserRepository userRepository;

    private AiServiceImpl aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiServiceImpl(
                openAiProvider,
                fallbackAiProvider,
                conversationRepository,
                messageRepository,
                writingRepository,
                usageLogRepository,
                userRepository,
                new ObjectMapper(),
                50,
                true
        );
    }

    @Test
    void testChat_Success_OpenAi() {
        // Arrange
        String email = "test@example.com";
        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        AiChatRequest request = new AiChatRequest();
        request.setMessage("Hello");

        AiProviderResult mockResult = AiProviderResult.builder()
                .text("Hi there!")
                .promptTokens(10)
                .completionTokens(5)
                .totalTokens(15)
                .fallback(false)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(email)).thenReturn(Optional.of(user));
        when(openAiProvider.isAvailable()).thenReturn(true);
        when(openAiProvider.name()).thenReturn("openai");
        when(openAiProvider.chat(any(AiPromptRequest.class))).thenReturn(mockResult);
        when(conversationRepository.save(any(AiConversation.class))).thenAnswer(i -> {
            AiConversation c = i.getArgument(0);
            c.setId(100L);
            return c;
        });

        // Act
        AiChatResponse response = aiService.chat(email, request);

        // Assert
        assertNotNull(response);
        assertEquals("Hi there!", response.getReply());
        assertEquals("openai", response.getProvider());
        assertFalse(response.isFallback());
        
        verify(messageRepository, times(2)).save(any());
        verify(usageLogRepository, times(1)).save(any());
    }

    @Test
    void testChat_Fallback_WhenOpenAiFails() {
        // Arrange
        String email = "test@example.com";
        User user = new User();
        user.setId(1L);
        user.setEmail(email);

        AiChatRequest request = new AiChatRequest();
        request.setMessage("Hello");

        AiProviderResult fallbackResult = AiProviderResult.builder()
                .text("Fallback reply")
                .promptTokens(10)
                .completionTokens(5)
                .totalTokens(15)
                .fallback(true)
                .build();

        when(userRepository.findByEmailAndDeletedAtIsNull(email)).thenReturn(Optional.of(user));
        when(openAiProvider.isAvailable()).thenReturn(true);
        when(openAiProvider.chat(any(AiPromptRequest.class))).thenThrow(new BadRequestException("OpenAI error"));
        
        // Mock fallback AI provider behavior
        when(fallbackAiProvider.name()).thenReturn("fallback");
        when(fallbackAiProvider.chat(any(AiPromptRequest.class))).thenReturn(fallbackResult);
        
        when(conversationRepository.save(any(AiConversation.class))).thenAnswer(i -> {
            AiConversation c = i.getArgument(0);
            c.setId(100L);
            return c;
        });

        // Act
        AiChatResponse response = aiService.chat(email, request);

        // Assert
        assertNotNull(response);
        assertEquals("Fallback reply", response.getReply());
        assertEquals("fallback", response.getProvider());
        assertTrue(response.isFallback());
    }
}
