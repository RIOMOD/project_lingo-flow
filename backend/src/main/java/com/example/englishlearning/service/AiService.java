package com.example.englishlearning.service;

import com.example.englishlearning.dto.ai.AiChatRequest;
import com.example.englishlearning.dto.ai.AiChatResponse;
import com.example.englishlearning.dto.ai.AiConversationResponse;
import com.example.englishlearning.dto.ai.AiUsageResponse;
import com.example.englishlearning.dto.ai.WritingFeedbackRequest;
import com.example.englishlearning.dto.ai.WritingFeedbackResponse;

import java.util.List;

public interface AiService {
    AiChatResponse chat(String email, AiChatRequest request);
    List<AiConversationResponse> getConversations(String email);
    AiConversationResponse getConversation(String email, Long id);
    void deleteConversation(String email, Long id);
    WritingFeedbackResponse writingFeedback(String email, WritingFeedbackRequest request);
    AiUsageResponse getUsage(String email);
    void submitFeedback(String email, com.example.englishlearning.dto.ai.AiFeedbackSubmitRequest request);
    org.springframework.data.domain.Page<com.example.englishlearning.dto.ai.AiFeedbackResponse> getAdminFeedbacks(String rating, int page, int size);
}
