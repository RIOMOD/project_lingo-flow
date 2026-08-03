package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.assessment.OptionResponse;
import com.example.englishlearning.dto.assessment.QuestionResponse;
import com.example.englishlearning.dto.progress.LearningRecommendationResponse;
import com.example.englishlearning.dto.review.*;
import com.example.englishlearning.entity.*;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.repository.*;
import com.example.englishlearning.service.LearningRecommendationService;
import com.example.englishlearning.service.PersonalizedReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PersonalizedReviewServiceImpl implements PersonalizedReviewService {

    private final UserRepository userRepository;
    private final TestAttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository optionRepository;
    private final UserAnswerRepository answerRepository;
    private final LearningRecommendationService recommendationService;
    private final PersonalizedReviewSessionRepository sessionRepository;
    private final PersonalizedReviewQuestionRepository reviewQuestionRepository;

    public PersonalizedReviewServiceImpl(
            UserRepository userRepository,
            TestAttemptRepository attemptRepository,
            QuestionRepository questionRepository,
            AnswerOptionRepository optionRepository,
            UserAnswerRepository answerRepository,
            LearningRecommendationService recommendationService,
            PersonalizedReviewSessionRepository sessionRepository,
            PersonalizedReviewQuestionRepository reviewQuestionRepository
    ) {
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.answerRepository = answerRepository;
        this.recommendationService = recommendationService;
        this.sessionRepository = sessionRepository;
        this.reviewQuestionRepository = reviewQuestionRepository;
    }

    @Override
    public PersonalizedReviewSessionResponse generateReviewSession(String email, String sourceAttemptIdStr) {
        User user = getUser(email);
        TestAttempt sourceAttempt = null;
        Long sourceAttemptId = parseLongSafe(sourceAttemptIdStr);
        List<LearningRecommendationResponse> recommendations;

        if (sourceAttemptId != null) {
            sourceAttempt = attemptRepository.findById(sourceAttemptId).orElse(null);
        }

        if (sourceAttempt != null) {
            recommendations = recommendationService.recommendForAttempt(sourceAttempt);
        } else {
            recommendations = recommendationService.recommendForUser(user.getId());
        }

        if (recommendations.isEmpty()) {
            // Fallback sample recommendation if no specific weak topic is found
            recommendations = List.of(
                    LearningRecommendationResponse.builder()
                            .skillType(Question.SkillType.GRAMMAR)
                            .skillLabel("Ngữ pháp")
                            .topic("Thì quá khứ đơn (Past Simple)")
                            .accuracyPercent(new BigDecimal("30.00"))
                            .build()
            );
        }

        // Calculate average preAccuracy of top weak topics
        BigDecimal preAccuracySum = BigDecimal.ZERO;
        for (LearningRecommendationResponse rec : recommendations) {
            preAccuracySum = preAccuracySum.add(rec.getAccuracyPercent() == null ? BigDecimal.ZERO : rec.getAccuracyPercent());
        }
        BigDecimal preAccuracy = recommendations.isEmpty() ? new BigDecimal("50.00")
                : preAccuracySum.divide(BigDecimal.valueOf(recommendations.size()), 2, RoundingMode.HALF_UP);

        // Fetch questions for review quiz (Target: 10 questions total)
        int targetTotal = 10;
        Set<Long> alreadyAnsweredQuestionIds = answerRepository.findByAttemptUserId(user.getId()).stream()
                .map(a -> a.getQuestion().getId())
                .collect(Collectors.toSet());

        List<Question> selectedQuestions = new ArrayList<>();
        Set<Long> selectedQuestionIds = new HashSet<>();
        List<PersonalizedReviewQuestion> reviewQuestionEntries = new ArrayList<>();

        PersonalizedReviewSession session = PersonalizedReviewSession.builder()
                .user(user)
                .sourceAttempt(sourceAttempt)
                .totalQuestions(targetTotal)
                .preAccuracy(preAccuracy)
                .status(PersonalizedReviewSession.SessionStatus.IN_PROGRESS)
                .build();

        session = sessionRepository.save(session);

        // Priority 1: Pick all questions the user answered incorrectly in the source attempt
        if (sourceAttempt != null) {
            List<UserAnswer> failedAnswers = answerRepository.findByAttemptId(sourceAttempt.getId()).stream()
                    .filter(ua -> Boolean.FALSE.equals(ua.getCorrect()))
                    .toList();
            for (UserAnswer ua : failedAnswers) {
                Question q = ua.getQuestion();
                if (q != null && !selectedQuestionIds.contains(q.getId())) {
                    selectedQuestions.add(q);
                    selectedQuestionIds.add(q.getId());
                    reviewQuestionEntries.add(PersonalizedReviewQuestion.builder()
                            .session(session)
                            .question(q)
                            .topic(q.getTopic() != null ? q.getTopic() : "Khắc phục câu làm sai")
                            .skillType(q.getSkillType())
                            .weightOrder(1)
                            .build());
                }
            }
        }

        // Priority 2: Add candidate questions matching weak topic recommendations
        int[] weights = {4, 3, 3};
        for (int i = 0; i < recommendations.size() && selectedQuestions.size() < targetTotal; i++) {
            LearningRecommendationResponse rec = recommendations.get(i);
            int needed = Math.min((i < weights.length) ? weights[i] : 2, targetTotal - selectedQuestions.size());

            List<Question> candidates = questionRepository.findAll().stream()
                    .filter(q -> q.getDeletedAt() == null)
                    .filter(q -> matchTopicOrSkill(q, rec.getSkillType(), rec.getTopic()))
                    .filter(q -> !selectedQuestionIds.contains(q.getId()))
                    .sorted(Comparator.comparing((Question q) -> alreadyAnsweredQuestionIds.contains(q.getId())))
                    .limit(needed)
                    .toList();

            for (Question q : candidates) {
                selectedQuestions.add(q);
                selectedQuestionIds.add(q.getId());
                reviewQuestionEntries.add(PersonalizedReviewQuestion.builder()
                        .session(session)
                        .question(q)
                        .topic(rec.getTopic())
                        .skillType(rec.getSkillType())
                        .weightOrder(i + 1)
                        .build());
            }
        }

        // Priority 3: Fill remaining slots up to 10 questions with general practice questions
        if (selectedQuestions.size() < targetTotal) {
            List<Question> fillCandidates = questionRepository.findAll().stream()
                    .filter(q -> q.getDeletedAt() == null)
                    .filter(q -> !selectedQuestionIds.contains(q.getId()))
                    .limit(targetTotal - selectedQuestions.size())
                    .toList();
            for (Question q : fillCandidates) {
                selectedQuestions.add(q);
                selectedQuestionIds.add(q.getId());
                reviewQuestionEntries.add(PersonalizedReviewQuestion.builder()
                        .session(session)
                        .question(q)
                        .topic(q.getTopic() != null ? q.getTopic() : "Ôn tập kiến thức tổng hợp")
                        .skillType(q.getSkillType())
                        .weightOrder(2)
                        .build());
            }
        }

        reviewQuestionRepository.saveAll(reviewQuestionEntries);
        session.setTotalQuestions(selectedQuestions.size());
        sessionRepository.save(session);

        List<String> weakTopics = recommendations.stream()
                .map(r -> r.getSkillLabel() + ": " + r.getTopic())
                .distinct()
                .toList();

        return toSessionResponse(session, selectedQuestions, weakTopics);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonalizedReviewSessionResponse getReviewSession(String email, Long sessionId) {
        User user = getUser(email);
        PersonalizedReviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Review session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to review session");
        }

        List<PersonalizedReviewQuestion> prqs = reviewQuestionRepository.findBySessionIdOrderByIdAsc(sessionId);
        List<Question> questions = prqs.stream().map(PersonalizedReviewQuestion::getQuestion).toList();
        List<String> weakTopics = prqs.stream()
                .map(q -> q.getSkillType() + ": " + q.getTopic())
                .distinct()
                .toList();

        return toSessionResponse(session, questions, weakTopics);
    }

    @Override
    public PersonalizedReviewSubmitResponse submitReviewSession(String email, Long sessionId, PersonalizedReviewSubmitRequest request) {
        User user = getUser(email);
        PersonalizedReviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Review session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to review session");
        }

        List<PersonalizedReviewQuestion> prqs = reviewQuestionRepository.findBySessionIdOrderByIdAsc(sessionId);
        Map<Long, Question> questionMap = prqs.stream()
                .collect(Collectors.toMap(q -> q.getQuestion().getId(), PersonalizedReviewQuestion::getQuestion));

        Map<Long, PersonalizedReviewSubmitRequest.UserAnswerSubmission> userSubmissions = request.getAnswers() == null ? Map.of()
                : request.getAnswers().stream().collect(Collectors.toMap(
                PersonalizedReviewSubmitRequest.UserAnswerSubmission::getQuestionId,
                a -> a,
                (existing, replacement) -> existing
        ));

        int totalQuestions = prqs.size();
        int correctCount = 0;
        List<PersonalizedExplanationResponse> explanations = new ArrayList<>();

        for (PersonalizedReviewQuestion prq : prqs) {
            Question q = prq.getQuestion();
            PersonalizedReviewSubmitRequest.UserAnswerSubmission submission = userSubmissions.get(q.getId());

            List<AnswerOption> options = optionRepository.findByQuestionIdOrderByPositionAsc(q.getId());
            AnswerOption correctOpt = options.stream().filter(o -> Boolean.TRUE.equals(o.getCorrect())).findFirst().orElse(null);

            String selectedOptionText = "(Chưa chọn đáp án)";
            boolean isCorrect = false;

            if (submission != null && submission.getSelectedOptionId() != null) {
                Long selectedId = parseLongSafe(submission.getSelectedOptionId());
                if (!options.isEmpty()) {
                    // Questions with real DB options
                    AnswerOption selectedOpt = options.stream().filter(o -> o.getId().equals(selectedId)).findFirst().orElse(null);
                    if (selectedOpt != null) {
                        selectedOptionText = selectedOpt.getOptionText();
                        isCorrect = Boolean.TRUE.equals(selectedOpt.getCorrect());
                    }
                } else {
                    // Questions using fallback synthetic options: correctOptionId = -(q.getId())
                    long syntheticCorrectId = -(q.getId());
                    String correctText = resolveCorrectText(q);
                    if (selectedId != null && selectedId == syntheticCorrectId) {
                        isCorrect = true;
                        selectedOptionText = correctText;
                    } else if (selectedId != null) {
                        // For distractor options, the text isn't available server-side; show generic
                        selectedOptionText = "Phương án đã chọn (không chính xác)";
                    }
                }
            }

            if (isCorrect) correctCount++;

            // Resolve correct answer text clearly
            String correctAnsText = correctOpt != null
                    ? correctOpt.getOptionText()
                    : resolveCorrectText(q);

            // Build Multi-Tier Explanation
            String source = (q.getExplanation() != null && !q.getExplanation().isBlank()) ? "TEACHER" : "AI_FALLBACK";
            String explanationText = (q.getExplanation() != null && !q.getExplanation().isBlank())
                    ? q.getExplanation()
                    : generateAiExplanationFallback(q, correctOpt);

            String similarExample = generateSimilarExampleFallback(q);

            explanations.add(PersonalizedExplanationResponse.builder()
                    .questionId(q.getId())
                    .questionText(q.getQuestionText())
                    .userSelectedOption(selectedOptionText)
                    .correctAnswer(correctAnsText)
                    .isCorrect(isCorrect)
                    .source(source)
                    .explanation(explanationText)
                    .similarExample(similarExample)
                    .build());
        }

        BigDecimal postAccuracy = totalQuestions > 0
                ? BigDecimal.valueOf(correctCount).multiply(new BigDecimal("100")).divide(BigDecimal.valueOf(totalQuestions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal improvementPercent = postAccuracy.subtract(session.getPreAccuracy() == null ? BigDecimal.ZERO : session.getPreAccuracy());

        String feedbackTag;
        String feedbackLabel;
        String feedbackSummary;

        if (improvementPercent.compareTo(new BigDecimal("30.00")) >= 0 || postAccuracy.compareTo(new BigDecimal("85.00")) >= 0) {
            feedbackTag = "GREAT_IMPROVEMENT";
            feedbackLabel = "Cải thiện xuất sắc 🎉";
            feedbackSummary = "Tuyệt vời! Bạn đã làm chủ được các phần kiến thức còn hổng trước đây.";
        } else if (improvementPercent.compareTo(new BigDecimal("10.00")) >= 0) {
            feedbackTag = "PROGRESSING";
            feedbackLabel = "Có tiến bộ tốt 👍";
            feedbackSummary = "Khả năng làm bài đã cải thiện rõ rệt. Hãy tiếp tục duy trì phong độ!";
        } else {
            feedbackTag = "NEED_MORE_PRACTICE";
            feedbackLabel = "Cần luyện thêm 💪";
            feedbackSummary = "Một số câu hỏi vẫn còn nhầm lẫn. Hãy xem kỹ giải thích và ôn tập lại.";
        }

        session.setPostAccuracy(postAccuracy);
        session.setImprovementPercent(improvementPercent);
        session.setFeedbackTag(feedbackTag);
        session.setStatus(PersonalizedReviewSession.SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        return PersonalizedReviewSubmitResponse.builder()
                .sessionId(session.getId())
                .totalQuestions(totalQuestions)
                .correctCount(correctCount)
                .preAccuracy(session.getPreAccuracy())
                .postAccuracy(postAccuracy)
                .improvementPercent(improvementPercent)
                .feedbackTag(feedbackTag)
                .feedbackLabel(feedbackLabel)
                .feedbackSummary(feedbackSummary)
                .completedAt(session.getCompletedAt())
                .explanations(explanations)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PersonalizedReviewSessionResponse> getMyReviewHistory(String email, Pageable pageable) {
        User user = getUser(email);
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(s -> toSessionResponse(s, List.of(), List.of()));
    }

    private User getUser(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private boolean matchTopicOrSkill(Question q, Question.SkillType skill, String topic) {
        if (q.getSkillType() != null && q.getSkillType() == skill) return true;
        if (q.getTopic() != null && topic != null && q.getTopic().equalsIgnoreCase(topic.trim())) return true;
        return false;
    }

    private Long parseLongSafe(String str) {
        try { return Long.parseLong(str); } catch (Exception e) { return null; }
    }

    private String generateAiExplanationFallback(Question q, AnswerOption correctOpt) {
        String answerStr = correctOpt != null ? correctOpt.getOptionText() : "đáp án chuẩn";
        return "Đáp án đúng là '" + answerStr + "' vì tuân theo cấu trúc ngữ pháp và nghĩa ngữ cảnh chuẩn trong bài học " + (q.getTopic() != null ? q.getTopic() : "tiếng Anh") + ".";
    }

    private String generateSimilarExampleFallback(Question q) {
        String topic = q.getTopic() != null ? q.getTopic() : "Ngữ pháp";
        return "Ví dụ tương tự (" + topic + "): \"Practicing daily helps you remember key concepts faster.\" (Luyện tập hàng ngày giúp bạn nhớ kiến thức nhanh hơn).";
    }

    private PersonalizedReviewSessionResponse toSessionResponse(PersonalizedReviewSession session, List<Question> questions, List<String> weakTopics) {
        List<QuestionResponse> questionDtos = questions.stream().map(this::toQuestionResponse).toList();
        String tag = session.getFeedbackTag();
        String label = "GREAT_IMPROVEMENT".equals(tag) ? "Cải thiện xuất sắc 🎉"
                : "PROGRESSING".equals(tag) ? "Có tiến bộ tốt 👍" : "Cần luyện thêm 💪";

        return PersonalizedReviewSessionResponse.builder()
                .id(session.getId())
                .sourceAttemptId(session.getSourceAttempt() != null ? session.getSourceAttempt().getId() : null)
                .totalQuestions(session.getTotalQuestions())
                .preAccuracy(session.getPreAccuracy())
                .postAccuracy(session.getPostAccuracy())
                .improvementPercent(session.getImprovementPercent())
                .feedbackTag(tag)
                .feedbackLabel(label)
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .completedAt(session.getCompletedAt())
                .questions(questionDtos)
                .weakTopics(weakTopics)
                .build();
    }

    private QuestionResponse toQuestionResponse(Question q) {
        List<AnswerOption> rawOptions = optionRepository.findByQuestionIdOrderByPositionAsc(q.getId());

        // Find the correct option ID before shuffling
        Long correctOptionId = rawOptions.stream()
                .filter(o -> Boolean.TRUE.equals(o.getCorrect()))
                .map(AnswerOption::getId)
                .findFirst()
                .orElse(null);

        // Build option DTOs WITHOUT exposing the correct flag (prevents cheating)
        List<OptionResponse> options = new ArrayList<>(rawOptions.stream()
                .map(o -> OptionResponse.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .position(o.getPosition())
                        .build())
                .toList());

        // If no DB options, use smart fallback
        if (options.isEmpty()) {
            return buildFallbackQuestionResponse(q);
        }

        // Shuffle options so correct answer isn't always in the same position
        Collections.shuffle(options);
        for (int i = 0; i < options.size(); i++) {
            options.set(i, OptionResponse.builder()
                    .id(options.get(i).getId())
                    .optionText(options.get(i).getOptionText())
                    .position(i + 1)
                    .build());
        }

        // Resolve related lesson for "Go to lesson" link
        Lesson lesson = resolveLesson(q);
        String richExp = buildRichExplanation(q, rawOptions.stream()
                .filter(o -> Boolean.TRUE.equals(o.getCorrect())).findFirst().orElse(null));

        return QuestionResponse.builder()
                .id(q.getId())
                .questionType(q.getQuestionType())
                .questionText(q.getQuestionText())
                .skillType(q.getSkillType())
                .topic(q.getTopic())
                .position(q.getPosition())
                .explanation(q.getExplanation())
                .richExplanation(richExp)
                .correctAnswer(q.getCorrectAnswer())
                .correctOptionId(correctOptionId)
                .recommendedLessonId(lesson != null ? lesson.getId() : null)
                .recommendedLessonTitle(lesson != null ? lesson.getTitle() : null)
                .recommendedLessonCourseId(lesson != null && lesson.getChapter() != null && lesson.getChapter().getCourse() != null ? lesson.getChapter().getCourse().getId() : null)
                .recommendedLessonCourseSlug(lesson != null && lesson.getChapter() != null && lesson.getChapter().getCourse() != null ? lesson.getChapter().getCourse().getSlug() : null)
                .options(options)
                .build();
    }

    /**
     * Build a fallback QuestionResponse when the question has no seeded answer_options.
     * Uses correctAnswer + explanation fields to construct meaningful options.
     */
    private QuestionResponse buildFallbackQuestionResponse(Question q) {
        String correctText = resolveCorrectText(q);
        List<String> distractors = buildDistractors(q, correctText);

        long correctId = -(q.getId());

        List<OptionResponse> options = new ArrayList<>();
        options.add(OptionResponse.builder().id(correctId).optionText(correctText).position(1).build());
        for (int i = 0; i < distractors.size(); i++) {
            options.add(OptionResponse.builder()
                    .id(q.getId() * 10L + (i + 2))
                    .optionText(distractors.get(i))
                    .position(i + 2)
                    .build());
        }

        Collections.shuffle(options);
        for (int i = 0; i < options.size(); i++) {
            options.set(i, OptionResponse.builder()
                    .id(options.get(i).getId())
                    .optionText(options.get(i).getOptionText())
                    .position(i + 1)
                    .build());
        }

        Lesson lesson = resolveLesson(q);
        String richExp = buildRichExplanation(q, null);

        return QuestionResponse.builder()
                .id(q.getId())
                .questionType(q.getQuestionType())
                .questionText(q.getQuestionText())
                .skillType(q.getSkillType())
                .topic(q.getTopic())
                .position(q.getPosition())
                .explanation(q.getExplanation())
                .richExplanation(richExp)
                .correctAnswer(correctText)
                .correctOptionId(correctId)
                .recommendedLessonId(lesson != null ? lesson.getId() : null)
                .recommendedLessonTitle(lesson != null ? lesson.getTitle() : null)
                .recommendedLessonCourseId(lesson != null && lesson.getChapter() != null && lesson.getChapter().getCourse() != null ? lesson.getChapter().getCourse().getId() : null)
                .recommendedLessonCourseSlug(lesson != null && lesson.getChapter() != null && lesson.getChapter().getCourse() != null ? lesson.getChapter().getCourse().getSlug() : null)
                .options(options)
                .build();
    }

    /**
     * Resolve the most relevant lesson for a question.
     * Priority: question.recommendedLesson → exercise.lesson
     */
    private Lesson resolveLesson(Question q) {
        if (q.getRecommendedLesson() != null) return q.getRecommendedLesson();
        if (q.getExercise() != null && q.getExercise().getLesson() != null) return q.getExercise().getLesson();
        return null;
    }

    /**
     * Generate a rich, multi-part explanation covering:
     * - The grammar rule / vocabulary rule at play
     * - When & where to use it
     * - A similar example sentence
     */
    private String buildRichExplanation(Question q, AnswerOption correctOpt) {
        String correctText = correctOpt != null ? correctOpt.getOptionText() : resolveCorrectText(q);
        String topic = q.getTopic() != null ? q.getTopic() : "";
        String skill = q.getSkillType() != null ? q.getSkillType().name() : "";
        String qText = q.getQuestionText() != null ? q.getQuestionText().toLowerCase() : "";

        // If the question already has a good explanation, enrich it instead of replacing
        String base = (q.getExplanation() != null && !q.getExplanation().isBlank()) ? q.getExplanation() : null;

        StringBuilder sb = new StringBuilder();

        // ── Rule / Concept ──────────────────────────────────────
        sb.append("📌 Đáp án đúng: ").append(correctText).append("\n\n");

        if (base != null) {
            sb.append("💡 Giải thích: ").append(base).append("\n\n");
        }

        // ── Grammar/Vocab rule based on topic/skill ──────────────
        String rule = buildRuleText(qText, topic, skill, correctText);
        if (rule != null) {
            sb.append("📚 Quy tắc / Kiến thức:\n").append(rule).append("\n\n");
        }

        // ── When to use ──────────────────────────────────────────
        String usage = buildUsageText(qText, topic, skill);
        if (usage != null) {
            sb.append("🕐 Khi nào / Ở đâu dùng:\n").append(usage).append("\n\n");
        }

        // ── Example sentence ──────────────────────────────────────
        String example = buildExampleText(qText, topic, correctText);
        if (example != null) {
            sb.append("✏️ Ví dụ tương tự:\n").append(example);
        }

        return sb.toString().trim();
    }

    private String buildRuleText(String qText, String topic, String skill, String correctText) {
        String t = topic.toLowerCase();
        if (t.contains("present simple") || t.contains("hiện tại đơn")) {
            return "Hiện tại đơn (Present Simple) dùng để diễn đạt thói quen, sự thật hiển nhiên hoặc lịch trình.\n" +
                   "📐 Công thức: S + V(s/es) + O\n" +
                   "👉 Thêm -(s/es) khi chủ ngữ là he/she/it (VD: She walks to school).";
        } else if (t.contains("past simple") || t.contains("quá khứ đơn")) {
            return "Quá khứ đơn (Past Simple) diễn tả hành động đã xảy ra và kết thúc trong quá khứ.\n" +
                   "📐 Công thức: S + V-ed + O (động từ có quy tắc) hoặc S + V2 + O (bất quy tắc)\n" +
                   "👉 Dấu hiệu nhận biết: yesterday, last week, ago, in 2020.";
        } else if (t.contains("present continuous") || t.contains("hiện tại tiếp diễn")) {
            return "Hiện tại tiếp diễn (Present Continuous) diễn tả hành động đang xảy ra lúc nói.\n" +
                   "📐 Công thức: S + am/is/are + V-ing\n" +
                   "⚠️ Không dùng với stative verbs (know, want, need, believe).";
        } else if (t.contains("prepositions of time") || t.contains("giới từ")) {
            return "Giới từ thời gian AT / ON / IN:\n" +
                   "• AT: giờ cụ thể (at 7 a.m., at noon, at night)\n" +
                   "• ON: ngày cụ thể (on Monday, on Christmas Day)\n" +
                   "• IN: tháng, năm, mùa, buổi (in July, in 2025, in the morning)";
        } else if (t.contains("modal") || t.contains("khuyết thiếu") || t.contains("should") || t.contains("must")) {
            return "Động từ khuyết thiếu (Modal Verbs):\n" +
                   "• should: lời khuyên (You should review daily.)\n" +
                   "• must: yêu cầu bắt buộc (You must wear a seatbelt.)\n" +
                   "• must not: điều cấm tuyệt đối (You must not share your password.)\n" +
                   "📐 Công thức: S + modal verb + V nguyên thể";
        } else if (t.contains("would like") || t.contains("polite request") || t.contains("yêu cầu lịch sự")) {
            return "Would like / Could you diễn đạt mong muốn hoặc yêu cầu lịch sự:\n" +
                   "• I would like + noun/to-V (muốn lịch sự)\n" +
                   "• Could you + V...? (nhờ vả lịch sự)\n" +
                   "• Would you mind + V-ing...? (lịch sự hơn, dùng ở ngữ cảnh trang trọng)";
        } else if (qText.contains("antonym") || qText.contains("synonym") || t.contains("vocabulary") || t.contains("từ vựng")) {
            return "Từ đồng nghĩa (synonym) và trái nghĩa (antonym):\n" +
                   "• Antonym của \"" + correctText + "\" là từ mang nghĩa đối lập hoàn toàn.\n" +
                   "• Kỹ thuật ghi nhớ: học theo cặp từ (expand ↔ contract/shrink, increase ↔ decrease).";
        } else if (t.contains("listening") || qText.contains("nghe")) {
            return "Kỹ năng Nghe (Listening):\n" +
                   "• Tập trung vào từ khóa (key words) và ngữ cảnh (context).\n" +
                   "• Đọc câu hỏi trước để biết cần nghe thông tin gì.\n" +
                   "• Loại suy (elimination): loại các đáp án không phù hợp ngữ cảnh.";
        }
        // Generic fallback
        if (skill.equals("GRAMMAR")) {
            return "Áp dụng đúng cấu trúc ngữ pháp phù hợp với ngữ cảnh câu hỏi.";
        } else if (skill.equals("VOCABULARY")) {
            return "Từ vựng tiếng Anh cần được học trong ngữ cảnh (context) để ghi nhớ lâu bền.";
        }
        return null;
    }

    private String buildUsageText(String qText, String topic, String skill) {
        String t = topic.toLowerCase();
        if (t.contains("present simple")) {
            return "Dùng trong câu mô tả lịch sinh hoạt hàng ngày, sự thật khoa học, và thì giờ biểu chính thức (timetables).";
        } else if (t.contains("past simple")) {
            return "Dùng trong câu kể chuyện, tường thuật sự kiện, nhật ký (diary entries).";
        } else if (t.contains("present continuous")) {
            return "Dùng khi mô tả việc đang xảy ra ngay lúc nói, hoặc kế hoạch tương lai đã sắp xếp cố định.";
        } else if (t.contains("modal") || t.contains("should") || t.contains("must")) {
            return "Dùng trong hướng dẫn an toàn, nội quy, lời khuyên sức khỏe, và quy định nơi công cộng.";
        } else if (t.contains("would like") || t.contains("polite")) {
            return "Dùng trong tình huống giao tiếp trang trọng: nhà hàng, khách sạn, cuộc họp, email công việc.";
        } else if (t.contains("prepositions")) {
            return "Dùng trong lịch hẹn, thông báo sự kiện, hội thoại về thời gian biểu.";
        } else if (qText.contains("nghe") || t.contains("listening")) {
            return "Áp dụng ở sân bay, khách sạn, nhà hàng, phương tiện công cộng — các tình huống hội thoại thực tế.";
        }
        return null;
    }

    private String buildExampleText(String qText, String topic, String correctText) {
        String t = topic.toLowerCase();
        if (t.contains("present simple")) return "She takes the bus to work every day. (Cô ấy đi làm bằng xe buýt mỗi ngày.)";
        if (t.contains("past simple"))   return "They visited the museum last Saturday. (Họ đã tham quan bảo tàng thứ Bảy tuần trước.)";
        if (t.contains("present continuous")) return "He is preparing for the presentation right now. (Anh ấy đang chuẩn bị cho buổi thuyết trình ngay bây giờ.)";
        if (t.contains("modal") || t.contains("should")) return "You should practice speaking English every day. (Bạn nên luyện nói tiếng Anh mỗi ngày.)";
        if (t.contains("would like"))    return "I would like a window seat, please. (Cho tôi một ghế cạnh cửa sổ.)";
        if (t.contains("prepositions"))  return "The flight departs at 9 a.m. on Friday in November. (Chuyến bay khởi hành lúc 9 sáng, thứ Sáu, tháng 11.)";
        if (qText.contains("nghe") || qText.contains("subway") || qText.contains("book") || qText.contains("check")) {
            return "(Ngữ cảnh giao tiếp thực tế) — Luyện nghe bằng cách nghe podcast, xem phim có phụ đề tiếng Anh.";
        }
        return null;
    }

    private String resolveCorrectText(Question q) {
        if (q.getCorrectAnswer() != null && !q.getCorrectAnswer().isBlank()) {
            return q.getCorrectAnswer().trim();
        }
        if (q.getExplanation() != null && q.getExplanation().contains("=")) {
            int idx = q.getExplanation().indexOf("=");
            String extracted = q.getExplanation().substring(idx + 1).replace(".", "").trim();
            if (!extracted.isBlank()) return extracted;
        }
        // Last resort: derive from explanation before '='
        if (q.getExplanation() != null && !q.getExplanation().isBlank()) {
            // Explanation often starts with the answer word in quotes
            String exp = q.getExplanation();
            if (exp.startsWith("\"")) {
                int endQuote = exp.indexOf("\"", 1);
                if (endQuote > 1) return exp.substring(1, endQuote);
            }
        }
        return "Đáp án chính xác";
    }

    private List<String> buildDistractors(Question q, String correctText) {
        String qText = q.getQuestionText() != null ? q.getQuestionText().toLowerCase() : "";
        String topic = q.getTopic() != null ? q.getTopic().toLowerCase() : "";

        // Context-aware distractors based on topic or key phrase
        if (qText.contains("đặt phòng") || qText.contains("double room")) {
            return List.of("Đặt phòng đơn cho 1 đêm", "Yêu cầu trả phòng sớm", "Đặt bàn ăn tối");
        } else if (qText.contains("subway") || qText.contains("ga tàu")) {
            return List.of("Trạm xe buýt", "Sân bay", "Bến tàu thủy");
        } else if (qText.contains("check") && qText.contains("bill")) {
            return List.of("Yes, I would like coffee.", "The room is ready.", "I need a taxi.");
        } else if (qText.contains("đồng ý") || qText.contains("sounds great")) {
            return List.of("Sorry, I am busy.", "I do not think so.", "No, thank you.");
        } else if (qText.contains("khởi hành") || qText.contains("departure")) {
            return List.of("Giờ hạ cánh", "Số hiệu chuyến bay", "Hạn cân hành lý");
        } else if (qText.contains("boarding pass")) {
            return List.of("Hộ chiếu", "Tờ khai y tế", "Hóa đơn tiền phòng");
        } else if (qText.contains("round-trip") || qText.contains("khứ hồi")) {
            return List.of("Vé một chiều", "Vé hạng thương gia", "Thẻ thành viên");
        } else if (topic.contains("vocabulary") || topic.contains("từ vựng")) {
            // For vocabulary questions, use related words as distractors
            return generateVocabDistractors(q, correctText);
        } else if (topic.contains("grammar") || topic.contains("ngữ pháp")) {
            return List.of("S + V-ing + Object", "V + S + Complement", "Object + was + V-ed");
        }
        // Generic distractors
        return List.of("Lựa chọn không phù hợp A", "Lựa chọn không phù hợp B", "Lựa chọn không phù hợp C");
    }

    private List<String> generateVocabDistractors(Question q, String correctText) {
        // Generate plausible but wrong vocabulary options by using common English words
        // that might be confused with the correct answer
        Map<String, List<String>> confusableWords = new LinkedHashMap<>();
        confusableWords.put("routine", List.of("schedule", "habit", "plan"));
        confusableWords.put("wake up", List.of("get up", "stand up", "show up"));
        confusableWords.put("appointment", List.of("assignment", "arrangement", "announcement"));
        confusableWords.put("available", List.of("capable", "affordable", "reachable"));
        confusableWords.put("clarify", List.of("classify", "notify", "simplify"));
        confusableWords.put("delay", List.of("cancel", "pause", "extend"));
        confusableWords.put("attach", List.of("include", "upload", "insert"));
        confusableWords.put("reply", List.of("respond", "report", "remind"));
        confusableWords.put("update", List.of("upgrade", "upload", "record"));
        confusableWords.put("microphone", List.of("speaker", "webcam", "headphone"));
        confusableWords.put("connection", List.of("communication", "network", "signal"));
        confusableWords.put("password", List.of("username", "keyword", "passcode"));

        List<String> found = confusableWords.get(correctText.toLowerCase());
        if (found != null) return found;
        // Fallback: pick 3 random other words from the map
        return confusableWords.values().stream()
                .flatMap(List::stream)
                .filter(w -> !w.equalsIgnoreCase(correctText))
                .distinct()
                .limit(3)
                .toList();
    }
}
