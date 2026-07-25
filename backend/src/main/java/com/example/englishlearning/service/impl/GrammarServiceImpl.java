package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.grammar.*;
import com.example.englishlearning.entity.*;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.repository.*;
import com.example.englishlearning.service.GrammarService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GrammarServiceImpl implements GrammarService {

    private final GrammarExerciseRepository grammarExerciseRepository;
    private final GrammarQuestionRepository grammarQuestionRepository;
    private final GrammarTopicRepository grammarTopicRepository;
    private final GrammarAttemptRepository grammarAttemptRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public GrammarQuestionResponse createQuestion(Long topicId, GrammarQuestionRequest request) {
        GrammarTopic topic = grammarTopicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("GrammarTopic not found"));

        GrammarExercise exercise = grammarExerciseRepository.findByGrammarTopicId(topicId)
                .orElseGet(() -> {
                    GrammarExercise newExercise = new GrammarExercise();
                    newExercise.setGrammarTopic(topic);
                    return grammarExerciseRepository.save(newExercise);
                });

        GrammarQuestion question = new GrammarQuestion();
        question.setExercise(exercise);
        question.setQuestionText(request.getQuestionText());
        question.setExplanation(request.getExplanation());
        try {
            question.setLevel(Course.CourseLevel.valueOf(request.getLevel().toUpperCase()));
        } catch (IllegalArgumentException e) {
            question.setLevel(Course.CourseLevel.BEGINNER);
        }

        List<GrammarQuestionOption> options = request.getOptions().stream().map(optReq -> {
            GrammarQuestionOption opt = new GrammarQuestionOption();
            opt.setQuestion(question);
            opt.setOptionText(optReq.getOptionText());
            opt.setIsCorrect(optReq.getIsCorrect());
            return opt;
        }).collect(Collectors.toList());

        question.setOptions(options);
        GrammarQuestion savedQuestion = grammarQuestionRepository.save(question);
        return mapToResponse(savedQuestion, true);
    }

    @Override
    @Transactional
    public GrammarQuestionResponse updateQuestion(Long questionId, GrammarQuestionRequest request) {
        GrammarQuestion question = grammarQuestionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        question.setQuestionText(request.getQuestionText());
        question.setExplanation(request.getExplanation());
        try {
            question.setLevel(Course.CourseLevel.valueOf(request.getLevel().toUpperCase()));
        } catch (IllegalArgumentException e) {
            question.setLevel(Course.CourseLevel.BEGINNER);
        }

        question.getOptions().clear();
        for (GrammarQuestionOptionRequest optReq : request.getOptions()) {
            GrammarQuestionOption opt = new GrammarQuestionOption();
            opt.setQuestion(question);
            opt.setOptionText(optReq.getOptionText());
            opt.setIsCorrect(optReq.getIsCorrect());
            question.getOptions().add(opt);
        }

        GrammarQuestion updatedQuestion = grammarQuestionRepository.save(question);
        return mapToResponse(updatedQuestion, true);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long questionId) {
        if (!grammarQuestionRepository.existsById(questionId)) {
            throw new ResourceNotFoundException("Question not found");
        }
        grammarQuestionRepository.deleteById(questionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarQuestionResponse> getQuestionsByTopicForTeacher(Long topicId) {
        return grammarExerciseRepository.findByGrammarTopicId(topicId)
                .map(exercise -> exercise.getQuestions().stream()
                        .map(q -> mapToResponse(q, true))
                        .collect(Collectors.toList()))
                .orElse(new ArrayList<>());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarAttemptResponse> getAttemptsByTopicForTeacher(Long topicId) {
        return grammarExerciseRepository.findByGrammarTopicId(topicId)
                .map(exercise -> grammarAttemptRepository.findByExerciseIdOrderByCreatedAtDesc(exercise.getId())
                        .stream().map(this::mapAttemptToResponse).collect(Collectors.toList()))
                .orElse(new ArrayList<>());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarQuestionResponse> getQuestionsByTopicForStudent(Long topicId) {
        return grammarExerciseRepository.findByGrammarTopicId(topicId)
                .map(exercise -> exercise.getQuestions().stream()
                        .map(q -> mapToResponse(q, false))
                        .collect(Collectors.toList()))
                .orElse(new ArrayList<>());
    }

    @Override
    @Transactional
    public GrammarAttemptResponse submitAttempt(String email, Long topicId, GrammarAttemptSubmitRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        GrammarExercise exercise = grammarExerciseRepository.findByGrammarTopicId(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found"));

        List<GrammarQuestion> questions = exercise.getQuestions();

        Map<Long, Long> userAnswersMap = request.getAnswers().stream()
                .filter(a -> a.getSelectedOptionId() != null)
                .collect(Collectors.toMap(GrammarAttemptAnswerRequest::getQuestionId, GrammarAttemptAnswerRequest::getSelectedOptionId, (a1, a2) -> a1));

        int correctCount = 0;
        List<GrammarAttemptAnswer> answerList = new ArrayList<>();

        for (GrammarQuestion q : questions) {
            Long selectedId = userAnswersMap.get(q.getId());
            if (selectedId != null) {
                GrammarQuestionOption selectedOpt = q.getOptions().stream()
                        .filter(o -> o.getId().equals(selectedId))
                        .findFirst().orElse(null);
                if (selectedOpt != null && Boolean.TRUE.equals(selectedOpt.getIsCorrect())) {
                    correctCount++;
                }
            }
        }

        BigDecimal score = questions.isEmpty() ? BigDecimal.ZERO
                : BigDecimal.valueOf((double) correctCount / questions.size() * 10.0)
                          .setScale(2, RoundingMode.HALF_UP);

        GrammarAttempt attempt = new GrammarAttempt();
        attempt.setUser(user);
        attempt.setExercise(exercise);
        attempt.setTotalQuestions(questions.size());
        attempt.setCorrectAnswers(correctCount);
        attempt.setScore(score);

        // Save attempt first so it has an ID for the FK in answers
        GrammarAttempt savedAttempt = grammarAttemptRepository.save(attempt);

        for (GrammarQuestion q : questions) {
            GrammarAttemptAnswer answer = new GrammarAttemptAnswer();
            answer.setAttempt(savedAttempt);
            answer.setQuestion(q);

            Long selectedId = userAnswersMap.get(q.getId());
            if (selectedId != null) {
                GrammarQuestionOption selectedOpt = q.getOptions().stream()
                        .filter(o -> o.getId().equals(selectedId))
                        .findFirst().orElse(null);
                answer.setSelectedOption(selectedOpt);
                if (selectedOpt != null && Boolean.TRUE.equals(selectedOpt.getIsCorrect())) {
                    answer.setIsCorrect(true);
                }
            }
            savedAttempt.getAnswers().add(answer);
        }

        grammarAttemptRepository.save(savedAttempt);
        return mapAttemptToResponse(savedAttempt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrammarAttemptResponse> getMyAttempts(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return grammarAttemptRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::mapAttemptToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GrammarAttemptResponse getAttemptById(String email, Long attemptId) {
        GrammarAttempt attempt = grammarAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        
        return mapAttemptToResponse(attempt);
    }

    private GrammarQuestionResponse mapToResponse(GrammarQuestion question, boolean includeCorrectAnswer) {
        GrammarQuestionResponse res = new GrammarQuestionResponse();
        res.setId(question.getId());
        res.setQuestionText(question.getQuestionText());
        res.setExplanation(includeCorrectAnswer ? question.getExplanation() : null);
        res.setLevel(question.getLevel().name());
        res.setCreatedAt(question.getCreatedAt());
        res.setUpdatedAt(question.getUpdatedAt());

        List<GrammarQuestionOptionResponse> options = question.getOptions().stream().map(o -> {
            GrammarQuestionOptionResponse optRes = new GrammarQuestionOptionResponse();
            optRes.setId(o.getId());
            optRes.setOptionText(o.getOptionText());
            if (includeCorrectAnswer) {
                optRes.setIsCorrect(o.getIsCorrect());
            }
            return optRes;
        }).collect(Collectors.toList());

        res.setOptions(options);
        return res;
    }

    private GrammarAttemptResponse mapAttemptToResponse(GrammarAttempt attempt) {
        GrammarAttemptResponse res = new GrammarAttemptResponse();
        res.setId(attempt.getId());
        res.setTopicId(attempt.getExercise().getGrammarTopic().getId());
        res.setTopicTitle(attempt.getExercise().getGrammarTopic().getTitle());
        res.setScore(attempt.getScore());
        res.setTotalQuestions(attempt.getTotalQuestions());
        res.setCorrectAnswers(attempt.getCorrectAnswers());
        res.setWrongAnswers(attempt.getTotalQuestions() - attempt.getCorrectAnswers());
        res.setCreatedAt(attempt.getCreatedAt());
        
        if (attempt.getTotalQuestions() == 0) {
            res.setPercentage(BigDecimal.ZERO);
            res.setEvaluation("Chưa có đánh giá");
        } else {
            double percent = (double) attempt.getCorrectAnswers() / attempt.getTotalQuestions() * 100;
            res.setPercentage(BigDecimal.valueOf(percent).setScale(2, RoundingMode.HALF_UP));
            if (percent >= 90) res.setEvaluation("Xuất sắc");
            else if (percent >= 75) res.setEvaluation("Tốt");
            else if (percent >= 60) res.setEvaluation("Đạt");
            else res.setEvaluation("Cần ôn tập thêm");
        }

        List<GrammarAttemptAnswerResponse> answers = attempt.getAnswers().stream().map(a -> {
            GrammarAttemptAnswerResponse aRes = new GrammarAttemptAnswerResponse();
            aRes.setQuestionId(a.getQuestion().getId());
            aRes.setSelectedOptionId(a.getSelectedOption() != null ? a.getSelectedOption().getId() : null);
            aRes.setIsCorrect(a.getIsCorrect());
            aRes.setExplanation(a.getQuestion().getExplanation());
            
            a.getQuestion().getOptions().stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .findFirst()
                    .ifPresent(o -> aRes.setCorrectOptionId(o.getId()));
            
            return aRes;
        }).collect(Collectors.toList());
        
        res.setAnswers(answers);
        return res;
    }
}
