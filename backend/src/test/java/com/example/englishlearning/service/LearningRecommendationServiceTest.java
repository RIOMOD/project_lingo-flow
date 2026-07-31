package com.example.englishlearning.service;

import com.example.englishlearning.dto.progress.LearningRecommendationResponse;
import com.example.englishlearning.dto.assessment.QuestionResponse;
import com.example.englishlearning.entity.Chapter;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.Lesson;
import com.example.englishlearning.entity.Question;
import com.example.englishlearning.entity.TestAttempt;
import com.example.englishlearning.entity.TestQuestion;
import com.example.englishlearning.entity.UserAnswer;
import com.example.englishlearning.repository.QuestionRepository;
import com.example.englishlearning.repository.TestAttemptRepository;
import com.example.englishlearning.repository.TestQuestionRepository;
import com.example.englishlearning.repository.UserAnswerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class LearningRecommendationServiceTest {

    private TestAttemptRepository attemptRepository;
    private UserAnswerRepository answerRepository;
    private QuestionRepository questionRepository;
    private TestQuestionRepository testQuestionRepository;
    private LearningRecommendationService service;

    @BeforeEach
    void setUp() {
        attemptRepository = mock(TestAttemptRepository.class);
        answerRepository = mock(UserAnswerRepository.class);
        questionRepository = mock(QuestionRepository.class);
        testQuestionRepository = mock(TestQuestionRepository.class);
        service = new LearningRecommendationService(
                attemptRepository, answerRepository, questionRepository, testQuestionRepository, new ObjectMapper());
    }

    @Test
    void recommendsWeakTopicAndCountsUnansweredQuestionAsIncorrect() {
        Course course = new Course();
        course.setId(3L);
        course.setTitle("Foundation English");
        Chapter chapter = new Chapter();
        chapter.setCourse(course);
        Lesson lesson = new Lesson();
        lesson.setId(12L);
        lesson.setTitle("Past Simple");
        lesson.setChapter(chapter);

        Question answeredQuestion = question(21L, lesson);
        Question unansweredQuestion = question(22L, lesson);
        com.example.englishlearning.entity.Test test = new com.example.englishlearning.entity.Test();
        test.setId(8L);
        TestAttempt attempt = new TestAttempt();
        attempt.setId(30L);
        attempt.setTest(test);
        attempt.setSubmittedAt(LocalDateTime.now());

        UserAnswer answer = new UserAnswer();
        answer.setQuestion(answeredQuestion);
        answer.setCorrect(true);

        when(attemptRepository.findTop10ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(5L))
                .thenReturn(List.of(attempt));
        when(answerRepository.findByAttemptId(30L)).thenReturn(List.of(answer));
        when(testQuestionRepository.findByTestIdOrderByPositionAsc(8L))
                .thenReturn(List.of(testQuestion(test, answeredQuestion, 1), testQuestion(test, unansweredQuestion, 2)));

        List<LearningRecommendationResponse> result = service.recommendForUser(5L);

        assertEquals(1, result.size());
        LearningRecommendationResponse recommendation = result.getFirst();
        assertEquals(Question.SkillType.GRAMMAR, recommendation.getSkillType());
        assertEquals("Past Simple", recommendation.getTopic());
        assertEquals(new BigDecimal("50.00"), recommendation.getAccuracyPercent());
        assertEquals(1, recommendation.getIncorrectAnswers());
        assertEquals(12L, recommendation.getLessonId());
    }

    @Test
    void doesNotRecommendTopicAtOrAboveTargetAccuracy() {
        Question question = question(21L, null);
        com.example.englishlearning.entity.Test test = new com.example.englishlearning.entity.Test();
        test.setId(8L);
        TestAttempt attempt = new TestAttempt();
        attempt.setId(30L);
        attempt.setTest(test);
        attempt.setSubmittedAt(LocalDateTime.now());
        UserAnswer answer = new UserAnswer();
        answer.setQuestion(question);
        answer.setCorrect(true);

        when(answerRepository.findByAttemptId(30L)).thenReturn(List.of(answer));
        when(testQuestionRepository.findByTestIdOrderByPositionAsc(8L))
                .thenReturn(List.of(testQuestion(test, question, 1)));

        assertTrue(service.recommendForAttempt(attempt).isEmpty());
    }

    @Test
    void returnsEmptyWhenNoAttempts() {
        when(attemptRepository.findTop10ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(5L))
                .thenReturn(List.of());
        assertTrue(service.recommendForUser(5L).isEmpty());
    }

    @Test
    void limitsToTop3WeakestGroups() {
        com.example.englishlearning.entity.Test test = new com.example.englishlearning.entity.Test();
        test.setId(8L);
        TestAttempt attempt = new TestAttempt();
        attempt.setId(30L);
        attempt.setTest(test);
        attempt.setSubmittedAt(LocalDateTime.now());

        // Group 1: 20%
        Question q1 = question(1L, null); q1.setSkillType(Question.SkillType.GRAMMAR); q1.setTopic("T1");
        // Group 2: 30%
        Question q2 = question(2L, null); q2.setSkillType(Question.SkillType.GRAMMAR); q2.setTopic("T2");
        // Group 3: 40%
        Question q3 = question(3L, null); q3.setSkillType(Question.SkillType.GRAMMAR); q3.setTopic("T3");
        // Group 4: 50%
        Question q4 = question(4L, null); q4.setSkillType(Question.SkillType.GRAMMAR); q4.setTopic("T4");

        when(attemptRepository.findTop10ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(5L))
                .thenReturn(List.of(attempt));
        
        // Mocking user answers to simulate different percentages would require multiple questions per topic.
        // For simplicity, let's just create multiple attempts or multiple questions.
        // Since we want varying accuracy, let's use 5 questions per group to get 20%, 40%, 60%, etc.
        // Actually, sorting by incorrectAnswers desc also works if accuracy is the same.
        // Let's just create 4 topics with 1 question each, all incorrect (0% accuracy).
        // Sorting will be by incorrectAnswers desc, which is all 1.
        // Let's make them have different number of incorrect answers:
        // T1: 4 incorrect (0% - lowest score, most incorrect)
        // T2: 3 incorrect (0%)
        // T3: 2 incorrect (0%)
        // T4: 1 incorrect (0%)
        
        Question q1a = question(11L, null); q1a.setSkillType(Question.SkillType.GRAMMAR); q1a.setTopic("T1");
        Question q1b = question(12L, null); q1b.setSkillType(Question.SkillType.GRAMMAR); q1b.setTopic("T1");
        Question q1c = question(13L, null); q1c.setSkillType(Question.SkillType.GRAMMAR); q1c.setTopic("T1");
        Question q1d = question(14L, null); q1d.setSkillType(Question.SkillType.GRAMMAR); q1d.setTopic("T1");
        
        Question q2a = question(21L, null); q2a.setSkillType(Question.SkillType.GRAMMAR); q2a.setTopic("T2");
        Question q2b = question(22L, null); q2b.setSkillType(Question.SkillType.GRAMMAR); q2b.setTopic("T2");
        Question q2c = question(23L, null); q2c.setSkillType(Question.SkillType.GRAMMAR); q2c.setTopic("T2");
        
        Question q3a = question(31L, null); q3a.setSkillType(Question.SkillType.GRAMMAR); q3a.setTopic("T3");
        Question q3b = question(32L, null); q3b.setSkillType(Question.SkillType.GRAMMAR); q3b.setTopic("T3");
        
        Question q4a = question(41L, null); q4a.setSkillType(Question.SkillType.GRAMMAR); q4a.setTopic("T4");

        when(testQuestionRepository.findByTestIdOrderByPositionAsc(8L))
                .thenReturn(List.of(
                        testQuestion(test, q1a, 1), testQuestion(test, q1b, 2), testQuestion(test, q1c, 3), testQuestion(test, q1d, 4),
                        testQuestion(test, q2a, 5), testQuestion(test, q2b, 6), testQuestion(test, q2c, 7),
                        testQuestion(test, q3a, 8), testQuestion(test, q3b, 9),
                        testQuestion(test, q4a, 10)
                ));
        // No answers provided -> all incorrect.

        List<LearningRecommendationResponse> result = service.recommendForUser(5L);
        assertEquals(3, result.size());
        assertEquals("T1", result.get(0).getTopic()); // 4 incorrect
        assertEquals("T2", result.get(1).getTopic()); // 3 incorrect
        assertEquals("T3", result.get(2).getTopic()); // 2 incorrect
    }

    @Test
    void handlesMissingQuestionMetadataWithDefaults() {
        Question question = new Question();
        question.setId(1L);
        question.setQuestionType(Question.QuestionType.SINGLE_CHOICE);
        // Missing skillType and topic
        com.example.englishlearning.entity.Test test = new com.example.englishlearning.entity.Test();
        test.setId(8L);
        TestAttempt attempt = new TestAttempt();
        attempt.setId(30L);
        attempt.setTest(test);
        attempt.setSubmittedAt(LocalDateTime.now());

        when(attemptRepository.findTop10ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(5L))
                .thenReturn(List.of(attempt));
        when(testQuestionRepository.findByTestIdOrderByPositionAsc(8L))
                .thenReturn(List.of(testQuestion(test, question, 1)));

        List<LearningRecommendationResponse> result = service.recommendForUser(5L);
        assertEquals(1, result.size());
        assertEquals(Question.SkillType.READING, result.get(0).getSkillType());
        assertEquals("Kiến thức đọc", result.get(0).getTopic());
    }

    @Test
    void differentiatesGroupsWithSameTopicButDifferentSkill() {
        Question q1 = question(1L, null); q1.setSkillType(Question.SkillType.GRAMMAR); q1.setTopic("Past Simple");
        Question q2 = question(2L, null); q2.setSkillType(Question.SkillType.READING); q2.setTopic("Past Simple");
        
        com.example.englishlearning.entity.Test test = new com.example.englishlearning.entity.Test();
        test.setId(8L);
        TestAttempt attempt = new TestAttempt();
        attempt.setId(30L);
        attempt.setTest(test);
        attempt.setSubmittedAt(LocalDateTime.now());

        when(attemptRepository.findTop10ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(5L))
                .thenReturn(List.of(attempt));
        when(testQuestionRepository.findByTestIdOrderByPositionAsc(8L))
                .thenReturn(List.of(testQuestion(test, q1, 1), testQuestion(test, q2, 2)));

        List<LearningRecommendationResponse> result = service.recommendForUser(5L);
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(r -> r.getSkillType() == Question.SkillType.GRAMMAR));
        assertTrue(result.stream().anyMatch(r -> r.getSkillType() == Question.SkillType.READING));
    }

    @Test
    void usesAttemptSnapshotMetadataWhenLiveQuestionWasEdited() throws Exception {
        Question liveQuestion = question(51L, null);
        liveQuestion.setSkillType(Question.SkillType.VOCABULARY);
        liveQuestion.setTopic("Edited topic");
        com.example.englishlearning.entity.Test test = new com.example.englishlearning.entity.Test();
        test.setId(9L);
        TestAttempt attempt = new TestAttempt();
        attempt.setId(31L);
        attempt.setTest(test);
        attempt.setSubmittedAt(LocalDateTime.now());

        QuestionResponse snapshot = QuestionResponse.builder()
                .id(51L)
                .questionType(Question.QuestionType.SINGLE_CHOICE)
                .skillType(Question.SkillType.GRAMMAR)
                .topic("Past Simple")
                .recommendedLessonId(12L)
                .recommendedLessonTitle("Past Simple review")
                .build();
        attempt.setTestSnapshot(new ObjectMapper().writeValueAsString(List.of(snapshot)));

        when(attemptRepository.findTop10ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(5L))
                .thenReturn(List.of(attempt));
        when(testQuestionRepository.findByTestIdOrderByPositionAsc(9L))
                .thenReturn(List.of(testQuestion(test, liveQuestion, 1)));

        List<LearningRecommendationResponse> result = service.recommendForUser(5L);

        assertEquals(1, result.size());
        assertEquals(Question.SkillType.GRAMMAR, result.getFirst().getSkillType());
        assertEquals("Past Simple", result.getFirst().getTopic());
        assertEquals(12L, result.getFirst().getLessonId());
    }

    private Question question(Long id, Lesson lesson) {
        Question question = new Question();
        question.setId(id);
        question.setQuestionType(Question.QuestionType.FILL_IN_THE_BLANK);
        question.setSkillType(Question.SkillType.GRAMMAR);
        question.setTopic("Past Simple");
        question.setRecommendedLesson(lesson);
        return question;
    }

    private TestQuestion testQuestion(com.example.englishlearning.entity.Test test, Question question, int position) {
        TestQuestion item = new TestQuestion();
        item.setTest(test);
        item.setQuestion(question);
        item.setPosition(position);
        return item;
    }
}
