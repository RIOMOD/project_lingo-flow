package com.example.englishlearning.service;

import com.example.englishlearning.dto.progress.LearningRecommendationResponse;
import com.example.englishlearning.dto.assessment.QuestionResponse;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.Exercise;
import com.example.englishlearning.entity.Lesson;
import com.example.englishlearning.entity.Question;
import com.example.englishlearning.entity.TestAttempt;
import com.example.englishlearning.entity.UserAnswer;
import com.example.englishlearning.repository.QuestionRepository;
import com.example.englishlearning.repository.TestAttemptRepository;
import com.example.englishlearning.repository.TestQuestionRepository;
import com.example.englishlearning.repository.UserAnswerRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class LearningRecommendationService {

    private static final BigDecimal TARGET_ACCURACY = new BigDecimal("80.00");
    private static final int MAX_RECOMMENDATIONS = 3;

    private final TestAttemptRepository attemptRepository;
    private final UserAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final TestQuestionRepository testQuestionRepository;
    private final ObjectMapper objectMapper;

    public LearningRecommendationService(
            TestAttemptRepository attemptRepository,
            UserAnswerRepository answerRepository,
            QuestionRepository questionRepository,
            TestQuestionRepository testQuestionRepository,
            ObjectMapper objectMapper
    ) {
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.testQuestionRepository = testQuestionRepository;
        this.objectMapper = objectMapper;
    }

    public List<LearningRecommendationResponse> recommendForUser(Long userId) {
        return buildRecommendations(
                attemptRepository.findTop10ByUserIdAndSubmittedAtIsNotNullOrderBySubmittedAtDesc(userId));
    }

    public List<LearningRecommendationResponse> recommendForAttempt(TestAttempt attempt) {
        if (attempt == null || attempt.getSubmittedAt() == null) {
            return List.of();
        }
        return buildRecommendations(List.of(attempt));
    }

    private List<LearningRecommendationResponse> buildRecommendations(List<TestAttempt> attempts) {
        Map<String, RecommendationStats> grouped = new LinkedHashMap<>();

        for (TestAttempt attempt : attempts) {
            Map<Long, UserAnswer> answers = new HashMap<>();
            Map<Long, Question> liveQuestions = new HashMap<>();
            for (UserAnswer answer : answerRepository.findByAttemptId(attempt.getId())) {
                answers.put(answer.getQuestion().getId(), answer);
                liveQuestions.put(answer.getQuestion().getId(), answer.getQuestion());
            }
            currentQuestionsFor(attempt).forEach(question -> liveQuestions.putIfAbsent(question.getId(), question));

            for (QuestionResponse question : questionsFor(attempt)) {
                Question liveQuestion = liveQuestions.get(question.getId());
                Question.SkillType skill = resolveSkill(question, liveQuestion);
                String topic = resolveTopic(question, skill);
                String key = skill.name() + "::" + topic.toLowerCase(Locale.ROOT);
                RecommendationStats stats = grouped.computeIfAbsent(key,
                        ignored -> new RecommendationStats(skill, topic));
                UserAnswer answer = answers.get(question.getId());
                stats.record(attempt.getId(), Boolean.TRUE.equals(answer == null ? null : answer.getCorrect()),
                        question, liveQuestion);
            }
        }

        return grouped.values().stream()
                .filter(stats -> stats.incorrectAnswers > 0)
                .filter(stats -> stats.accuracy().compareTo(TARGET_ACCURACY) < 0)
                .sorted(Comparator.comparing(RecommendationStats::accuracy)
                        .thenComparing(Comparator.comparingLong(RecommendationStats::incorrectAnswers).reversed()))
                .limit(MAX_RECOMMENDATIONS)
                .map(RecommendationStats::toResponse)
                .toList();
    }

    private List<QuestionResponse> questionsFor(TestAttempt attempt) {
        if (attempt.getTestSnapshot() != null && !attempt.getTestSnapshot().isBlank()) {
            try {
                com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(attempt.getTestSnapshot());
                if (root.isTextual()) {
                    root = objectMapper.readTree(root.textValue());
                }
                return objectMapper.convertValue(root, new TypeReference<List<QuestionResponse>>() {});
            } catch (Exception ignored) {
                // Older malformed snapshots fall back to the current assessment content.
            }
        }
        return currentQuestionsFor(attempt).stream().map(this::toQuestionResponse).toList();
    }

    private List<Question> currentQuestionsFor(TestAttempt attempt) {
        if (attempt.getExercise() != null) {
            return questionRepository.findByExerciseIdAndDeletedAtIsNullOrderByPositionAsc(
                    attempt.getExercise().getId());
        }
        if (attempt.getTest() != null) {
            return testQuestionRepository.findByTestIdOrderByPositionAsc(attempt.getTest().getId()).stream()
                    .map(item -> item.getQuestion())
                    .toList();
        }
        return List.of();
    }

    private QuestionResponse toQuestionResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .exerciseId(question.getExercise() == null ? null : question.getExercise().getId())
                .questionType(question.getQuestionType())
                .skillType(question.getSkillType())
                .topic(question.getTopic())
                .recommendedLessonId(question.getRecommendedLesson() == null ? null : question.getRecommendedLesson().getId())
                .recommendedLessonTitle(question.getRecommendedLesson() == null ? null : question.getRecommendedLesson().getTitle())
                .build();
    }

    private Question.SkillType resolveSkill(QuestionResponse question, Question liveQuestion) {
        if (question.getSkillType() != null && question.getSkillType() != Question.SkillType.MIXED) {
            return question.getSkillType();
        }
        Exercise exercise = liveQuestion == null ? null : liveQuestion.getExercise();
        if (exercise != null && exercise.getExerciseType() != null
                && exercise.getExerciseType() != Exercise.ExerciseType.MIXED) {
            try {
                return Question.SkillType.valueOf(exercise.getExerciseType().name());
            } catch (IllegalArgumentException ignored) {
                // Fall through to question-type inference.
            }
        }
        return switch (question.getQuestionType()) {
            case LISTENING_MULTIPLE_CHOICE -> Question.SkillType.LISTENING;
            case WRITING -> Question.SkillType.WRITING;
            case FILL_IN_THE_BLANK, SENTENCE_ORDERING -> Question.SkillType.GRAMMAR;
            default -> Question.SkillType.READING;
        };
    }

    private String resolveTopic(QuestionResponse question, Question.SkillType skill) {
        if (question.getTopic() != null && !question.getTopic().isBlank()) {
            return question.getTopic().trim();
        }
        return "Kiến thức " + skillLabel(skill).toLowerCase();
    }

    private static String skillLabel(Question.SkillType skill) {
        return switch (skill) {
            case VOCABULARY -> "Từ vựng";
            case GRAMMAR -> "Ngữ pháp";
            case LISTENING -> "Nghe";
            case READING -> "Đọc";
            case WRITING -> "Viết";
            case SPEAKING -> "Nói";
            case PRONUNCIATION -> "Phát âm";
            case MIXED -> "Tổng hợp";
        };
    }

    private static final class RecommendationStats {
        private final Question.SkillType skill;
        private final String topic;
        private final Set<Long> attemptIds = new LinkedHashSet<>();
        private long totalQuestions;
        private long correctAnswers;
        private long incorrectAnswers;
        private Lesson lesson;
        private Exercise exercise;
        private Course course;
        private Long snapshotLessonId;
        private String snapshotLessonTitle;
        private Long snapshotExerciseId;

        private RecommendationStats(Question.SkillType skill, String topic) {
            this.skill = skill;
            this.topic = topic;
        }

        private void record(Long attemptId, boolean correct, QuestionResponse snapshot, Question question) {
            attemptIds.add(attemptId);
            totalQuestions++;
            if (correct) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }

            if (snapshotLessonId == null && snapshot.getRecommendedLessonId() != null) {
                snapshotLessonId = snapshot.getRecommendedLessonId();
                snapshotLessonTitle = snapshot.getRecommendedLessonTitle();
            }
            if (snapshotExerciseId == null) {
                snapshotExerciseId = snapshot.getExerciseId();
            }

            Lesson candidateLesson = question == null ? null : question.getRecommendedLesson();
            if (candidateLesson == null && question != null && question.getExercise() != null) {
                candidateLesson = question.getExercise().getLesson();
            }
            if (lesson == null && candidateLesson != null) {
                lesson = candidateLesson;
            }
            if (exercise == null && question != null && question.getExercise() != null) {
                exercise = question.getExercise();
            }
            if (course == null) {
                if (candidateLesson != null) {
                    course = candidateLesson.getChapter().getCourse();
                } else if (question != null && question.getExercise() != null) {
                    course = question.getExercise().getCourse();
                }
            }
        }

        private long incorrectAnswers() {
            return incorrectAnswers;
        }

        private BigDecimal accuracy() {
            if (totalQuestions == 0) {
                return BigDecimal.ZERO;
            }
            return BigDecimal.valueOf(correctAnswers)
                    .multiply(new BigDecimal("100"))
                    .divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP);
        }

        private LearningRecommendationResponse toResponse() {
            String reason = "Bạn trả lời sai %d/%d câu về %s trong %d lượt làm gần đây."
                    .formatted(incorrectAnswers, totalQuestions, topic, attemptIds.size());
            return LearningRecommendationResponse.builder()
                    .skillType(skill)
                    .skillLabel(skillLabel(skill))
                    .topic(topic)
                    .accuracyPercent(accuracy())
                    .attemptCount(attemptIds.size())
                    .totalQuestions(totalQuestions)
                    .incorrectAnswers(incorrectAnswers)
                    .reason(reason)
                    .courseId(course == null ? null : course.getId())
                    .courseTitle(course == null ? null : course.getTitle())
                    .lessonId(lesson == null ? snapshotLessonId : lesson.getId())
                    .lessonTitle(lesson == null ? snapshotLessonTitle : lesson.getTitle())
                    .exerciseId(exercise == null ? snapshotExerciseId : exercise.getId())
                    .build();
        }
    }
}
