package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.assessment.*;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.entity.*;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.exception.UnauthorizedException;
import com.example.englishlearning.repository.*;
import com.example.englishlearning.service.AssessmentService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
@Transactional
public class AssessmentServiceImpl implements AssessmentService {

    private enum AssessmentType { TEST, EXERCISE }

    private final ExerciseRepository exerciseRepository;
    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository optionRepository;
    private final TestRepository testRepository;
    private final TestQuestionRepository testQuestionRepository;
    private final TestAttemptRepository attemptRepository;
    private final UserAnswerRepository answerRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final CourseOwnershipRepository ownershipRepository;
    private final ObjectMapper objectMapper;

    public AssessmentServiceImpl(
            ExerciseRepository exerciseRepository,
            QuestionRepository questionRepository,
            AnswerOptionRepository optionRepository,
            TestRepository testRepository,
            TestQuestionRepository testQuestionRepository,
            TestAttemptRepository attemptRepository,
            UserAnswerRepository answerRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            UserRepository userRepository,
            CourseOwnershipRepository ownershipRepository,
            ObjectMapper objectMapper
    ) {
        this.exerciseRepository = exerciseRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.testRepository = testRepository;
        this.testQuestionRepository = testQuestionRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
        this.ownershipRepository = ownershipRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public QuestionResponse createQuestion(String email, QuestionRequest request) {
        User teacher = getUser(email);
        Question question = new Question();
        question.setOwner(teacher);
        applyQuestion(question, request, teacher);
        question = questionRepository.save(question);
        replaceOptions(question, request.getOptions());
        return toQuestion(question, true);
    }

    @Override
    public QuestionResponse updateQuestion(String email, Long id, QuestionRequest request) {
        User teacher = getUser(email);
        Question question = getQuestion(id);
        ensureTeacherOwnsQuestion(teacher, question);
        applyQuestion(question, request, teacher);
        question = questionRepository.save(question);
        replaceOptions(question, request.getOptions());
        return toQuestion(question, true);
    }

    @Override
    public void deleteQuestion(String email, Long id) {
        User teacher = getUser(email);
        Question question = getQuestion(id);
        ensureTeacherOwnsQuestion(teacher, question);
        question.setDeletedAt(LocalDateTime.now());
        questionRepository.save(question);
    }

    @Override
    public AssessmentResponse createExercise(String email, AssessmentRequest request) {
        User teacher = getUser(email);
        Course course = getTeacherCourse(teacher, request.getCourseId());
        Exercise exercise = new Exercise();
        applyExercise(exercise, course, request);
        return toExercise(exerciseRepository.save(exercise), true);
    }

    @Override
    public AssessmentResponse updateExercise(String email, Long id, AssessmentRequest request) {
        User teacher = getUser(email);
        Exercise exercise = getExercise(id);
        getTeacherCourse(teacher, exercise.getCourse().getId());
        Course course = getTeacherCourse(teacher, request.getCourseId());
        applyExercise(exercise, course, request);
        return toExercise(exerciseRepository.save(exercise), true);
    }

    @Override
    public AssessmentResponse createTest(String email, AssessmentRequest request) {
        User teacher = getUser(email);
        Course course = getTeacherCourse(teacher, request.getCourseId());
        Test test = new Test();
        applyTest(test, course, request);
        test = testRepository.save(test);
        replaceTestQuestions(test, request.getQuestionIds());
        return toTest(test, true);
    }

    @Override
    public AssessmentResponse updateTest(String email, Long id, AssessmentRequest request) {
        User teacher = getUser(email);
        Test test = getTest(id);
        getTeacherCourse(teacher, test.getCourse().getId());
        Course course = getTeacherCourse(teacher, request.getCourseId());
        applyTest(test, course, request);
        test = testRepository.save(test);
        replaceTestQuestions(test, request.getQuestionIds());
        return toTest(test, true);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AssessmentResponse> getExercises(String email, Long courseId, Pageable pageable) {
        User user = getUser(email);
        boolean admin = "ADMIN".equals(user.getRole().getCode());
        boolean teacher = "TEACHER".equals(user.getRole().getCode());
        if (admin) {
            return PageResponse.from((courseId == null
                    ? exerciseRepository.findByStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(Exercise.ContentStatus.PUBLISHED, pageable)
                    : exerciseRepository.findByCourseIdAndDeletedAtIsNullOrderByUpdatedAtDesc(courseId, pageable))
                    .map(exercise -> toExercise(exercise, false)));
        }
        if (teacher) {
            return PageResponse.from(exerciseRepository.findTeacherExercises(user.getId(), courseId, pageable)
                    .map(exercise -> toExercise(exercise, false)));
        }
        return PageResponse.from(exerciseRepository.findAccessiblePublished(user.getId(), courseId, Exercise.ContentStatus.PUBLISHED, CourseOwnership.OwnershipStatus.ACTIVE, pageable)
                .map(exercise -> toExercise(exercise, false)));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AssessmentResponse> getTests(String email, Long courseId, Pageable pageable) {
        User user = getUser(email);
        boolean admin = "ADMIN".equals(user.getRole().getCode());
        boolean teacher = "TEACHER".equals(user.getRole().getCode());
        if (admin) {
            return PageResponse.from((courseId == null
                    ? testRepository.findByStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(Exercise.ContentStatus.PUBLISHED, pageable)
                    : testRepository.findByCourseIdAndDeletedAtIsNullOrderByUpdatedAtDesc(courseId, pageable))
                    .map(test -> toTest(test, false)));
        }
        if (teacher) {
            return PageResponse.from(testRepository.findTeacherTests(user.getId(), courseId, pageable)
                    .map(test -> toTest(test, false)));
        }
        return PageResponse.from(testRepository.findAccessiblePublished(user.getId(), courseId, Exercise.ContentStatus.PUBLISHED, CourseOwnership.OwnershipStatus.ACTIVE, pageable)
                .map(test -> toTest(test, false)));
    }

    @Override
    public AttemptResponse startExercise(String email, Long exerciseId) {
        return startAttempt(email, exerciseId, AssessmentType.EXERCISE);
    }

    @Override
    public AttemptResponse startTest(String email, Long testId) {
        return startAttempt(email, testId, AssessmentType.TEST);
    }

    private AttemptResponse startAttempt(String email, Long assessmentId, AssessmentType type) {
        User user = getUser(email);
        TestAttempt attempt = new TestAttempt();
        attempt.setUser(user);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setStatus(TestAttempt.AttemptStatus.IN_PROGRESS);
        if (type == AssessmentType.TEST) {
            Test test = getTest(assessmentId);
            attempt.setTest(test);
            attempt.setDueAt(attempt.getStartedAt().plusMinutes(test.getDurationMinutes()));
            ensureStudentAccess(user, test.getCourse().getId());
            if (attemptRepository.countByUserIdAndTestId(user.getId(), assessmentId) >= test.getMaxAttempts()) throw new BadRequestException("Maximum attempts reached");
        } else {
            Exercise exercise = getExercise(assessmentId);
            attempt.setExercise(exercise);
            attempt.setDueAt(attempt.getStartedAt().plusMinutes(exercise.getDurationMinutes()));
            ensureStudentAccess(user, exercise.getCourse().getId());
            if (attemptRepository.countByUserIdAndExerciseId(user.getId(), assessmentId) >= exercise.getMaxAttempts()) throw new BadRequestException("Maximum attempts reached");
        }

        List<QuestionResponse> questionsToSnapshot = new ArrayList<>();
        if (attempt.getTest() != null) {
            questionsToSnapshot = testQuestionRepository.findByTestIdOrderByPositionAsc(attempt.getTest().getId())
                    .stream().map(tq -> toQuestion(tq.getQuestion(), true)).toList();
        } else if (attempt.getExercise() != null) {
            questionsToSnapshot = questionRepository.findByExerciseIdAndDeletedAtIsNullOrderByPositionAsc(attempt.getExercise().getId())
                    .stream().map(q -> toQuestion(q, true)).toList();
        }
        try {
            attempt.setTestSnapshot(objectMapper.writeValueAsString(questionsToSnapshot));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot create immutable assessment snapshot", e);
        }

        return toAttemptResponse(attemptRepository.save(attempt));
    }

    @Override
    public AttemptResponse saveAnswer(String email, Long attemptId, Long questionId, SaveAnswerRequest request) {
        User user = getUser(email);
        TestAttempt attempt = getOwnedAttempt(user, attemptId);
        ensureAttemptOpen(attempt);
        Question question = getQuestion(questionId);
        ensureQuestionInAttempt(attempt, question);
        UserAnswer answer = answerRepository.findByAttemptIdAndQuestionId(attemptId, questionId).orElseGet(() -> {
            UserAnswer created = new UserAnswer();
            created.setAttempt(attempt);
            created.setQuestion(question);
            return created;
        });
        AnswerOption option = request.getSelectedOptionId() == null ? null : getOption(request.getSelectedOptionId());
        if (option != null && !option.getQuestion().getId().equals(question.getId())) {
            throw new BadRequestException("Option does not belong to this question");
        }
        List<Long> selectedIds = request.getSelectedOptionIds() == null ? List.of() : request.getSelectedOptionIds();
        for (Long selectedId : selectedIds) {
            AnswerOption selected = getOption(selectedId);
            if (!selected.getQuestion().getId().equals(question.getId())) {
                throw new BadRequestException("Every selected option must belong to this question");
            }
        }
        if (question.getQuestionType() != Question.QuestionType.MULTIPLE_CHOICE && selectedIds.size() > 1) {
            throw new BadRequestException("This question accepts only one option");
        }
        answer.setSelectedOption(option);
        answer.setSelectedOptionIds(listToJson(selectedIds));
        answer.setAnswerText(request.getAnswerText());
        answer.setAnswerJson(request.getAnswerJson());
        answerRepository.save(answer);
        return toAttemptResponse(attempt);
    }

    @Override
    public AttemptResponse submitAttempt(String email, Long attemptId) {
        User user = getUser(email);
        TestAttempt attempt = getOwnedAttempt(user, attemptId);
        ensureAttemptOpen(attempt);
        BigDecimal score = BigDecimal.ZERO;
        for (UserAnswer answer : answerRepository.findByAttemptId(attemptId)) {
            grade(answer, snapshotQuestion(attempt, answer.getQuestion().getId()));
            if (answer.getPointsEarned() != null) {
                score = score.add(answer.getPointsEarned());
            }
        }
        attempt.setScore(score);
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(TestAttempt.AttemptStatus.SUBMITTED);
        return toAttemptResponse(attemptRepository.save(attempt));
    }

    @Override
    @Transactional(readOnly = true)
    public AttemptResponse getAttempt(String email, Long attemptId) {
        User user = getUser(email);
        return toAttemptResponse(getOwnedAttempt(user, attemptId));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AttemptResponse> getMyAttempts(String email, Pageable pageable) {
        User user = getUser(email);
        return PageResponse.from(attemptRepository.findByUserIdOrderByStartedAtDesc(user.getId(), pageable)
                .map(this::toAttemptResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AttemptResponse> getTeacherResults(String email, Pageable pageable) {
        User teacher = getUser(email);
        return PageResponse.from(attemptRepository
                .findByTestCourseTeacherIdOrExerciseCourseTeacherIdOrderByStartedAtDesc(teacher.getId(), teacher.getId(), pageable)
                .map(this::toAttemptResponse));
    }

    private void applyQuestion(Question question, QuestionRequest request, User teacher) {
        Exercise exercise = request.getExerciseId() == null ? null : getExercise(request.getExerciseId());
        if (exercise != null) getTeacherCourse(teacher, exercise.getCourse().getId());
        question.setExercise(exercise);
        question.setQuestionType(request.getQuestionType());
        question.setQuestionText(request.getQuestionText().trim());
        question.setExplanation(request.getExplanation());
        question.setPoints(request.getPoints() == null ? BigDecimal.ONE : request.getPoints());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setPosition(request.getPosition() == null ? 1 : request.getPosition());
    }

    private void applyExercise(Exercise exercise, Course course, AssessmentRequest request) {
        exercise.setCourse(course);
        exercise.setLesson(request.getLessonId() == null ? null : lessonRepository.findByIdAndChapterCourseIdAndDeletedAtIsNull(request.getLessonId(), course.getId()).orElseThrow(() -> new BadRequestException("Lesson does not belong to course")));
        exercise.setTitle(request.getTitle().trim());
        exercise.setDescription(request.getDescription());
        exercise.setExerciseType(request.getExerciseType() == null ? Exercise.ExerciseType.MIXED : request.getExerciseType());
        exercise.setDurationMinutes(request.getDurationMinutes() == null ? 0 : request.getDurationMinutes());
        exercise.setMaxAttempts(request.getMaxAttempts() == null ? 3 : request.getMaxAttempts());
        exercise.setStatus(request.getStatus() == null ? Exercise.ContentStatus.DRAFT : request.getStatus());
    }

    private void applyTest(Test test, Course course, AssessmentRequest request) {
        test.setCourse(course);
        test.setTitle(request.getTitle().trim());
        test.setDescription(request.getDescription());
        test.setDurationMinutes(request.getDurationMinutes() == null ? 30 : request.getDurationMinutes());
        test.setMaxAttempts(request.getMaxAttempts() == null ? 1 : request.getMaxAttempts());
        test.setPassScore(request.getPassScore() == null ? BigDecimal.ZERO : request.getPassScore());
        test.setStatus(request.getStatus() == null ? Exercise.ContentStatus.DRAFT : request.getStatus());
    }

    private void replaceOptions(Question question, List<AnswerOptionRequest> options) {
        optionRepository.deleteByQuestionId(question.getId());
        for (AnswerOptionRequest request : options) {
            AnswerOption option = new AnswerOption();
            option.setQuestion(question);
            option.setOptionText(request.getOptionText());
            option.setCorrect(Boolean.TRUE.equals(request.getCorrect()));
            option.setPosition(request.getPosition());
            optionRepository.save(option);
        }
    }

    private void replaceTestQuestions(Test test, List<Long> questionIds) {
        testQuestionRepository.deleteByTestId(test.getId());
        int position = 1;
        for (Long questionId : questionIds) {
            Question question = getQuestion(questionId);
            if (question.getOwner() == null || (!"ADMIN".equals(test.getCourse().getTeacher().getRole().getCode())
                    && !question.getOwner().getId().equals(test.getCourse().getTeacher().getId()))) {
                throw new UnauthorizedException("Test can only use questions owned by its teacher");
            }
            if (question.getExercise() != null && !question.getExercise().getCourse().getId().equals(test.getCourse().getId())) {
                throw new BadRequestException("Test cannot use a question from another course");
            }
            TestQuestion item = new TestQuestion();
            item.setTest(test);
            item.setQuestion(question);
            item.setPosition(position++);
            item.setPoints(question.getPoints());
            testQuestionRepository.save(item);
        }
    }

    private void grade(UserAnswer answer, QuestionResponse snapshot) {
        if (snapshot.getQuestionType() == Question.QuestionType.WRITING) {
            answer.setCorrect(null);
            answer.setPointsEarned(null);
            answerRepository.save(answer);
            return;
        }
        boolean correct = switch (snapshot.getQuestionType()) {
            case MULTIPLE_CHOICE -> selectedOptionIds(answer).equals(snapshot.getOptions().stream()
                    .filter(option -> Boolean.TRUE.equals(option.getCorrect())).map(OptionResponse::getId).collect(java.util.stream.Collectors.toSet()));
            case SINGLE_CHOICE, LISTENING_MULTIPLE_CHOICE, TRUE_FALSE -> answer.getSelectedOption() != null
                    && snapshot.getOptions().stream().anyMatch(option -> option.getId().equals(answer.getSelectedOption().getId()) && Boolean.TRUE.equals(option.getCorrect()));
            case FILL_IN_THE_BLANK ->
                    snapshot.getCorrectAnswer() != null && answer.getAnswerText() != null
                            && snapshot.getCorrectAnswer().trim().equalsIgnoreCase(answer.getAnswerText().trim());
            case SENTENCE_ORDERING, MATCHING ->
                    snapshot.getCorrectAnswer() != null && snapshot.getCorrectAnswer().equals(answer.getAnswerJson());
            case WRITING -> false;
        };
        answer.setCorrect(correct);
        answer.setPointsEarned(correct ? snapshot.getPoints() : BigDecimal.ZERO);
        answerRepository.save(answer);
    }

    private void ensureAttemptOpen(TestAttempt attempt) {
        if (attempt.getStatus() != TestAttempt.AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Submitted attempt cannot be changed");
        }
        if (attempt.getDueAt() != null && LocalDateTime.now().isAfter(attempt.getDueAt())) {
            throw new BadRequestException("Attempt time is over");
        }
    }

    private void ensureQuestionInAttempt(TestAttempt attempt, Question question) {
        snapshotQuestion(attempt, question.getId());
    }

    private Course getTeacherCourse(User user, Long courseId) {
        Course course = courseRepository.findById(courseId).filter(item -> item.getDeletedAt() == null).orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!"ADMIN".equals(user.getRole().getCode()) && !course.getTeacher().getId().equals(user.getId())) {
            throw new UnauthorizedException("Teacher can only manage own assessments");
        }
        return course;
    }

    private void ensureStudentAccess(User user, Long courseId) {
        if ("ADMIN".equals(user.getRole().getCode())) return;
        if (!ownershipRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), courseId, CourseOwnership.OwnershipStatus.ACTIVE)) {
            throw new UnauthorizedException("You do not have access to this course");
        }
    }

    private void ensureTeacherOwnsQuestion(User teacher, Question question) {
        if ("ADMIN".equals(teacher.getRole().getCode())) return;
        if (question.getOwner() == null || !question.getOwner().getId().equals(teacher.getId())) {
            throw new UnauthorizedException("Teacher can only modify own questions");
        }
        if (question.getExercise() != null) {
            getTeacherCourse(teacher, question.getExercise().getCourse().getId());
            return;
        }
        List<TestQuestion> testQuestions = testQuestionRepository.findByQuestionId(question.getId());
        if (!testQuestions.isEmpty()) {
            getTeacherCourse(teacher, testQuestions.get(0).getTest().getCourse().getId());
            return;
        }
        return;
    }

    private TestAttempt getOwnedAttempt(User user, Long attemptId) {
        TestAttempt attempt = attemptRepository.findById(attemptId).orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));
        if (!attempt.getUser().getId().equals(user.getId()) && !"ADMIN".equals(user.getRole().getCode())) throw new UnauthorizedException("Attempt access denied");
        return attempt;
    }

    private Exercise getExercise(Long id) { return exerciseRepository.findById(id).filter(item -> item.getDeletedAt() == null).orElseThrow(() -> new ResourceNotFoundException("Exercise not found")); }
    private Test getTest(Long id) { return testRepository.findById(id).filter(item -> item.getDeletedAt() == null).orElseThrow(() -> new ResourceNotFoundException("Test not found")); }
    private Question getQuestion(Long id) { return questionRepository.findById(id).filter(item -> item.getDeletedAt() == null).orElseThrow(() -> new ResourceNotFoundException("Question not found")); }
    private AnswerOption getOption(Long id) { return optionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Answer option not found")); }
    private User getUser(String email) { return userRepository.findByEmailAndDeletedAtIsNull(email).orElseThrow(() -> new UnauthorizedException("Authentication is required")); }
    private LocalDateTime resolveDueAt(Integer minutes) { return minutes == null || minutes <= 0 ? null : LocalDateTime.now().plusMinutes(minutes); }
    private String listToJson(List<Long> ids) {
        try {
            return objectMapper.writeValueAsString(ids == null ? List.of() : ids);
        } catch (Exception exception) {
            throw new BadRequestException("Selected options are invalid");
        }
    }

    private Set<Long> selectedOptionIds(UserAnswer answer) {
        if (answer.getSelectedOptionIds() == null || answer.getSelectedOptionIds().isBlank()) return Set.of();
        try {
            return new HashSet<>(objectMapper.readValue(answer.getSelectedOptionIds(), new TypeReference<List<Long>>() {}));
        } catch (Exception exception) {
            throw new BadRequestException("Stored selected options are invalid");
        }
    }

    private QuestionResponse snapshotQuestion(TestAttempt attempt, Long questionId) {
        if (attempt.getTestSnapshot() == null || attempt.getTestSnapshot().isBlank()) {
            throw new BadRequestException("Attempt snapshot is missing");
        }
        try {
            return objectMapper.readValue(attempt.getTestSnapshot(), new TypeReference<List<QuestionResponse>>() {})
                    .stream().filter(question -> question.getId().equals(questionId)).findFirst()
                    .orElseThrow(() -> new BadRequestException("Question does not belong to this attempt snapshot"));
        } catch (BadRequestException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BadRequestException("Attempt snapshot is invalid");
        }
    }

    private QuestionResponse hideAnswers(QuestionResponse question) {
        return QuestionResponse.builder()
                .id(question.getId()).exerciseId(question.getExerciseId()).questionType(question.getQuestionType())
                .questionText(question.getQuestionText()).points(question.getPoints()).position(question.getPosition())
                .options(question.getOptions().stream().map(option -> OptionResponse.builder()
                        .id(option.getId()).optionText(option.getOptionText()).position(option.getPosition()).build()).toList())
                .build();
    }

    private AssessmentResponse toExercise(Exercise exercise, boolean includeAnswers) {
        return AssessmentResponse.builder().id(exercise.getId()).type("EXERCISE").courseId(exercise.getCourse().getId()).lessonId(exercise.getLesson() == null ? null : exercise.getLesson().getId()).title(exercise.getTitle()).description(exercise.getDescription()).durationMinutes(exercise.getDurationMinutes()).maxAttempts(exercise.getMaxAttempts()).status(exercise.getStatus()).questions(questionRepository.findByExerciseIdAndDeletedAtIsNullOrderByPositionAsc(exercise.getId()).stream().map(q -> toQuestion(q, includeAnswers)).toList()).build();
    }
    private AssessmentResponse toTest(Test test, boolean includeAnswers) {
        return AssessmentResponse.builder().id(test.getId()).type("TEST").courseId(test.getCourse().getId()).title(test.getTitle()).description(test.getDescription()).durationMinutes(test.getDurationMinutes()).maxAttempts(test.getMaxAttempts()).passScore(test.getPassScore()).status(test.getStatus()).questions(testQuestionRepository.findByTestIdOrderByPositionAsc(test.getId()).stream().map(tq -> toQuestion(tq.getQuestion(), includeAnswers)).toList()).build();
    }
    private QuestionResponse toQuestion(Question question, boolean includeAnswers) {
        return QuestionResponse.builder().id(question.getId()).exerciseId(question.getExercise() == null ? null : question.getExercise().getId()).questionType(question.getQuestionType()).questionText(question.getQuestionText()).explanation(includeAnswers ? question.getExplanation() : null).points(question.getPoints()).correctAnswer(includeAnswers ? question.getCorrectAnswer() : null).position(question.getPosition()).options(optionRepository.findByQuestionIdOrderByPositionAsc(question.getId()).stream().map(o -> OptionResponse.builder().id(o.getId()).optionText(o.getOptionText()).correct(includeAnswers ? o.getCorrect() : null).position(o.getPosition()).build()).toList()).build();
    }
    private AttemptResponse toAttemptResponse(TestAttempt attempt) {
        List<QuestionResponse> questions = null;
        if (attempt.getTestSnapshot() != null) {
            try {
                questions = objectMapper.readValue(attempt.getTestSnapshot(), new TypeReference<List<QuestionResponse>>() {});
            } catch (Exception e) {}
        }
        if (questions == null) {
            questions = attempt.getExercise() != null ? toExercise(attempt.getExercise(), false).getQuestions() : toTest(attempt.getTest(), false).getQuestions();
        }

        boolean includeAnswers = attempt.getStatus() != TestAttempt.AttemptStatus.IN_PROGRESS;
        if (!includeAnswers) questions = questions.stream().map(this::hideAnswers).toList();
        List<UserAnswer> savedAnswers = answerRepository.findByAttemptId(attempt.getId());
        BigDecimal totalPoints = questions.stream().map(QuestionResponse::getPoints).filter(java.util.Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal passScore = attempt.getExercise() == null ? attempt.getTest().getPassScore() : BigDecimal.ZERO;
        BigDecimal scorePercent = attempt.getScore() == null || totalPoints.signum() == 0 ? BigDecimal.ZERO
                : attempt.getScore().multiply(new BigDecimal("100")).divide(totalPoints, 2, java.math.RoundingMode.HALF_UP);
        BigDecimal requiredPercent = attempt.getExercise() == null
                ? (passScore.compareTo(BigDecimal.TEN) <= 0 ? passScore.multiply(BigDecimal.TEN) : passScore)
                : new BigDecimal("60");
        return AttemptResponse.builder()
                .id(attempt.getId()).targetType(attempt.getExercise() == null ? "TEST" : "EXERCISE")
                .targetId(attempt.getExercise() == null ? attempt.getTest().getId() : attempt.getExercise().getId())
                .title(attempt.getExercise() == null ? attempt.getTest().getTitle() : attempt.getExercise().getTitle())
                .description(attempt.getExercise() == null ? attempt.getTest().getDescription() : attempt.getExercise().getDescription())
                .durationMinutes(attempt.getExercise() == null ? attempt.getTest().getDurationMinutes() : attempt.getExercise().getDurationMinutes())
                .passScore(passScore).totalPoints(totalPoints)
                .scorePercent(scorePercent)
                .passed(includeAnswers ? scorePercent.compareTo(requiredPercent) >= 0 : null)
                .correctAnswers(includeAnswers ? savedAnswers.stream().filter(a -> Boolean.TRUE.equals(a.getCorrect())).count() : 0)
                .incorrectAnswers(includeAnswers ? savedAnswers.stream().filter(a -> Boolean.FALSE.equals(a.getCorrect())).count() : 0)
                .elapsedSeconds(java.time.Duration.between(attempt.getStartedAt(),
                        attempt.getSubmittedAt() == null ? LocalDateTime.now() : attempt.getSubmittedAt()).getSeconds())
                .startedAt(attempt.getStartedAt()).dueAt(attempt.getDueAt()).submittedAt(attempt.getSubmittedAt())
                .score(attempt.getScore()).status(attempt.getStatus()).questions(questions)
                .answers(savedAnswers.stream().map(a -> AnswerResultResponse.builder()
                        .questionId(a.getQuestion().getId())
                        .selectedOptionId(a.getSelectedOption() == null ? null : a.getSelectedOption().getId())
                        .selectedOptionIds(a.getSelectedOptionIds()).answerText(a.getAnswerText()).answerJson(a.getAnswerJson())
                        .correct(includeAnswers ? a.getCorrect() : null).pointsEarned(includeAnswers ? a.getPointsEarned() : null)
                        .build()).toList())
                .build();
    }
}
