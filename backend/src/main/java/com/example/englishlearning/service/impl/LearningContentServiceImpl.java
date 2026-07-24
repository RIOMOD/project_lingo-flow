package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.learning.GrammarResponse;
import com.example.englishlearning.dto.learning.UpsertGrammarRequest;
import com.example.englishlearning.dto.learning.UpsertVocabularyRequest;
import com.example.englishlearning.dto.learning.VocabularyProgressRequest;
import com.example.englishlearning.dto.learning.VocabularyResponse;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.CourseOwnership;
import com.example.englishlearning.entity.GrammarTopic;
import com.example.englishlearning.entity.Lesson;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.entity.Vocabulary;
import com.example.englishlearning.entity.VocabularyProgress;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.exception.UnauthorizedException;
import com.example.englishlearning.repository.CourseRepository;
import com.example.englishlearning.repository.GrammarTopicRepository;
import com.example.englishlearning.repository.LessonRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.repository.VocabularyProgressRepository;
import com.example.englishlearning.repository.VocabularyRepository;
import com.example.englishlearning.service.LearningContentService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class LearningContentServiceImpl implements LearningContentService {

    private final VocabularyRepository vocabularyRepository;
    private final GrammarTopicRepository grammarTopicRepository;
    private final VocabularyProgressRepository progressRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;

    public LearningContentServiceImpl(
            VocabularyRepository vocabularyRepository,
            GrammarTopicRepository grammarTopicRepository,
            VocabularyProgressRepository progressRepository,
            CourseRepository courseRepository,
            LessonRepository lessonRepository,
            UserRepository userRepository
    ) {
        this.vocabularyRepository = vocabularyRepository;
        this.grammarTopicRepository = grammarTopicRepository;
        this.progressRepository = progressRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VocabularyResponse> getVocabularies(
            String email,
            Long courseId,
            Long lessonId,
            String search,
            Course.CourseLevel level,
            String topic,
            Pageable pageable
    ) {
        User user = getUser(email);
        boolean admin = "ADMIN".equals(user.getRole().getCode());
        boolean teacher = "TEACHER".equals(user.getRole().getCode());
        if (admin) {
            return PageResponse.from(vocabularyRepository.search(courseId, lessonId, blankToNull(search), level, blankToNull(topic), pageable)
                    .map(vocabulary -> toVocabularyResponse(vocabulary, findProgress(user.getId(), vocabulary.getId()))));
        }
        if (teacher) {
            return PageResponse.from(vocabularyRepository.searchTeacherContent(user.getId(), courseId, lessonId, blankToNull(search), level, blankToNull(topic), pageable)
                    .map(vocabulary -> toVocabularyResponse(vocabulary, findProgress(user.getId(), vocabulary.getId()))));
        }
        return PageResponse.from(vocabularyRepository.searchAccessible(user.getId(), courseId, lessonId, blankToNull(search), level, blankToNull(topic), CourseOwnership.OwnershipStatus.ACTIVE, pageable)
                .map(vocabulary -> toVocabularyResponse(vocabulary, findProgress(user.getId(), vocabulary.getId()))));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VocabularyResponse> getReviewVocabularies(String email, Pageable pageable) {
        User user = getUser(email);
        return PageResponse.from(progressRepository.findReviewDue(user.getId(), LocalDateTime.now(), pageable)
                .map(progress -> toVocabularyResponse(progress.getVocabulary(), progress)));
    }

    @Override
    public VocabularyResponse createVocabulary(String email, UpsertVocabularyRequest request) {
        User teacher = getUser(email);
        Course course = getEditableCourse(teacher, request.getCourseId());
        Vocabulary vocabulary = new Vocabulary();
        applyVocabulary(vocabulary, course, request);
        ensureVocabularyNotDuplicate(vocabulary, null);
        return toVocabularyResponse(vocabularyRepository.save(vocabulary), null);
    }

    @Override
    public VocabularyResponse updateVocabulary(String email, Long id, UpsertVocabularyRequest request) {
        User teacher = getUser(email);
        Vocabulary vocabulary = getVocabulary(id);
        getEditableCourse(teacher, vocabulary.getCourse().getId());
        Course course = getEditableCourse(teacher, request.getCourseId());
        applyVocabulary(vocabulary, course, request);
        ensureVocabularyNotDuplicate(vocabulary, vocabulary.getId());
        return toVocabularyResponse(vocabularyRepository.save(vocabulary), null);
    }

    @Override
    public void deleteVocabulary(String email, Long id) {
        User teacher = getUser(email);
        Vocabulary vocabulary = getVocabulary(id);
        getEditableCourse(teacher, vocabulary.getCourse().getId());
        vocabulary.setDeletedAt(LocalDateTime.now());
        vocabularyRepository.save(vocabulary);
    }

    @Override
    public VocabularyResponse updateVocabularyProgress(String email, Long vocabularyId, VocabularyProgressRequest request) {
        User user = getUser(email);
        Vocabulary vocabulary = getVocabulary(vocabularyId);
        ensureVocabularyAccess(user, vocabulary);
        VocabularyProgress progress = progressRepository.findByUserIdAndVocabularyId(user.getId(), vocabularyId)
                .orElseGet(() -> {
                    VocabularyProgress created = new VocabularyProgress();
                    created.setUser(user);
                    created.setVocabulary(vocabulary);
                    return created;
                });
        if (request.getFavorite() != null) {
            progress.setFavorite(request.getFavorite());
        }
        if (request.getAnsweredCorrect() != null) {
            applyAnswerProgress(progress, request.getAnsweredCorrect(), request.getResponseTimeMillis());
        }
        progress.setReviewedAt(LocalDateTime.now());
        progress.setNextReviewAt(nextReviewAt(progress));
        return toVocabularyResponse(vocabulary, progressRepository.save(progress));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GrammarResponse> getGrammarTopics(
            String email,
            Long courseId,
            Long lessonId,
            String search,
            Course.CourseLevel level,
            Pageable pageable
    ) {
        User user = getUser(email);
        if ("ADMIN".equals(user.getRole().getCode())) {
            return PageResponse.from(grammarTopicRepository.search(courseId, lessonId, blankToNull(search), level, pageable).map(this::toGrammarResponse));
        }
        if ("TEACHER".equals(user.getRole().getCode())) {
            return PageResponse.from(grammarTopicRepository.searchTeacherContent(user.getId(), courseId, lessonId, blankToNull(search), level, pageable).map(this::toGrammarResponse));
        }
        return PageResponse.from(grammarTopicRepository.searchAccessible(user.getId(), courseId, lessonId, blankToNull(search), level, CourseOwnership.OwnershipStatus.ACTIVE, pageable).map(this::toGrammarResponse));
    }

    @Override
    public GrammarResponse createGrammar(String email, UpsertGrammarRequest request) {
        User teacher = getUser(email);
        Course course = getEditableCourse(teacher, request.getCourseId());
        GrammarTopic grammar = new GrammarTopic();
        applyGrammar(grammar, course, request);
        return toGrammarResponse(grammarTopicRepository.save(grammar));
    }

    @Override
    public GrammarResponse updateGrammar(String email, Long id, UpsertGrammarRequest request) {
        User teacher = getUser(email);
        GrammarTopic grammar = getGrammar(id);
        getEditableCourse(teacher, grammar.getCourse().getId());
        Course course = getEditableCourse(teacher, request.getCourseId());
        applyGrammar(grammar, course, request);
        return toGrammarResponse(grammarTopicRepository.save(grammar));
    }

    @Override
    public void deleteGrammar(String email, Long id) {
        User teacher = getUser(email);
        GrammarTopic grammar = getGrammar(id);
        getEditableCourse(teacher, grammar.getCourse().getId());
        grammar.setDeletedAt(LocalDateTime.now());
        grammarTopicRepository.save(grammar);
    }

    private void applyVocabulary(Vocabulary vocabulary, Course course, UpsertVocabularyRequest request) {
        vocabulary.setCourse(course);
        vocabulary.setLesson(getLessonOrNull(request.getLessonId(), course.getId()));
        vocabulary.setWord(request.getWord().trim());
        vocabulary.setIpa(blankToNull(request.getIpa()));
        vocabulary.setMeaning(request.getMeaning().trim());
        vocabulary.setPartOfSpeech(request.getPartOfSpeech() == null ? Vocabulary.PartOfSpeech.OTHER : request.getPartOfSpeech());
        vocabulary.setExampleSentence(blankToNull(request.getExampleSentence()));
        vocabulary.setExampleMeaning(blankToNull(request.getExampleMeaning()));
        vocabulary.setAudioUrl(blankToNull(request.getAudioUrl()));
        vocabulary.setImageUrl(blankToNull(request.getImageUrl()));
        vocabulary.setLevel(request.getLevel() == null ? Course.CourseLevel.BEGINNER : request.getLevel());
        String topic = blankToNull(request.getTopic());
        if (topic == null) {
            throw new BadRequestException("Chủ đề là bắt buộc.");
        }
        validateUrl(vocabulary.getImageUrl(), "URL hình ảnh minh họa");
        validateUrl(vocabulary.getAudioUrl(), "URL âm thanh phát âm");
        vocabulary.setTopic(topic);
    }

    private void ensureVocabularyNotDuplicate(Vocabulary vocabulary, Long excludeId) {
        boolean duplicated = vocabularyRepository.existsDuplicateWord(
                vocabulary.getCourse().getId(),
                vocabulary.getTopic(),
                vocabulary.getWord().trim(),
                excludeId
        );
        if (duplicated) {
            throw new BadRequestException("Từ vựng đã tồn tại trong cùng khóa học và chủ đề.");
        }
    }

    private void applyGrammar(GrammarTopic grammar, Course course, UpsertGrammarRequest request) {
        grammar.setCourse(course);
        grammar.setLesson(getLessonOrNull(request.getLessonId(), course.getId()));
        grammar.setTitle(request.getTitle().trim());
        grammar.setDescription(blankToNull(request.getDescription()));
        grammar.setFormula(blankToNull(request.getFormula()));
        grammar.setUsage(blankToNull(request.getUsage()));
        grammar.setExample(blankToNull(request.getExample()));
        grammar.setNote(blankToNull(request.getNote()));
        grammar.setLevel(request.getLevel() == null ? Course.CourseLevel.BEGINNER : request.getLevel());
    }

    private Course getEditableCourse(User user, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        boolean isAdmin = "ADMIN".equals(user.getRole().getCode());
        if (!isAdmin && !course.getTeacher().getId().equals(user.getId())) {
            throw new UnauthorizedException("Bạn chỉ có thể quản lý nội dung khóa học của chính mình.");
        }
        return course;
    }

    private Lesson getLessonOrNull(Long lessonId, Long courseId) {
        if (lessonId == null) {
            return null;
        }
        return lessonRepository.findByIdAndChapterCourseIdAndDeletedAtIsNull(lessonId, courseId)
                .orElseThrow(() -> new BadRequestException("Bài học không thuộc khóa học đã chọn."));
    }

    private Vocabulary getVocabulary(Long id) {
        return vocabularyRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found"));
    }

    private GrammarTopic getGrammar(Long id) {
        return grammarTopicRepository.findById(id)
                .filter(item -> item.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Grammar topic not found"));
    }

    private User getUser(String email) {
        if (email == null) {
            throw new UnauthorizedException("Authentication is required");
        }
        return userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UnauthorizedException("Authentication is required"));
    }

    private void ensureVocabularyAccess(User user, Vocabulary vocabulary) {
        if ("ADMIN".equals(user.getRole().getCode())) {
            return;
        }
        if ("TEACHER".equals(user.getRole().getCode()) && vocabulary.getCourse().getTeacher().getId().equals(user.getId())) {
            return;
        }
        boolean accessible = vocabularyRepository.existsAccessibleVocabulary(
                user.getId(),
                vocabulary.getId(),
                CourseOwnership.OwnershipStatus.ACTIVE
        );
        if (!accessible) {
            throw new UnauthorizedException("Bạn không có quyền học từ vựng của khóa học này.");
        }
    }

    private void applyAnswerProgress(VocabularyProgress progress, boolean answeredCorrect, Long responseTimeMillis) {
        progress.setReviewCount(safe(progress.getReviewCount()) + 1);
        if (answeredCorrect) {
            progress.setCorrectCount(safe(progress.getCorrectCount()) + 1);
            progress.setConsecutiveCorrect(safe(progress.getConsecutiveCorrect()) + 1);
        } else {
            progress.setIncorrectCount(safe(progress.getIncorrectCount()) + 1);
            progress.setConsecutiveCorrect(0);
        }

        BigDecimal current = progress.getMasteryScore() == null ? BigDecimal.ZERO : progress.getMasteryScore();
        BigDecimal next = answeredCorrect ? current.add(new BigDecimal("20")) : current.subtract(new BigDecimal("15"));
        if (next.compareTo(BigDecimal.ZERO) < 0) {
            next = BigDecimal.ZERO;
        }
        if (next.compareTo(new BigDecimal("100")) > 0) {
            next = new BigDecimal("100");
        }
        progress.setMasteryScore(next);

        if (!answeredCorrect || safe(progress.getIncorrectCount()) > safe(progress.getCorrectCount())) {
            progress.setStatus(com.example.englishlearning.entity.VocabularyStatus.WEAK);
        } else if (next.compareTo(new BigDecimal("80")) >= 0 && safe(progress.getConsecutiveCorrect()) >= 2) {
            progress.setStatus(com.example.englishlearning.entity.VocabularyStatus.MASTERED);
        } else if (next.compareTo(new BigDecimal("40")) >= 0) {
            progress.setStatus(com.example.englishlearning.entity.VocabularyStatus.FAMILIAR);
        } else {
            progress.setStatus(com.example.englishlearning.entity.VocabularyStatus.LEARNING);
        }

        if (responseTimeMillis != null && responseTimeMillis > 0) {
            long previousAverage = progress.getAverageResponseTime() == null ? 0L : progress.getAverageResponseTime();
            progress.setAverageResponseTime(previousAverage <= 0 ? responseTimeMillis : (previousAverage + responseTimeMillis) / 2);
        }
    }

    private int safe(Integer value) {
        return value == null ? 0 : value;
    }

    private void validateUrl(String value, String fieldName) {
        if (value == null) {
            return;
        }
        try {
            java.net.URI uri = java.net.URI.create(value);
            String scheme = uri.getScheme();
            if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(fieldName + " không hợp lệ.");
        }
    }

    private VocabularyProgress findProgress(Long userId, Long vocabularyId) {
        return progressRepository.findByUserIdAndVocabularyId(userId, vocabularyId).orElse(null);
    }

    private LocalDateTime nextReviewAt(VocabularyProgress progress) {
        if (com.example.englishlearning.entity.VocabularyStatus.WEAK.equals(progress.getStatus())) {
            return LocalDateTime.now().plusDays(1);
        }
        long days = progress.getMasteryScore() != null ? Math.max(1, progress.getMasteryScore().longValue() + 1L) : 1L;
        return LocalDateTime.now().plusDays(days);
    }

    private VocabularyResponse toVocabularyResponse(Vocabulary vocabulary, VocabularyProgress progress) {
        return VocabularyResponse.builder()
                .id(vocabulary.getId())
                .courseId(vocabulary.getCourse().getId())
                .lessonId(vocabulary.getLesson() == null ? null : vocabulary.getLesson().getId())
                .word(vocabulary.getWord())
                .ipa(vocabulary.getIpa())
                .meaning(vocabulary.getMeaning())
                .partOfSpeech(vocabulary.getPartOfSpeech())
                .exampleSentence(vocabulary.getExampleSentence())
                .exampleMeaning(vocabulary.getExampleMeaning())
                .audioUrl(vocabulary.getAudioUrl())
                .imageUrl(vocabulary.getImageUrl())
                .level(vocabulary.getLevel())
                .topic(vocabulary.getTopic())
                .masteryScore(progress == null ? java.math.BigDecimal.ZERO : progress.getMasteryScore())
                .status(progress == null ? com.example.englishlearning.entity.VocabularyStatus.NEW : progress.getStatus())
                .favorite(progress != null && Boolean.TRUE.equals(progress.getFavorite()))
                .correctCount(progress == null ? 0 : safe(progress.getCorrectCount()))
                .incorrectCount(progress == null ? 0 : safe(progress.getIncorrectCount()))
                .reviewCount(progress == null ? 0 : safe(progress.getReviewCount()))
                .reviewedAt(progress == null ? null : progress.getReviewedAt())
                .nextReviewAt(progress == null ? null : progress.getNextReviewAt())
                .reviewDue(progress != null && (progress.getNextReviewAt() == null || !progress.getNextReviewAt().isAfter(LocalDateTime.now())
                        || com.example.englishlearning.entity.VocabularyStatus.WEAK.equals(progress.getStatus())))
                .build();
    }

    private GrammarResponse toGrammarResponse(GrammarTopic grammar) {
        return GrammarResponse.builder()
                .id(grammar.getId())
                .courseId(grammar.getCourse().getId())
                .lessonId(grammar.getLesson() == null ? null : grammar.getLesson().getId())
                .title(grammar.getTitle())
                .description(grammar.getDescription())
                .formula(grammar.getFormula())
                .usage(grammar.getUsage())
                .example(grammar.getExample())
                .note(grammar.getNote())
                .level(grammar.getLevel())
                .build();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
