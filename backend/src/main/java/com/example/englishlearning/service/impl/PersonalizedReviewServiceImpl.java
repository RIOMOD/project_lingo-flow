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
    public PersonalizedReviewSessionResponse generateReviewSession(String email, Long sourceAttemptId) {
        User user = getUser(email);
        TestAttempt sourceAttempt = null;
        List<LearningRecommendationResponse> recommendations;

        if (sourceAttemptId != null) {
            sourceAttempt = attemptRepository.findById(sourceAttemptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Test attempt not found"));
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

        // Fetch questions for review quiz (Target: 8 questions total)
        int targetTotal = 8;
        Set<Long> alreadyAnsweredQuestionIds = answerRepository.findByUserId(user.getId()).stream()
                .map(a -> a.getQuestion().getId())
                .collect(Collectors.toSet());

        List<Question> selectedQuestions = new ArrayList<>();
        Set<Long> selectedQuestionIds = new HashSet<>();
        List<PersonalizedReviewQuestion> reviewQuestionEntries = new ArrayList<>();

        // Weighted allocation: Weight 1 (40%), Weight 2 (30%), Weight 3 (30%)
        int[] weights = {4, 2, 2};

        PersonalizedReviewSession session = PersonalizedReviewSession.builder()
                .user(user)
                .sourceAttempt(sourceAttempt)
                .totalQuestions(targetTotal)
                .preAccuracy(preAccuracy)
                .status(PersonalizedReviewSession.SessionStatus.IN_PROGRESS)
                .build();

        session = sessionRepository.save(session);

        for (int i = 0; i < recommendations.size(); i++) {
            LearningRecommendationResponse rec = recommendations.get(i);
            int needed = (i < weights.length) ? weights[i] : 2;

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

        // Bù đắp nếu chưa đủ 5 câu
        if (selectedQuestions.size() < 5) {
            List<Question> fillCandidates = questionRepository.findAll().stream()
                    .filter(q -> q.getDeletedAt() == null)
                    .filter(q -> !selectedQuestionIds.contains(q.getId()))
                    .limit(5 - selectedQuestions.size())
                    .toList();
            for (Question q : fillCandidates) {
                selectedQuestions.add(q);
                selectedQuestionIds.add(q.getId());
                reviewQuestionEntries.add(PersonalizedReviewQuestion.builder()
                        .session(session)
                        .question(q)
                        .topic("Ôn tập kiến thức tổng hợp")
                        .skillType(q.getSkillType())
                        .weightOrder(1)
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
                AnswerOption selectedOpt = options.stream().filter(o -> o.getId().equals(selectedId)).findFirst().orElse(null);
                if (selectedOpt != null) {
                    selectedOptionText = selectedOpt.getOptionText();
                    if (correctOpt != null && correctOpt.getId().equals(selectedId)) {
                        isCorrect = true;
                    }
                }
            }

            if (isCorrect) correctCount++;

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
                    .correctAnswer(correctOpt != null ? correctOpt.getOptionText() : (q.getCorrectAnswer() != null ? q.getCorrectAnswer() : "Chính xác"))
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
        return userRepository.findByEmail(email)
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
        List<OptionResponse> options = optionRepository.findByQuestionIdOrderByPositionAsc(q.getId()).stream()
                .map(o -> OptionResponse.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .position(o.getPosition())
                        .build())
                .toList();

        return QuestionResponse.builder()
                .id(q.getId())
                .questionType(q.getQuestionType())
                .questionText(q.getQuestionText())
                .skillType(q.getSkillType())
                .topic(q.getTopic())
                .position(q.getPosition())
                .options(options)
                .build();
    }
}
