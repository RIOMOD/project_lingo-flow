package com.example.englishlearning.controller;

import com.example.englishlearning.dto.ai.AiChatRequest;
import com.example.englishlearning.dto.ai.AiChatResponse;
import com.example.englishlearning.dto.ai.AiConversationResponse;
import com.example.englishlearning.dto.ai.AiUsageResponse;
import com.example.englishlearning.dto.ai.WritingFeedbackRequest;
import com.example.englishlearning.dto.ai.WritingFeedbackResponse;
import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.service.AiService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ApiResponse<AiChatResponse> chat(
            Authentication authentication,
            @Valid @RequestBody AiChatRequest request
    ) {
        return ApiResponse.success("AI response generated", aiService.chat(authentication.getName(), request));
    }

    @GetMapping("/conversations")
    public ApiResponse<List<AiConversationResponse>> getConversations(Authentication authentication) {
        return ApiResponse.success(aiService.getConversations(authentication.getName()));
    }

    @GetMapping("/conversations/{id}")
    public ApiResponse<AiConversationResponse> getConversation(
            Authentication authentication,
            @PathVariable Long id
    ) {
        return ApiResponse.success(aiService.getConversation(authentication.getName(), id));
    }

    @PostMapping("/writing-feedback")
    public ApiResponse<WritingFeedbackResponse> writingFeedback(
            Authentication authentication,
            @Valid @RequestBody WritingFeedbackRequest request
    ) {
        return ApiResponse.success("Writing feedback generated", aiService.writingFeedback(authentication.getName(), request));
    }

    @DeleteMapping("/conversations/{id}")
    public ApiResponse<Void> deleteConversation(Authentication authentication, @PathVariable Long id) {
        aiService.deleteConversation(authentication.getName(), id);
        return ApiResponse.success("Conversation deleted", null);
    }

    @GetMapping("/usage")
    public ApiResponse<AiUsageResponse> getUsage(Authentication authentication) {
        return ApiResponse.success(aiService.getUsage(authentication.getName()));
    }
}
