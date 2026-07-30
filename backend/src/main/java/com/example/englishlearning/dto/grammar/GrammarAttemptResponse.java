package com.example.englishlearning.dto.grammar;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GrammarAttemptResponse {
    private Long id;
    private Long topicId;
    private String topicTitle;
    private BigDecimal score; // 0 to 10
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private BigDecimal percentage;
    private String evaluation; // Xuất sắc, Tốt, Đạt, Cần ôn tập
    private LocalDateTime createdAt;
    private List<GrammarAttemptAnswerResponse> answers;
}
