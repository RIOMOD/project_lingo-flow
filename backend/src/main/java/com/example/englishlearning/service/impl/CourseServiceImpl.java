package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.course.ChapterRequest;
import com.example.englishlearning.dto.course.ChapterResponse;
import com.example.englishlearning.dto.course.CourseAccessResponse;
import com.example.englishlearning.dto.course.CourseDetailResponse;
import com.example.englishlearning.dto.course.CourseRequest;
import com.example.englishlearning.dto.course.CourseSummaryResponse;
import com.example.englishlearning.dto.course.LessonRequest;
import com.example.englishlearning.dto.course.LessonResponse;
import com.example.englishlearning.dto.course.RejectCourseRequest;
import com.example.englishlearning.entity.Chapter;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.CourseEnrollment;
import com.example.englishlearning.entity.CourseOwnership;
import com.example.englishlearning.entity.CourseReviewHistory;
import com.example.englishlearning.entity.Lesson;
import com.example.englishlearning.entity.LearningProgress;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ForbiddenException;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.exception.UnauthorizedException;
import com.example.englishlearning.repository.ChapterRepository;
import com.example.englishlearning.repository.CourseEnrollmentRepository;
import com.example.englishlearning.repository.CourseOwnershipRepository;
import com.example.englishlearning.repository.CourseRepository;
import com.example.englishlearning.repository.CourseReviewHistoryRepository;
import com.example.englishlearning.repository.LearningProgressRepository;
import com.example.englishlearning.repository.LessonRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.service.AuditLogService;
import com.example.englishlearning.service.CourseService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final ChapterRepository chapterRepository;
    private final LessonRepository lessonRepository;
    private final CourseOwnershipRepository courseOwnershipRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final UserRepository userRepository;
    private final LearningProgressRepository learningProgressRepository;
    private final CourseReviewHistoryRepository courseReviewHistoryRepository;
    private final AuditLogService auditLogService;

    public CourseServiceImpl(
            CourseRepository courseRepository,
            ChapterRepository chapterRepository,
            LessonRepository lessonRepository,
            CourseOwnershipRepository courseOwnershipRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            UserRepository userRepository,
            LearningProgressRepository learningProgressRepository,
            CourseReviewHistoryRepository courseReviewHistoryRepository,
            AuditLogService auditLogService
    ) {
        this.courseRepository = courseRepository;
        this.chapterRepository = chapterRepository;
        this.lessonRepository = lessonRepository;
        this.courseOwnershipRepository = courseOwnershipRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.userRepository = userRepository;
        this.learningProgressRepository = learningProgressRepository;
        this.courseReviewHistoryRepository = courseReviewHistoryRepository;
        this.auditLogService = auditLogService;
    }

    // ──────────────────────────────── PUBLIC / GUEST ────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseSummaryResponse> getPublishedCourses(String search, Course.CourseLevel level, Course.CourseType courseType, Pageable pageable) {
        Page<CourseSummaryResponse> page = courseRepository
                .searchPublished(Course.CourseStatus.PUBLISHED, blankToNull(search), level, courseType, pageable)
                .map(this::toSummary);
        return PageResponse.from(page);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDetailResponse getPublishedCourseBySlug(String slug) {
        Course course = getCourseBySlug(slug);
        if (course.getStatus() != Course.CourseStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Course not found");
        }
        return toDetail(course);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getCourseChapters(Long courseId, String currentEmail) {
        Course course = getActiveCourse(courseId);
        if (course.getStatus() != Course.CourseStatus.PUBLISHED) {
            throw new ResourceNotFoundException("Course not found");
        }
        Map<Long, LessonAccessState> access = buildLessonAccess(course, currentEmail);
        return chapterRepository.findByCourseIdAndDeletedAtIsNullOrderByPositionAsc(courseId)
                .stream()
                .map(chapter -> toChapter(chapter, access))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LessonResponse getLesson(Long courseId, Long lessonId, String currentEmail) {
        Lesson lesson = lessonRepository.findByIdAndChapterCourseIdAndDeletedAtIsNull(lessonId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        boolean courseAccess = hasCourseAccess(currentEmail, courseId);
        boolean allowed = Boolean.TRUE.equals(lesson.getPreview()) || courseAccess;
        if (!allowed) {
            throw new ForbiddenException("Bạn chưa có quyền học khóa học này.");
        }
        LessonAccessState state = buildLessonAccess(lesson.getChapter().getCourse(), currentEmail).get(lessonId);
        if (courseAccess && state != null && state.locked()) {
            throw new ForbiddenException(state.lockReason());
        }
        return toLesson(lesson, state == null ? new LessonAccessState(false, null, null) : state);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseAccessResponse getAccess(Long courseId, String currentEmail) {
        Course course = getActiveCourse(courseId);
        boolean owned = hasCourseAccess(currentEmail, courseId);
        return buildAccess(course, owned);
    }

    @Override
    public CourseAccessResponse enrollFree(Long courseId, String currentEmail) {
        Course course = getActiveCourse(courseId);
        User user = getUserByEmail(currentEmail);
        if (course.getStatus() != Course.CourseStatus.PUBLISHED) {
            throw new BadRequestException("Course is not published");
        }
        if (course.getCourseType() != Course.CourseType.FREE) {
            throw new BadRequestException("Only free courses can be enrolled here");
        }
        if (!ownsCourse(user.getId(), courseId) && courseOwnershipRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new BadRequestException("Course ownership already exists");
        }
        if (!ownsCourse(user.getId(), courseId)) {
            CourseOwnership ownership = new CourseOwnership();
            ownership.setUser(user);
            ownership.setCourse(course);
            ownership.setOwnershipType(CourseOwnership.OwnershipType.FREE);
            ownership.setStatus(CourseOwnership.OwnershipStatus.ACTIVE);
            ownership.setGrantedAt(LocalDateTime.now());
            courseOwnershipRepository.save(ownership);
        }
        if (!courseEnrollmentRepository.existsByUserIdAndCourseIdAndStatus(user.getId(), courseId, CourseEnrollment.EnrollmentStatus.ACTIVE)) {
            CourseEnrollment enrollment = new CourseEnrollment();
            enrollment.setUser(user);
            enrollment.setCourse(course);
            enrollment.setEnrolledAt(LocalDateTime.now());
            enrollment.setStatus(CourseEnrollment.EnrollmentStatus.ACTIVE);
            courseEnrollmentRepository.save(enrollment);
        }
        return buildAccess(course, true);
    }

    // ──────────────────────────────── TEACHER ────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseSummaryResponse> getTeacherCourses(String teacherEmail, Pageable pageable) {
        User teacher = getUserByEmail(teacherEmail);
        return PageResponse.from(courseRepository
                .findByTeacherIdAndDeletedAtIsNullOrderByUpdatedAtDesc(teacher.getId(), pageable)
                .map(this::toSummary));
    }

    @Override
    public CourseDetailResponse createCourse(CourseRequest request, String teacherEmail) {
        User teacher = getUserByEmail(teacherEmail);
        Course course = new Course();
        course.setTeacher(teacher);
        applyCourseRequest(course, request);
        course.setSlug(resolveUniqueSlug(request.getSlug(), request.getTitle(), null));
        course.setStatus(Course.CourseStatus.DRAFT);
        return toDetail(courseRepository.save(course));
    }

    @Override
    public CourseDetailResponse updateCourse(Long courseId, CourseRequest request, String teacherEmail) {
        Course course = getTeacherCourse(courseId, teacherEmail);
        if (course.getStatus() == Course.CourseStatus.PUBLISHED || course.getStatus() == Course.CourseStatus.ARCHIVED) {
            throw new BadRequestException("Published or archived course cannot be edited here");
        }
        applyCourseRequest(course, request);
        course.setSlug(resolveUniqueSlug(request.getSlug(), request.getTitle(), course.getId()));
        return toDetail(courseRepository.save(course));
    }

    @Override
    public void deleteTeacherCourse(Long courseId, String teacherEmail) {
        Course course = getTeacherCourse(courseId, teacherEmail);
        if (course.getStatus() == Course.CourseStatus.PUBLISHED) {
            throw new BadRequestException("Published course cannot be deleted by teacher");
        }
        course.setDeletedAt(LocalDateTime.now());
        courseRepository.save(course);
    }

    @Override
    public CourseDetailResponse submitReview(Long courseId, String teacherEmail) {
        Course course = getTeacherCourse(courseId, teacherEmail);
        if (course.getStatus() != Course.CourseStatus.DRAFT && course.getStatus() != Course.CourseStatus.REJECTED) {
            throw new BadRequestException("Only draft or rejected courses can be submitted");
        }
        course.setStatus(Course.CourseStatus.SUBMITTED);
        return toDetail(courseRepository.save(course));
    }

    @Override
    public ChapterResponse createChapter(Long courseId, ChapterRequest request, String teacherEmail) {
        Course course = getTeacherCourse(courseId, teacherEmail);
        Chapter chapter = new Chapter();
        chapter.setCourse(course);
        applyChapterRequest(chapter, request);
        return toChapter(chapterRepository.save(chapter), false);
    }

    @Override
    public ChapterResponse updateChapter(Long chapterId, ChapterRequest request, String teacherEmail) {
        Chapter chapter = getChapter(chapterId);
        ensureTeacherOwner(chapter.getCourse(), teacherEmail);
        applyChapterRequest(chapter, request);
        return toChapter(chapterRepository.save(chapter), false);
    }

    @Override
    public LessonResponse createLesson(Long chapterId, LessonRequest request, String teacherEmail) {
        Chapter chapter = getChapter(chapterId);
        ensureTeacherOwner(chapter.getCourse(), teacherEmail);
        Lesson lesson = new Lesson();
        lesson.setChapter(chapter);
        applyLessonRequest(lesson, request);
        return toLesson(lessonRepository.save(lesson), false);
    }

    @Override
    public LessonResponse updateLesson(Long lessonId, LessonRequest request, String teacherEmail) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        ensureTeacherOwner(lesson.getChapter().getCourse(), teacherEmail);
        applyLessonRequest(lesson, request);
        return toLesson(lessonRepository.save(lesson), false);
    }

    @Override
    public void deleteChapter(Long chapterId, String teacherEmail) {
        Chapter chapter = getChapter(chapterId);
        ensureTeacherOwner(chapter.getCourse(), teacherEmail);
        chapter.setDeletedAt(LocalDateTime.now());
        chapterRepository.save(chapter);
    }

    @Override
    public void deleteLesson(Long lessonId, String teacherEmail) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson not found"));
        if (lesson.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Lesson not found");
        }
        ensureTeacherOwner(lesson.getChapter().getCourse(), teacherEmail);
        lesson.setDeletedAt(LocalDateTime.now());
        lessonRepository.save(lesson);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChapterResponse> getTeacherCourseChapters(Long courseId, String teacherEmail) {
        Course course = getTeacherCourse(courseId, teacherEmail);
        return chapterRepository.findByCourseIdAndDeletedAtIsNullOrderByPositionAsc(courseId)
                .stream()
                .map(chapter -> toChapter(chapter, false))
                .toList();
    }

    // ──────────────────────────────── ADMIN ────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CourseSummaryResponse> getAdminCourses(Course.CourseStatus status, Pageable pageable) {
        Course.CourseStatus targetStatus = status == null ? Course.CourseStatus.SUBMITTED : status;
        return PageResponse.from(courseRepository
                .findByStatusAndDeletedAtIsNullOrderByUpdatedAtDesc(targetStatus, pageable)
                .map(this::toSummary));
    }

    @Override
    public CourseDetailResponse approveCourse(Long courseId) {
        Course course = getActiveCourse(courseId);
        if (course.getStatus() != Course.CourseStatus.SUBMITTED) {
            throw new BadRequestException("Only submitted courses can be approved");
        }
        course.setStatus(Course.CourseStatus.APPROVED);
        course = courseRepository.save(course);

        saveReviewHistory(course, CourseReviewHistory.ReviewAction.APPROVE, null);
        auditLogService.logAction("APPROVE_COURSE", "COURSE", course.getId(), "SUBMITTED", "APPROVED", "Admin approved course");

        return toDetail(course);
    }

    @Override
    public CourseDetailResponse rejectCourse(Long courseId, RejectCourseRequest request) {
        Course course = getActiveCourse(courseId);
        if (course.getStatus() != Course.CourseStatus.SUBMITTED && course.getStatus() != Course.CourseStatus.APPROVED) {
            throw new BadRequestException("Only submitted or approved courses can be rejected");
        }
        String oldStatus = course.getStatus().name();
        course.setStatus(Course.CourseStatus.REJECTED);
        course = courseRepository.save(course);

        String reason = request != null ? request.getReason() : null;
        saveReviewHistory(course, CourseReviewHistory.ReviewAction.REJECT, reason);
        auditLogService.logAction("REJECT_COURSE", "COURSE", course.getId(), oldStatus, "REJECTED", reason);

        return toDetail(course);
    }

    @Override
    public CourseDetailResponse publishCourse(Long courseId) {
        Course course = getActiveCourse(courseId);
        if (course.getStatus() != Course.CourseStatus.APPROVED && course.getStatus() != Course.CourseStatus.HIDDEN) {
            throw new BadRequestException("Only approved or hidden courses can be published");
        }
        String oldStatus = course.getStatus().name();
        course.setStatus(Course.CourseStatus.PUBLISHED);
        course.setPublishedAt(LocalDateTime.now());
        course = courseRepository.save(course);

        auditLogService.logAction("PUBLISH_COURSE", "COURSE", course.getId(), oldStatus, "PUBLISHED", "Admin published course");

        return toDetail(course);
    }

    @Override
    public CourseDetailResponse hideCourse(Long courseId) {
        Course course = getActiveCourse(courseId);
        if (course.getStatus() != Course.CourseStatus.PUBLISHED) {
            throw new BadRequestException("Only published courses can be hidden");
        }
        course.setStatus(Course.CourseStatus.HIDDEN);
        course = courseRepository.save(course);

        auditLogService.logAction("HIDE_COURSE", "COURSE", course.getId(), "PUBLISHED", "HIDDEN", "Admin hidden course");

        return toDetail(course);
    }

    @Override
    public CourseDetailResponse archiveCourse(Long courseId) {
        Course course = getActiveCourse(courseId);
        String oldStatus = course.getStatus().name();
        course.setStatus(Course.CourseStatus.ARCHIVED);
        course = courseRepository.save(course);

        auditLogService.logAction("ARCHIVE_COURSE", "COURSE", course.getId(), oldStatus, "ARCHIVED", "Admin archived course");

        return toDetail(course);
    }

    // ──────────────────────────────── PRIVATE HELPERS ────────────────────────────────

    private void saveReviewHistory(Course course, CourseReviewHistory.ReviewAction action, String reason) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User admin = userRepository.findByEmailAndDeletedAtIsNull(email).orElse(null);
            if (admin != null) {
                CourseReviewHistory history = new CourseReviewHistory();
                history.setCourse(course);
                history.setAdmin(admin);
                history.setAction(action);
                history.setReason(reason);
                courseReviewHistoryRepository.save(history);
            }
        } catch (Exception ignored) {
            // Non-critical; don't fail the main operation
        }
    }

    private void applyCourseRequest(Course course, CourseRequest request) {
        validatePrice(request);
        course.setTitle(request.getTitle().trim());
        course.setShortDescription(request.getShortDescription());
        course.setDescription(request.getDescription());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setLevel(request.getLevel());
        course.setCourseType(request.getCourseType());
        course.setOriginalPrice(normalizePrice(request.getOriginalPrice()));
        course.setSalePrice(normalizePrice(request.getSalePrice()));
        course.setSaleStartAt(request.getSaleStartAt());
        course.setSaleEndAt(request.getSaleEndAt());
    }

    private void applyChapterRequest(Chapter chapter, ChapterRequest request) {
        chapter.setTitle(request.getTitle().trim());
        chapter.setDescription(request.getDescription());
        chapter.setPosition(request.getPosition());
    }

    private void applyLessonRequest(Lesson lesson, LessonRequest request) {
        lesson.setTitle(request.getTitle().trim());
        lesson.setLessonType(request.getLessonType());
        lesson.setContent(request.getContent());
        lesson.setAudioUrl(request.getAudioUrl());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setPosition(request.getPosition());
        lesson.setDurationMinutes(request.getDurationMinutes());
        lesson.setPreview(Boolean.TRUE.equals(request.getPreview()));
        lesson.setStatus(request.getStatus() == null ? Lesson.LessonStatus.DRAFT : request.getStatus());
    }

    private void validatePrice(CourseRequest request) {
        if (request.getCourseType() == Course.CourseType.FREE) {
            return;
        }
        BigDecimal originalPrice = normalizePrice(request.getOriginalPrice());
        if (originalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Paid course must have original price greater than zero");
        }
        if (request.getSaleStartAt() != null && request.getSaleEndAt() != null
                && request.getSaleEndAt().isBefore(request.getSaleStartAt())) {
            throw new BadRequestException("Sale end time must be after sale start time");
        }
    }

    private CourseAccessResponse buildAccess(Course course, boolean owned) {
        boolean canEnrollFree = !owned && course.getStatus() == Course.CourseStatus.PUBLISHED
                && course.getCourseType() == Course.CourseType.FREE;
        boolean canBuy = !owned && course.getStatus() == Course.CourseStatus.PUBLISHED
                && course.getCourseType() == Course.CourseType.PAID;
        String actionLabel = owned ? "Continue learning" : canEnrollFree ? "Enroll free" : canBuy ? "Buy course" : "Preview";
        return CourseAccessResponse.builder()
                .courseId(course.getId())
                .owned(owned)
                .canPreview(true)
                .canEnrollFree(canEnrollFree)
                .canBuy(canBuy)
                .actionLabel(actionLabel)
                .build();
    }

    private Course getTeacherCourse(Long courseId, String teacherEmail) {
        Course course = getActiveCourse(courseId);
        ensureTeacherOwner(course, teacherEmail);
        return course;
    }

    private void ensureTeacherOwner(Course course, String teacherEmail) {
        User teacher = getUserByEmail(teacherEmail);
        if (!course.getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedException("You can only manage your own courses");
        }
    }

    private boolean hasCourseAccess(String email, Long courseId) {
        if (!StringUtils.hasText(email)) {
            return false;
        }
        User user = getUserByEmail(email);
        return ownsCourse(user.getId(), courseId)
                || courseEnrollmentRepository.existsByUserIdAndCourseIdAndStatus(
                        user.getId(), courseId, CourseEnrollment.EnrollmentStatus.ACTIVE)
                || "ADMIN".equals(user.getRole().getCode());
    }

    private boolean ownsCourse(Long userId, Long courseId) {
        return courseOwnershipRepository.existsByUserIdAndCourseIdAndStatus(
                userId,
                courseId,
                CourseOwnership.OwnershipStatus.ACTIVE
        );
    }

    private User getUserByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new UnauthorizedException("Authentication is required");
        }
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UnauthorizedException("Authentication is required"));
    }

    private Course getActiveCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (course.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Course not found");
        }
        return course;
    }

    private Course getCourseBySlug(String slug) {
        if (slug != null && slug.matches("\\d+")) {
            Long id = Long.parseLong(slug);
            return courseRepository.findById(id)
                    .filter(c -> c.getDeletedAt() == null)
                    .orElseGet(() -> courseRepository.findBySlugAndDeletedAtIsNull(slug)
                            .orElseThrow(() -> new ResourceNotFoundException("Course not found")));
        }
        return courseRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
    }

    private Chapter getChapter(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter not found"));
        if (chapter.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Chapter not found");
        }
        return chapter;
    }

    private CourseSummaryResponse toSummary(Course course) {
        return CourseSummaryResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .shortDescription(course.getShortDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .level(course.getLevel())
                .courseType(course.getCourseType())
                .originalPrice(course.getOriginalPrice())
                .salePrice(course.getSalePrice())
                .status(course.getStatus())
                .teacherName(course.getTeacher().getFullName())
                .build();
    }

    private CourseDetailResponse toDetail(Course course) {
        return CourseDetailResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .shortDescription(course.getShortDescription())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .level(course.getLevel())
                .courseType(course.getCourseType())
                .originalPrice(course.getOriginalPrice())
                .salePrice(course.getSalePrice())
                .saleStartAt(course.getSaleStartAt())
                .saleEndAt(course.getSaleEndAt())
                .status(course.getStatus())
                .publishedAt(course.getPublishedAt())
                .teacherId(course.getTeacher().getId())
                .teacherName(course.getTeacher().getFullName())
                .build();
    }

    private ChapterResponse toChapter(Chapter chapter, Map<Long, LessonAccessState> access) {
        List<LessonResponse> lessons = lessonRepository.findByChapterIdAndDeletedAtIsNullOrderByPositionAsc(chapter.getId())
                .stream()
                .map(lesson -> toLesson(lesson, access.getOrDefault(lesson.getId(),
                        new LessonAccessState(true, "Bài học chưa được mở.", null))))
                .toList();
        return ChapterResponse.builder()
                .id(chapter.getId())
                .courseId(chapter.getCourse().getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .position(chapter.getPosition())
                .status(chapter.getStatus())
                .lessons(lessons)
                .build();
    }

    private ChapterResponse toChapter(Chapter chapter, boolean hideLockedLessonContent) {
        Map<Long, LessonAccessState> access = new HashMap<>();
        lessonRepository.findByChapterIdAndDeletedAtIsNullOrderByPositionAsc(chapter.getId())
                .forEach(lesson -> access.put(lesson.getId(), new LessonAccessState(
                        hideLockedLessonContent && !Boolean.TRUE.equals(lesson.getPreview()), null, null)));
        return toChapter(chapter, access);
    }

    private LessonResponse toLesson(Lesson lesson, boolean locked) {
        return toLesson(lesson, new LessonAccessState(locked, locked ? "Bài học chưa được mở." : null, null));
    }

    private LessonResponse toLesson(Lesson lesson, LessonAccessState access) {
        boolean locked = access.locked();
        LearningProgress progress = access.progress();
        // Derive mediaDurationSeconds from progress (actual played duration) or convert durationMinutes as fallback
        java.math.BigDecimal mediaDurationSecs = BigDecimal.ZERO;
        if (progress != null && progress.getMediaDurationSeconds() != null
                && progress.getMediaDurationSeconds().compareTo(BigDecimal.ZERO) > 0) {
            mediaDurationSecs = progress.getMediaDurationSeconds();
        } else if (lesson.getDurationMinutes() != null && lesson.getDurationMinutes() > 0) {
            mediaDurationSecs = BigDecimal.valueOf(lesson.getDurationMinutes() * 60L);
        }
        return LessonResponse.builder()
                .id(lesson.getId())
                .chapterId(lesson.getChapter().getId())
                .courseId(lesson.getChapter().getCourse().getId())
                .title(lesson.getTitle())
                .lessonType(lesson.getLessonType())
                .content(locked ? null : lesson.getContent())
                .audioUrl(locked ? null : lesson.getAudioUrl())
                .videoUrl(locked ? null : lesson.getVideoUrl())
                .position(lesson.getPosition())
                .durationMinutes(lesson.getDurationMinutes())
                .preview(lesson.getPreview())
                .status(lesson.getStatus())
                .locked(locked)
                .lockReason(access.lockReason())
                .progressStatus(progress == null ? "NOT_STARTED" : progress.getStatus().name())
                .contentProgressPercent(progress == null ? BigDecimal.ZERO : progress.getContentProgressPercent())
                .mediaPositionSeconds(progress == null ? BigDecimal.ZERO : progress.getMediaPositionSeconds())
                .mediaDurationSeconds(mediaDurationSecs)
                .checkpointPassed(progress != null && Boolean.TRUE.equals(progress.getCheckpointPassed()))
                .checkpointQuestion(locked ? null : lesson.getCheckpointQuestion())
                // Expose answer to enrolled users so frontend can validate instantly without roundtrip
                .checkpointAnswer(locked ? null : lesson.getCheckpointAnswer())
                // Always show explanation once lesson starts (helps retries)
                .checkpointExplanation(locked ? null : lesson.getCheckpointExplanation())
                .build();
    }

    private Map<Long, LessonAccessState> buildLessonAccess(Course course, String email) {
        Map<Long, LessonAccessState> result = new HashMap<>();
        List<Lesson> ordered = lessonRepository.findCourseLessonsInLearningOrder(course.getId());
        User user = StringUtils.hasText(email) ? getUserByEmail(email) : null;
        boolean owns = user != null && hasCourseAccess(email, course.getId());
        Map<Long, LearningProgress> progressByLesson = new HashMap<>();
        if (user != null) {
            learningProgressRepository.findByUserIdAndCourseId(user.getId(), course.getId())
                    .forEach(item -> progressByLesson.put(item.getLesson().getId(), item));
        }

        Lesson previous = null;
        for (Lesson lesson : ordered) {
            LearningProgress progress = progressByLesson.get(lesson.getId());
            boolean preview = Boolean.TRUE.equals(lesson.getPreview());
            boolean unlocked = preview || (owns && (previous == null || isCompleted(progressByLesson.get(previous.getId()))));
            String reason = null;
            if (!unlocked) {
                reason = owns && previous != null
                        ? "Hoàn thành bài '" + previous.getTitle() + "' để mở khóa bài này."
                        : "Bạn chưa có quyền học bài này.";
            }
            result.put(lesson.getId(), new LessonAccessState(!unlocked, reason, progress));
            previous = lesson;
        }
        return result;
    }

    private boolean isCompleted(LearningProgress progress) {
        return progress != null && progress.getStatus() == LearningProgress.ProgressStatus.COMPLETED;
    }

    private record LessonAccessState(boolean locked, String lockReason, LearningProgress progress) {}

    private String resolveUniqueSlug(String requestedSlug, String title, Long currentCourseId) {
        String base = StringUtils.hasText(requestedSlug) ? requestedSlug : title;
        String slug = slugify(base);
        String candidate = slug;
        int suffix = 2;
        while (slugExistsForAnotherCourse(candidate, currentCourseId)) {
            candidate = slug + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    private boolean slugExistsForAnotherCourse(String slug, Long currentCourseId) {
        return courseRepository.findBySlugAndDeletedAtIsNull(slug)
                .map(course -> currentCourseId == null || !course.getId().equals(currentCourseId))
                .orElse(false);
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return StringUtils.hasText(normalized) ? normalized : "course";
    }

    private BigDecimal normalizePrice(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
