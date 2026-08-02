package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.ai.AiLearningContextRequest;
import com.example.englishlearning.dto.assessment.AttemptResponse;
import com.example.englishlearning.dto.assessment.OptionResponse;
import com.example.englishlearning.dto.assessment.QuestionResponse;
import com.example.englishlearning.dto.course.LessonResponse;
import com.example.englishlearning.dto.grammar.GrammarQuestionOptionResponse;
import com.example.englishlearning.dto.grammar.GrammarQuestionResponse;
import com.example.englishlearning.entity.TestAttempt;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.service.AssessmentService;
import com.example.englishlearning.service.CourseService;
import com.example.englishlearning.service.GrammarService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class AiLearningContextResolver {

    public static final String FREE_CHAT = "FREE_CHAT";
    public static final String HINT_ONLY = "HINT_ONLY";
    public static final String FULL_EXPLANATION = "FULL_EXPLANATION";

    private final CourseService courseService;
    private final AssessmentService assessmentService;
    private final GrammarService grammarService;

    public AiLearningContextResolver(
            CourseService courseService,
            AssessmentService assessmentService,
            GrammarService grammarService
    ) {
        this.courseService = courseService;
        this.assessmentService = assessmentService;
        this.grammarService = grammarService;
    }

    public ResolvedContext resolve(String email, AiLearningContextRequest request) {
        if (request == null || request.getType() == null || request.getType().isBlank()) {
            return new ResolvedContext(FREE_CHAT, "Không có bài học hoặc bài tập đang hoạt động.");
        }

        return switch (request.getType().trim().toUpperCase(Locale.ROOT)) {
            case "LESSON" -> resolveLesson(email, request);
            case "ASSESSMENT" -> resolveAssessment(email, request);
            case "GRAMMAR" -> resolveGrammar(request);
            default -> new ResolvedContext(FREE_CHAT, "Không có bài học hoặc bài tập đang hoạt động.");
        };
    }

    private ResolvedContext resolveLesson(String email, AiLearningContextRequest request) {
        if (request.getCourseId() == null || request.getLessonId() == null) {
            throw new BadRequestException("Course and lesson are required for lesson context");
        }
        LessonResponse lesson = courseService.getLesson(request.getCourseId(), request.getLessonId(), email);
        if (Boolean.TRUE.equals(lesson.getLocked())) {
            throw new BadRequestException("Lesson context is locked");
        }

        boolean completed = "COMPLETED".equalsIgnoreCase(lesson.getProgressStatus());
        StringBuilder text = new StringBuilder()
                .append("Loại ngữ cảnh: bài học\n")
                .append("Tiêu đề: ").append(safe(lesson.getTitle())).append("\n")
                .append("Loại bài: ").append(lesson.getLessonType()).append("\n")
                .append("Trạng thái: ").append(completed ? "đã hoàn thành" : "đang học").append("\n")
                .append("Nội dung bài học:\n").append(truncate(lesson.getContent(), 8_000));

        if (lesson.getCheckpointQuestion() != null && !lesson.getCheckpointQuestion().isBlank()) {
            text.append("\nCâu hỏi checkpoint hiện tại: ").append(lesson.getCheckpointQuestion());
        }
        if (completed) {
            text.append("\nĐáp án checkpoint: ").append(safe(lesson.getCheckpointAnswer()))
                    .append("\nGiải thích checkpoint: ").append(safe(lesson.getCheckpointExplanation()));
        }
        return new ResolvedContext(completed ? FULL_EXPLANATION : HINT_ONLY, text.toString());
    }

    private ResolvedContext resolveAssessment(String email, AiLearningContextRequest request) {
        if (request.getAttemptId() == null || request.getQuestionId() == null) {
            throw new BadRequestException("Attempt and question are required for assessment context");
        }
        AttemptResponse attempt = assessmentService.getAttempt(email, request.getAttemptId());
        QuestionResponse question = attempt.getQuestions() == null ? null : attempt.getQuestions().stream()
                .filter(item -> request.getQuestionId().equals(item.getId()))
                .findFirst()
                .orElse(null);
        if (question == null) {
            throw new BadRequestException("Question does not belong to this attempt");
        }

        boolean submitted = attempt.getStatus() != TestAttempt.AttemptStatus.IN_PROGRESS;
        StringBuilder text = new StringBuilder()
                .append("Loại ngữ cảnh: bài tập hoặc bài kiểm tra\n")
                .append("Tên bài: ").append(safe(attempt.getTitle())).append("\n")
                .append("Trạng thái: ").append(submitted ? "đã nộp" : "chưa nộp").append("\n")
                .append("Câu hỏi hiện tại: ").append(safe(question.getQuestionText())).append("\n")
                .append("Các lựa chọn:\n");

        List<OptionResponse> options = question.getOptions() == null ? List.of() : question.getOptions();
        for (int index = 0; index < options.size(); index++) {
            OptionResponse option = options.get(index);
            text.append(index + 1).append(". ").append(safe(option.getOptionText()));
            if (submitted && Boolean.TRUE.equals(option.getCorrect())) text.append(" [đáp án đúng]");
            text.append("\n");
        }
        if (submitted) {
            text.append("Đáp án dạng văn bản: ").append(safe(question.getCorrectAnswer())).append("\n")
                    .append("Giải thích: ").append(safe(question.getExplanation()));
        }
        return new ResolvedContext(submitted ? FULL_EXPLANATION : HINT_ONLY, text.toString());
    }

    private ResolvedContext resolveGrammar(AiLearningContextRequest request) {
        if (request.getGrammarTopicId() == null || request.getQuestionId() == null) {
            throw new BadRequestException("Grammar topic and question are required for grammar context");
        }
        GrammarQuestionResponse question = grammarService.getQuestionsByTopicForStudent(request.getGrammarTopicId())
                .stream()
                .filter(item -> request.getQuestionId().equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Grammar question was not found"));

        StringBuilder text = new StringBuilder()
                .append("Loại ngữ cảnh: bài tập ngữ pháp\n")
                .append("Trạng thái: chưa nộp\n")
                .append("Câu hỏi hiện tại: ").append(safe(question.getQuestionText())).append("\n")
                .append("Các lựa chọn:\n");
        List<GrammarQuestionOptionResponse> options = question.getOptions() == null ? List.of() : question.getOptions();
        for (int index = 0; index < options.size(); index++) {
            text.append(index + 1).append(". ").append(safe(options.get(index).getOptionText())).append("\n");
        }
        return new ResolvedContext(HINT_ONLY, text.toString());
    }

    private String safe(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return "";
        return value.length() <= maxLength ? value : value.substring(0, maxLength) + "…";
    }

    public record ResolvedContext(String guidanceMode, String contextText) {
    }
}
