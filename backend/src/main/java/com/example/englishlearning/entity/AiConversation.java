package com.example.englishlearning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "ai_conversations")
public class AiConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 200)
    private String title;

    @jakarta.persistence.Convert(converter = ConversationTypeConverter.class)
    @Column(name = "conversation_type", nullable = false)
    private ConversationType conversationType = ConversationType.CHATBOT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ConversationType {
        CHATBOT,
        WRITING_ASSISTANT
    }

    @jakarta.persistence.Converter
    public static class ConversationTypeConverter implements jakarta.persistence.AttributeConverter<ConversationType, String> {
        @Override
        public String convertToDatabaseColumn(ConversationType attribute) {
            return attribute == null ? ConversationType.CHATBOT.name() : attribute.name();
        }

        @Override
        public ConversationType convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) return ConversationType.CHATBOT;
            String trimmed = dbData.trim();
            if ("0".equals(trimmed) || "1".equals(trimmed) || "CHATBOT".equalsIgnoreCase(trimmed)) {
                return ConversationType.CHATBOT;
            }
            if ("2".equals(trimmed) || "WRITING_ASSISTANT".equalsIgnoreCase(trimmed)) {
                return ConversationType.WRITING_ASSISTANT;
            }
            try {
                return ConversationType.valueOf(trimmed.toUpperCase());
            } catch (Exception e) {
                return ConversationType.CHATBOT;
            }
        }
    }
}
