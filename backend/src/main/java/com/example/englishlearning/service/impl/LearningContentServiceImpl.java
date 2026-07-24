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
        return toVocabularyResponse(vocabularyRepository.save(vocabulary), null);
    }

    @Override
    public VocabularyResponse updateVocabulary(String email, Long id, UpsertVocabularyRequest request) {
        User teacher = getUser(email);
        Vocabulary vocabulary = getVocabulary(id);
        getEditableCourse(teacher, vocabulary.getCourse().getId());
        Course course = getEditableCourse(teacher, request.getCourseId());
        applyVocabulary(vocabulary, course, request);
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
        vocabulary.setTopic(blankToNull(request.getTopic()));
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
            throw new UnauthorizedException("You can only manage your own course content");
        }
        return course;
    }

    private Lesson getLessonOrNull(Long lessonId, Long courseId) {
        if (lessonId == null) {
            return null;
        }
        return lessonRepository.findByIdAndChapterCourseIdAndDeletedAtIsNull(lessonId, courseId)
                .orElseThrow(() -> new BadRequestException("Lesson does not belong to selected course"));
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
