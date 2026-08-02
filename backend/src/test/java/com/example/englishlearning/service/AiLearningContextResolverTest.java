package com.example.englishlearning.service;

import com.example.englishlearning.dto.ai.AiLearningContextRequest;
import com.example.englishlearning.dto.assessment.AttemptResponse;
import com.example.englishlearning.dto.assessment.OptionResponse;
import com.example.englishlearning.dto.assessment.QuestionResponse;
import com.example.englishlearning.dto.course.LessonResponse;
import com.example.englishlearning.entity.Lesson;
import com.example.englishlearning.entity.TestAttempt;
import com.example.englishlearning.service.impl.AiLearningContextResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiLearningContextResolverTest {

    @Mock private CourseService courseService;
    @Mock private AssessmentService assessmentService;
    @Mock private GrammarService grammarService;

    private AiLearningContextResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new AiLearningContextResolver(courseService, assessmentService, grammarService);
    }

    @Test
    void lessonInProgressUsesHintModeAndDoesNotIncludeAnswer() {
        AiLearningContextRequest request = new AiLearningContextRequest();
        request.setType("LESSON");
        request.setCourseId(1L);
        request.setLessonId(2L);
        when(courseService.getLesson(1L, 2L, "student@example.com")).thenReturn(LessonResponse.builder()
                .id(2L)
                .title("Present perfect")
                .lessonType(Lesson.LessonType.TEXT)
                .content("Lesson content")
                .progressStatus("IN_PROGRESS")
                .checkpointQuestion("Complete the sentence")
                .checkpointAnswer("SECRET ANSWER")
                .checkpointExplanation("SECRET EXPLANATION")
                .locked(false)
                .build());

        var resolved = resolver.resolve("student@example.com", request);

        assertEquals(AiLearningContextResolver.HINT_ONLY, resolved.guidanceMode());
        assertTrue(resolved.contextText().contains("Complete the sentence"));
        assertFalse(resolved.contextText().contains("SECRET ANSWER"));
        assertFalse(resolved.contextText().contains("SECRET EXPLANATION"));
    }

    @Test
    void assessmentInProgressUsesHintModeWithoutCorrectMarker() {
        AiLearningContextRequest request = assessmentRequest();
        when(assessmentService.getAttempt("student@example.com", 20L)).thenReturn(attempt(TestAttempt.AttemptStatus.IN_PROGRESS));

        var resolved = resolver.resolve("student@example.com", request);

        assertEquals(AiLearningContextResolver.HINT_ONLY, resolved.guidanceMode());
        assertFalse(resolved.contextText().contains("[đáp án đúng]"));
        assertFalse(resolved.contextText().contains("SECRET"));
    }

    @Test
    void submittedAssessmentAllowsFullExplanation() {
        AiLearningContextRequest request = assessmentRequest();
        when(assessmentService.getAttempt("student@example.com", 20L)).thenReturn(attempt(TestAttempt.AttemptStatus.SUBMITTED));

        var resolved = resolver.resolve("student@example.com", request);

        assertEquals(AiLearningContextResolver.FULL_EXPLANATION, resolved.guidanceMode());
        assertTrue(resolved.contextText().contains("[đáp án đúng]"));
        assertTrue(resolved.contextText().contains("SECRET EXPLANATION"));
    }

    private AiLearningContextRequest assessmentRequest() {
        AiLearningContextRequest request = new AiLearningContextRequest();
        request.setType("ASSESSMENT");
        request.setAttemptId(20L);
        request.setQuestionId(30L);
        return request;
    }

    private AttemptResponse attempt(TestAttempt.AttemptStatus status) {
        QuestionResponse question = QuestionResponse.builder()
                .id(30L)
                .questionText("Choose the best option")
                .correctAnswer("SECRET")
                .explanation("SECRET EXPLANATION")
                .options(List.of(
                        OptionResponse.builder().id(1L).optionText("Option A").correct(true).build(),
                        OptionResponse.builder().id(2L).optionText("Option B").correct(false).build()
                ))
                .build();
        return AttemptResponse.builder()
                .id(20L)
                .title("Grammar quiz")
                .status(status)
                .questions(List.of(question))
                .build();
    }
}
