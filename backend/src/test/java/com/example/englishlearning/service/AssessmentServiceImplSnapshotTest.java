package com.example.englishlearning.service;

import com.example.englishlearning.dto.assessment.AttemptResponse;
import com.example.englishlearning.dto.assessment.OptionResponse;
import com.example.englishlearning.dto.assessment.QuestionResponse;
import com.example.englishlearning.entity.*;
import com.example.englishlearning.repository.*;
import com.example.englishlearning.service.impl.AssessmentServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceImplSnapshotTest {
    @Mock ExerciseRepository exerciseRepository;
    @Mock QuestionRepository questionRepository;
    @Mock AnswerOptionRepository optionRepository;
    @Mock TestRepository testRepository;
    @Mock TestQuestionRepository testQuestionRepository;
    @Mock TestAttemptRepository attemptRepository;
    @Mock UserAnswerRepository answerRepository;
    @Mock CourseRepository courseRepository;
    @Mock LessonRepository lessonRepository;
    @Mock UserRepository userRepository;
    @Mock CourseOwnershipRepository ownershipRepository;

    @Test
    void gradesMultipleChoiceFromStartSnapshotAfterLiveQuestionChanges() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        AssessmentServiceImpl service = new AssessmentServiceImpl(exerciseRepository, questionRepository, optionRepository,
                testRepository, testQuestionRepository, attemptRepository, answerRepository, courseRepository,
                lessonRepository, userRepository, ownershipRepository, mapper);

        Role role = new Role();
        role.setCode("STUDENT");
        User student = new User();
        student.setId(10L);
        student.setRole(role);
        Question liveQuestion = new Question();
        liveQuestion.setId(20L);
        liveQuestion.setQuestionType(Question.QuestionType.MULTIPLE_CHOICE);
        liveQuestion.setPoints(new BigDecimal("99.00"));
        AnswerOption selectedOne = option(1L, liveQuestion, false);

        QuestionResponse snapshot = QuestionResponse.builder().id(20L)
                .questionType(Question.QuestionType.MULTIPLE_CHOICE).questionText("Pick both")
                .points(new BigDecimal("2.00")).position(1)
                .options(List.of(snapshotOption(1L, true), snapshotOption(2L, true), snapshotOption(3L, false))).build();
        com.example.englishlearning.entity.Test test = new com.example.englishlearning.entity.Test();
        test.setId(30L);
        test.setTitle("Snapshot test");
        TestAttempt attempt = new TestAttempt();
        attempt.setId(40L);
        attempt.setUser(student);
        attempt.setTest(test);
        attempt.setStatus(TestAttempt.AttemptStatus.IN_PROGRESS);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setTestSnapshot(mapper.writeValueAsString(List.of(snapshot)));
        UserAnswer answer = new UserAnswer();
        answer.setAttempt(attempt);
        answer.setQuestion(liveQuestion);
        answer.setSelectedOption(selectedOne);
        answer.setSelectedOptionIds("[1,2]");

        when(userRepository.findByEmailAndDeletedAtIsNull("student@example.com")).thenReturn(Optional.of(student));
        when(attemptRepository.findById(40L)).thenReturn(Optional.of(attempt));
        when(answerRepository.findByAttemptId(40L)).thenReturn(List.of(answer));
        when(attemptRepository.save(attempt)).thenReturn(attempt);

        AttemptResponse response = service.submitAttempt("student@example.com", 40L);

        assertEquals(new BigDecimal("2.00"), response.getScore());
        assertTrue(answer.getCorrect());
        assertEquals(new BigDecimal("2.00"), answer.getPointsEarned());
        verify(answerRepository).save(answer);
    }

    private AnswerOption option(Long id, Question question, boolean correct) {
        AnswerOption option = new AnswerOption();
        option.setId(id);
        option.setQuestion(question);
        option.setCorrect(correct);
        return option;
    }

    private OptionResponse snapshotOption(Long id, boolean correct) {
        return OptionResponse.builder().id(id).optionText("Option " + id).correct(correct).position(id.intValue()).build();
    }
}
