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
                    AnswerOption selectedOpt = options.stream().filter(o -> o.getId().equals(selectedId)).findFirst().orElse(null);
                    if (selectedOpt != null) {
                        selectedOptionText = selectedOpt.getOptionText();
                        if (correctOpt != null && correctOpt.getId().equals(selectedId)) {
                            isCorrect = true;
                        }
                    }
                } else {
                    long expectedCorrectId = q.getId() * 10 + 1;
                    if (selectedId != null && selectedId.equals(expectedCorrectId)) {
                        isCorrect = true;
                        selectedOptionText = (q.getCorrectAnswer() != null && !q.getCorrectAnswer().isBlank()) ? q.getCorrectAnswer() : "Đáp án chính xác";
                    } else if (selectedId != null) {
                        long pos = selectedId % 10;
                        selectedOptionText = pos == 2 ? "Phương án B" : pos == 3 ? "Phương án C" : pos == 4 ? "Phương án D" : "Phương án đã chọn";
                    }
                }
            }

            if (isCorrect) correctCount++;

            String correctAnsText = correctOpt != null ? correctOpt.getOptionText()
                    : (q.getCorrectAnswer() != null && !q.getCorrectAnswer().isBlank() ? q.getCorrectAnswer() : "Đáp án A (Chính xác)");

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
        List<OptionResponse> options = optionRepository.findByQuestionIdOrderByPositionAsc(q.getId()).stream()
                .map(o -> OptionResponse.builder()
                        .id(o.getId())
                        .optionText(o.getOptionText())
                        .correct(o.getCorrect())
                        .position(o.getPosition())
                        .build())
                .toList();

        if (options.isEmpty()) {
            options = buildFallbackOptions(q);
        }

        return QuestionResponse.builder()
                .id(q.getId())
                .questionType(q.getQuestionType())
                .questionText(q.getQuestionText())
                .skillType(q.getSkillType())
                .topic(q.getTopic())
                .position(q.getPosition())
                .explanation(q.getExplanation())
                .correctAnswer(q.getCorrectAnswer())
                .options(options)
                .build();
    }

    private List<OptionResponse> buildFallbackOptions(Question q) {
        String correctText = (q.getCorrectAnswer() != null && !q.getCorrectAnswer().isBlank())
                ? q.getCorrectAnswer() : null;

        if (correctText == null && q.getExplanation() != null && q.getExplanation().contains("=")) {
            int eqIdx = q.getExplanation().indexOf("=");
            correctText = q.getExplanation().substring(eqIdx + 1).replace(".", "").trim();
        }

        if (correctText == null || correctText.isBlank()) {
            correctText = "Phương án đúng theo ngữ cảnh bài học";
        }

        String qText = q.getQuestionText() != null ? q.getQuestionText().toLowerCase() : "";
        String optB = "Lựa chọn phương án 2";
        String optC = "Lựa chọn phương án 3";
        String optD = "Lựa chọn phương án 4";

        if (qText.contains("book a double room") || qText.contains("đặt phòng")) {
            correctText = "Đặt một phòng đôi cho 2 đêm";
            optB = "Đặt một phòng đơn cho 1 đêm";
            optC = "Trả phòng khách sạn sớm";
            optD = "Đặt bàn ăn tối cho 2 người";
        } else if (qText.contains("subway station") || qText.contains("địa điểm")) {
            correctText = "Ga tàu điện ngầm";
            optB = "Trạm xe buýt trung tâm";
            optC = "Sân bay quốc tế";
            optD = "Bến tàu thủy";
        } else if (qText.contains("check") || qText.contains("hóa đơn")) {
            correctText = "Here is your check/bill, sir.";
            optB = "Yes, I would like some coffee.";
            optC = "The room is ready now.";
            optD = "I am looking for a taxi.";
        } else if (qText.contains("sounds great") || qText.contains("đồng ý")) {
            correctText = "That sounds great! Let us go.";
            optB = "Sorry, I am too busy today.";
            optC = "I do not think so.";
            optD = "No, thank you very much.";
        } else if (qText.contains("departure time") || qText.contains("khởi hành")) {
            correctText = "Giờ khởi hành chuyến bay";
            optB = "Giờ hạ cánh dự kiến";
            optC = "Số ghế trên tàu";
            optD = "Hạn cân hành lý ký gửi";
        } else if (qText.contains("mind the gap") || qText.contains("khoảng trống")) {
            correctText = "Chú ý khoảng trống giữa tàu và mép sân ga";
            optB = "Vui lòng giữ trật tự trên toa tàu";
            optC = "Không mang vật dễ cháy nổ";
            optD = "Xin xuất trình vé cho soát vé";
        } else if (qText.contains("thank you") || qText.contains("cảm ơn")) {
            correctText = "You are very welcome!";
            optB = "Yes, please.";
            optC = "Never mind.";
            optD = "See you next time.";
        } else if (qText.contains("boarding pass") || qText.contains("lên máy bay")) {
            correctText = "Thẻ lên máy bay";
            optB = "Hộ chiếu cá nhân";
            optC = "Tờ khai y tế";
            optD = "Hóa đơn tiền phòng";
        } else if (qText.contains("round-trip") || qText.contains("khứ hồi")) {
            correctText = "Vé khứ hồi (2 chiều)";
            optB = "Vé một chiều";
            optC = "Vé xem phim cuối tuần";
            optD = "Thẻ thành viên giảm giá";
        }

        return List.of(
                OptionResponse.builder().id(q.getId() * 10 + 1).optionText(correctText).correct(true).position(1).build(),
                OptionResponse.builder().id(q.getId() * 10 + 2).optionText(optB).correct(false).position(2).build(),
                OptionResponse.builder().id(q.getId() * 10 + 3).optionText(optC).correct(false).position(3).build(),
                OptionResponse.builder().id(q.getId() * 10 + 4).optionText(optD).correct(false).position(4).build()
        );
    }
}
