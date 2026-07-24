package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.progress.ChartPointResponse;
import com.example.englishlearning.dto.progress.CourseProgressResponse;
import com.example.englishlearning.dto.progress.LessonProgressRequest;
import com.example.englishlearning.dto.progress.ProgressDashboardResponse;
import com.example.englishlearning.dto.progress.SkillProgressResponse;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.CourseEnrollment;
import com.example.englishlearning.entity.CourseOwnership;
import com.example.englishlearning.entity.Exercise;
import com.example.englishlearning.entity.LearningProgress;
import com.example.englishlearning.entity.Lesson;
import com.example.englishlearning.entity.TestAttempt;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.exception.UnauthorizedException;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ForbiddenException;
import com.example.englishlearning.repository.CourseEnrollmentRepository;
import com.example.englishlearning.repository.CourseOwnershipRepository;
import com.example.englishlearning.repository.CourseRepository;
import com.example.englishlearning.repository.LearningProgressRepository;
import com.example.englishlearning.repository.LessonRepository;
import com.example.englishlearning.repository.TestAttemptRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.repository.UserProfileRepository;
import com.example.englishlearning.repository.VocabularyProgressRepository;
import com.example.englishlearning.service.ProgressService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ProgressServiceImpl implements ProgressService {

    private final LearningProgressRepository progressRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseOwnershipRepository ownershipRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final TestAttemptRepository attemptRepository;
    private final VocabularyProgressRepository vocabularyProgressRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public ProgressServiceImpl(
            LearningProgressRepository progressRepository,
            CourseEnrollmentRepository enrollmentRepository,
            CourseOwnershipRepository ownershipRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            TestAttemptRepository attemptRepository,
            VocabularyProgressRepository vocabularyProgressRepository,
            UserRepository userRepository,
            UserProfileRepository userProfileRepository
    ) {
        this.progressRepository = progressRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.ownershipRepository = ownershipRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.attemptRepository = attemptRepository;
        this.vocabularyProgressRepository = vocabularyProgressRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProgressDashboardResponse getStudentDashboard(String email) {
        User user = getUser(email);
        List<CourseProgressResponse> courses = getCourseProgress(email);
        List<LearningProgress> progress = progressRepository.findByUserIdOrderByLastAccessedAtDesc(user.getId());
        List<TestAttempt> attempts = attemptRepository.findByUserIdAndSubmittedAtIsNotNull(user.getId());
        return ProgressDashboardResponse.builder()
                .studentName(user.getFullName())
                .learningGoal(userProfileRepository.findByUserId(user.getId()).map(profile -> profile.getLearningGoal()).orElse(null))
                .activeCourses(courses.stream().filter(course -> !course.isCompleted()).count())
                .startedLessons(progress.stream().filter(item -> item.getStatus() != LearningProgress.ProgressStatus.NOT_STARTED).count())
                .completedLessons(progress.stream().filter(this::isFullCompletion).count())
                .learnedWords(vocabularyProgressRepository.countByUserId(user.getId()))
                .rememberedWords(vocabularyProgressRepository.countByUserIdAndStatus(user.getId(), com.example.englishlearning.entity.VocabularyStatus.MASTERED))
                .studyTimeMinutes(progress.stream().mapToInt(item -> item.getStudyTimeMinutes() == null ? 0 : item.getStudyTimeMinutes()).sum())
                .streakDays(calculateStreak(user.getId()))
                .completedExercises(attemptRepository.countByUserIdAndExerciseIsNotNullAndSubmittedAtIsNotNull(user.getId()))
                .averageScore(averageScore(attempts))
                .dueReviewWords(vocabularyProgressRepository.countByUserIdAndNextReviewAtLessThanEqual(user.getId(), LocalDateTime.now()))
                .strongestSkill(resolveSkill(attempts, true))
                .weakestSkill(resolveSkill(attempts, false))
                .weeklyChart(buildWeeklyChart(user.getId()))
                .monthlyChart(buildMonthlyChart(user.getId()))
                .courses(courses)
                .continueLearning(courses.stream()
                        .filter(course -> !course.isCompleted() && course.getNextLessonId() != null)
                        .max(Comparator.comparing(CourseProgressResponse::getLastAccessedAt,
                                Comparator.nullsFirst(Comparator.naturalOrder())))
                        .orElse(courses.stream().filter(course -> !course.isCompleted()).findFirst().orElse(null)))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CourseProgressResponse> getCourseProgress(String email) {
        User user = getUser(email);
        return enrollmentRepository.findByUserIdAndStatus(user.getId(), CourseEnrollment.EnrollmentStatus.ACTIVE)
                .stream()
                .filter(enrollment -> hasCourseAccess(user, enrollment.getCourse()))
                .map(enrollment -> buildCourseProgress(user.getId(), enrollment.getCourse()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(String email, Long courseId) {
        User user = getUser(email);
        Course course = getCourse(courseId);
        ensureCourseAccess(user, course, false);
        return buildCourseProgress(user.getId(), course);
    }

    @Override
    public CourseProgressResponse startLesson(String email, Long lessonId, LessonProgressRequest request) {
        User user = getUser(email);
        Lesson lesson = getLesson(lessonId);
        boolean previewOnly = ensureCourseAccess(user, lesson.getChapter().getCourse(), Boolean.TRUE.equals(lesson.getPreview()));
        ensureLessonUnlocked(user, lesson, previewOnly);
        LearningProgress progress = getOrCreateProgress(user, lesson);
        if (progress.getStatus() == LearningProgress.ProgressStatus.NOT_STARTED) {
            progress.setStatus(LearningProgress.ProgressStatus.IN_PROGRESS);
            progress.setStartedAt(LocalDateTime.now());
        }
        progress.setPreviewOnly(previewOnly);
        recordActivity(progress, lesson, request);
        progressRepository.save(progress);
        return buildCourseProgress(user.getId(), lesson.getChapter().getCourse());
    }

    @Override
    public CourseProgressResponse trackLesson(String email, Long lessonId, LessonProgressRequest request) {
        User user = getUser(email);
        Lesson lesson = getLesson(lessonId);
        boolean previewOnly = ensureCourseAccess(user, lesson.getChapter().getCourse(), Boolean.TRUE.equals(lesson.getPreview()));
        ensureLessonUnlocked(user, lesson, previewOnly);
        LearningProgress progress = getOrCreateProgress(user, lesson);
        if (progress.getStatus() == LearningProgress.ProgressStatus.NOT_STARTED) {
            progress.setStatus(LearningProgress.ProgressStatus.IN_PROGRESS);
            progress.setStartedAt(LocalDateTime.now());
        }
        progress.setPreviewOnly(previewOnly);
        recordActivity(progress, lesson, request);
        progressRepository.save(progress);
        return buildCourseProgress(user.getId(), lesson.getChapter().getCourse());
    }

    @Override
    @Transactional(noRollbackFor = BadRequestException.class)
    public CourseProgressResponse completeLesson(String email, Long lessonId, LessonProgressRequest request) {
        User user = getUser(email);
        Lesson lesson = getLesson(lessonId);
        boolean previewOnly = ensureCourseAccess(user, lesson.getChapter().getCourse(), Boolean.TRUE.equals(lesson.getPreview()));
        ensureLessonUnlocked(user, lesson, previewOnly);
        if (previewOnly && !Boolean.TRUE.equals(lesson.getPreview())) {
            throw new UnauthorizedException("Locked lesson cannot be completed");
        }
        LearningProgress progress = getOrCreateProgress(user, lesson);
        if (progress.getStatus() == LearningProgress.ProgressStatus.COMPLETED) {
            return buildCourseProgress(user.getId(), lesson.getChapter().getCourse());
        }
        recordActivity(progress, lesson, request);
        if (safeDecimal(progress.getContentProgressPercent()).compareTo(new BigDecimal("85.00")) < 0) {
            progressRepository.save(progress);
            throw new BadRequestException("Bạn cần học ít nhất 85% nội dung trước khi hoàn thành.");
        }
        progress.setCheckpointAttempts(safe(progress.getCheckpointAttempts()) + 1);
        if (!answersMatch(request.getCheckpointAnswer(), lesson.getCheckpointAnswer())) {
            progress.setCheckpointPassed(false);
            progress.setCheckpointScore(BigDecimal.ZERO);
            progressRepository.save(progress);
            throw new BadRequestException("Câu trả lời chưa đúng. " + (lesson.getCheckpointExplanation() == null
                    ? "Hãy xem lại nội dung và thử lại." : lesson.getCheckpointExplanation()));
        }
        progress.setCheckpointPassed(true);
        progress.setCheckpointScore(new BigDecimal("100.00"));
        progress.setStatus(LearningProgress.ProgressStatus.COMPLETED);
        progress.setProgressPercent(new BigDecimal("100.00"));
        progress.setPreviewOnly(previewOnly);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setScore(progress.getCheckpointScore());
        progressRepository.save(progress);
        return buildCourseProgress(user.getId(), lesson.getChapter().getCourse());
    }

    @Override
    @Transactional(readOnly = true)
    public ProgressDashboardResponse getTeacherDashboard(String email) {
        User teacher = getUser(email);
        var courses = courseRepository.findByTeacherIdAndDeletedAtIsNullOrderByUpdatedAtDesc(teacher.getId(), PageRequest.of(0, 200)).getContent();
        var attempts = attemptRepository.findByTestCourseTeacherIdOrExerciseCourseTeacherIdOrderByStartedAtDesc(
                teacher.getId(), teacher.getId(), PageRequest.of(0, 500)
        ).getContent();
        return ProgressDashboardResponse.builder()
                .activeCourses(courses.size())
                .startedLessons(attempts.size())
                .completedLessons(attempts.stream().filter(item -> item.getSubmittedAt() != null).count())
                .studyTimeMinutes(0)
                .streakDays(0)
                .strongestSkill(resolveSkill(attempts, true))
                .weakestSkill(resolveSkill(attempts, false))
                .weeklyChart(buildAttemptWeeklyChart(attempts))
                .monthlyChart(buildAttemptMonthlyChart(attempts))
                .courses(List.of())
                .build();
    }

    private LearningProgress getOrCreateProgress(User user, Lesson lesson) {
        return progressRepository.findByUserIdAndLessonId(user.getId(), lesson.getId()).orElseGet(() -> {
            LearningProgress progress = new LearningProgress();
            progress.setUser(user);
            progress.setCourse(lesson.getChapter().getCourse());
            progress.setLesson(lesson);
            return progress;
        });
    }

    private CourseProgressResponse buildCourseProgress(Long userId, Course course) {
        List<Lesson> orderedLessons = lessonRepository.findCourseLessonsInLearningOrder(course.getId());
        long totalLessons = orderedLessons.size();
        List<LearningProgress> items = progressRepository.findByUserIdAndCourseId(userId, course.getId());
        long started = items.stream().filter(item -> item.getStatus() != LearningProgress.ProgressStatus.NOT_STARTED).count();
        long completed = items.stream().filter(this::isFullCompletion).count();
        Integer studyTime = items.stream().mapToInt(item -> safe(item.getStudyTimeMinutes())).sum();
        BigDecimal percent = totalLessons == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(completed).multiply(new BigDecimal("100")).divide(BigDecimal.valueOf(totalLessons), 2, RoundingMode.HALF_UP);
        Lesson nextLesson = orderedLessons.stream()
                .filter(lesson -> items.stream().noneMatch(item -> item.getLesson().getId().equals(lesson.getId())
                        && isFullCompletion(item)))
                .findFirst()
                .orElse(null);
        LocalDateTime lastAccessedAt = items.stream()
                .map(LearningProgress::getLastAccessedAt)
                .filter(java.util.Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        return CourseProgressResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalLessons(totalLessons)
                .startedLessons(started)
                .completedLessons(completed)
                .progressPercent(percent)
                .studyTimeMinutes(studyTime)
                .nextLessonTitle(nextLesson == null ? null : nextLesson.getTitle())
                .nextLessonId(nextLesson == null ? null : nextLesson.getId())
                .nextChapterTitle(nextLesson == null ? null : nextLesson.getChapter().getTitle())
                .thumbnailUrl(course.getThumbnailUrl())
                .lastAccessedAt(lastAccessedAt)
                .completed(totalLessons > 0 && completed == totalLessons)
                .build();
    }

    private void ensureLessonUnlocked(User user, Lesson lesson, boolean previewOnly) {
        if (previewOnly || Boolean.TRUE.equals(lesson.getPreview()) || "ADMIN".equals(user.getRole().getCode())) {
            return;
        }
        List<Lesson> ordered = lessonRepository.findCourseLessonsInLearningOrder(lesson.getChapter().getCourse().getId());
        int current = java.util.stream.IntStream.range(0, ordered.size())
                .filter(index -> ordered.get(index).getId().equals(lesson.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        if (current == 0) {
            return;
        }
        Lesson previous = ordered.get(current - 1);
        boolean completed = progressRepository.findByUserIdAndLessonId(user.getId(), previous.getId())
                .map(this::isFullCompletion)
                .orElse(false);
        if (!completed) {
            throw new ForbiddenException("Hoàn thành bài ‘" + previous.getTitle() + "’ để mở khóa bài này.");
        }
    }

    private void recordActivity(LearningProgress progress, Lesson lesson, LessonProgressRequest request) {
        LocalDateTime now = LocalDateTime.now();
        int previousSeconds = safe(progress.getStudyTimeSeconds());
        int elapsed = 0;
        if (progress.getLastAccessedAt() != null) {
            long heartbeatGap = Duration.between(progress.getLastAccessedAt(), now).getSeconds();
            if (heartbeatGap > 0 && heartbeatGap <= 45) {
                elapsed = (int) Math.min(30, heartbeatGap);
            }
        }
        int totalSeconds = previousSeconds + elapsed;
        progress.setStudyTimeSeconds(totalSeconds);
        progress.setStudyTimeMinutes(Math.max(safe(progress.getStudyTimeMinutes()), totalSeconds / 60));
        progress.setLastAccessedAt(now);

        BigDecimal requestedDuration = positive(request.getMediaDurationSeconds());
        if (requestedDuration.compareTo(BigDecimal.ZERO) > 0) {
            progress.setMediaDurationSeconds(requestedDuration);
        }
        BigDecimal duration = positive(progress.getMediaDurationSeconds());
        BigDecimal requestedPosition = positive(request.getMediaPositionSeconds());
        if (duration.compareTo(BigDecimal.ZERO) > 0) {
            requestedPosition = requestedPosition.min(duration);
        }
        progress.setMediaPositionSeconds(safeDecimal(progress.getMediaPositionSeconds()).max(requestedPosition));

        BigDecimal requestedPercent = boundedPercent(request.getContentProgressPercent());
        if (duration.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal positionPercent = requestedPosition.multiply(new BigDecimal("100"))
                    .divide(duration, 2, RoundingMode.HALF_UP);
            requestedPercent = requestedPercent.max(positionPercent);
        }
        int minimumSeconds = duration.compareTo(BigDecimal.ZERO) > 0
                ? Math.max(30, duration.setScale(0, RoundingMode.CEILING).intValue())
                : 30;
        BigDecimal serverAllowed = BigDecimal.valueOf(totalSeconds)
                .multiply(new BigDecimal("100"))
                .divide(BigDecimal.valueOf(minimumSeconds), 2, RoundingMode.HALF_UP)
                .add(new BigDecimal("5"))
                .min(new BigDecimal("100"));
        BigDecimal accepted = requestedPercent.min(serverAllowed);
        progress.setContentProgressPercent(safeDecimal(progress.getContentProgressPercent()).max(accepted));
        if (progress.getStatus() != LearningProgress.ProgressStatus.COMPLETED) {
            progress.setProgressPercent(progress.getContentProgressPercent());
        }
    }

    private boolean answersMatch(String submitted, String expected) {
        if (expected == null || expected.isBlank()) {
            return submitted != null && !submitted.isBlank();
        }
        return normalizeAnswer(submitted).equals(normalizeAnswer(expected));
    }

    private String normalizeAnswer(String value) {
        return value == null ? "" : java.text.Normalizer.normalize(value.trim().toLowerCase(), java.text.Normalizer.Form.NFC)
                .replaceAll("\\s+", " ");
    }

    private BigDecimal positive(BigDecimal value) {
        return value == null || value.signum() < 0 ? BigDecimal.ZERO : value;
    }

    private BigDecimal boundedPercent(BigDecimal value) {
        return positive(value).min(new BigDecimal("100"));
    }

    private BigDecimal safeDecimal(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private BigDecimal averageScore(List<TestAttempt> attempts) {
        List<BigDecimal> scores = attempts.stream().map(TestAttempt::getScore).filter(java.util.Objects::nonNull).toList();
        return scores.isEmpty() ? BigDecimal.ZERO : scores.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP);
    }

    private boolean ensureCourseAccess(User user, Course course, boolean allowPreview) {
        boolean freeAccess = course.getCourseType() == Course.CourseType.FREE
                && enrollmentRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), course.getId(), CourseEnrollment.EnrollmentStatus.ACTIVE);
        boolean paidAccess = course.getCourseType() == Course.CourseType.PAID
                && ownershipRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), course.getId(), CourseOwnership.OwnershipStatus.ACTIVE);
        if (freeAccess || paidAccess || "ADMIN".equals(user.getRole().getCode())) {
            return false;
        }
        if (allowPreview) {
            return true;
        }
        throw new UnauthorizedException("You do not have access to this course");
    }

    private boolean hasCourseAccess(User user, Course course) {
        boolean freeAccess = course.getCourseType() == Course.CourseType.FREE
                && enrollmentRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), course.getId(), CourseEnrollment.EnrollmentStatus.ACTIVE);
        boolean paidAccess = course.getCourseType() == Course.CourseType.PAID
                && ownershipRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), course.getId(), CourseOwnership.OwnershipStatus.ACTIVE);
        return freeAccess || paidAccess || "ADMIN".equals(user.getRole().getCode());
    }

    private boolean isFullCompletion(LearningProgress progress) {
        return progress.getStatus() == LearningProgress.ProgressStatus.COMPLETED
                && !Boolean.TRUE.equals(progress.getPreviewOnly());
    }

    private Integer calculateStreak(Long userId) {
        int streak = 0;
        LocalDate day = LocalDate.now();
        while (true) {
            LocalDateTime start = day.atStartOfDay();
            LocalDateTime end = day.plusDays(1).atStartOfDay();
            if (progressRepository.countByUserIdAndLastAccessedAtBetween(userId, start, end) == 0) {
                return streak;
            }
            streak++;
            day = day.minusDays(1);
        }
    }

    private List<ChartPointResponse> buildWeeklyChart(Long userId) {
        LocalDate today = LocalDate.now();
        return java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> today.minusDays(6L - offset))
                .map(day -> ChartPointResponse.builder()
                        .label(day.toString())
                        .value(progressRepository.countByUserIdAndLastAccessedAtBetween(userId, day.atStartOfDay(), day.plusDays(1).atStartOfDay()))
                        .build())
                .toList();
    }

    private List<ChartPointResponse> buildMonthlyChart(Long userId) {
        YearMonth month = YearMonth.now();
        return java.util.stream.IntStream.rangeClosed(1, month.lengthOfMonth())
                .mapToObj(month::atDay)
                .map(day -> ChartPointResponse.builder()
                        .label(String.valueOf(day.getDayOfMonth()))
                        .value(progressRepository.countByUserIdAndLastAccessedAtBetween(userId, day.atStartOfDay(), day.plusDays(1).atStartOfDay()))
                        .build())
                .toList();
    }

    private List<ChartPointResponse> buildAttemptWeeklyChart(List<TestAttempt> attempts) {
        LocalDate today = LocalDate.now();
        return java.util.stream.IntStream.rangeClosed(0, 6)
                .mapToObj(offset -> today.minusDays(6L - offset))
                .map(day -> ChartPointResponse.builder()
                        .label(day.toString())
                        .value(attempts.stream().filter(item -> sameDay(item.getStartedAt(), day)).count())
                        .build())
                .toList();
    }

    private List<ChartPointResponse> buildAttemptMonthlyChart(List<TestAttempt> attempts) {
        YearMonth month = YearMonth.now();
        return java.util.stream.IntStream.rangeClosed(1, month.lengthOfMonth())
                .mapToObj(month::atDay)
                .map(day -> ChartPointResponse.builder()
                        .label(String.valueOf(day.getDayOfMonth()))
                        .value(attempts.stream().filter(item -> sameDay(item.getStartedAt(), day)).count())
                        .build())
                .toList();
    }

    private SkillProgressResponse resolveSkill(List<TestAttempt> attempts, boolean strongest) {
        Map<String, List<TestAttempt>> bySkill = new LinkedHashMap<>();
        for (TestAttempt attempt : attempts) {
            if (attempt.getScore() == null) continue;
            String skill = attempt.getExercise() == null ? "TEST" : attempt.getExercise().getExerciseType().name();
            bySkill.computeIfAbsent(skill, key -> new java.util.ArrayList<>()).add(attempt);
        }
        return bySkill.entrySet().stream()
                .map(entry -> SkillProgressResponse.builder()
                        .skill(entry.getKey())
                        .attempts(entry.getValue().size())
                        .averageScore(entry.getValue().stream()
                                .map(TestAttempt::getScore)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .divide(BigDecimal.valueOf(entry.getValue().size()), 2, RoundingMode.HALF_UP))
                        .build())
                .sorted(strongest
                        ? Comparator.comparing(SkillProgressResponse::getAverageScore).reversed()
                        : Comparator.comparing(SkillProgressResponse::getAverageScore))
                .findFirst()
                .orElse(null);
    }

    private boolean sameDay(LocalDateTime value, LocalDate day) {
        return value != null && value.toLocalDate().equals(day);
    }

    private Lesson getLesson(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
    }

    private Course getCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UnauthorizedException("Authentication is required"));
    }

    private int safe(Integer value) {
        return value == null ? 0 : value;
    }
}
