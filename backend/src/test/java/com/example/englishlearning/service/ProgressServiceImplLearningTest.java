package com.example.englishlearning.service;

import com.example.englishlearning.dto.progress.LessonProgressRequest;
import com.example.englishlearning.entity.Chapter;
import com.example.englishlearning.entity.Course;
import com.example.englishlearning.entity.CourseEnrollment;
import com.example.englishlearning.entity.LearningProgress;
import com.example.englishlearning.entity.Lesson;
import com.example.englishlearning.entity.Role;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ForbiddenException;
import com.example.englishlearning.repository.CourseEnrollmentRepository;
import com.example.englishlearning.repository.CourseOwnershipRepository;
import com.example.englishlearning.repository.CourseRepository;
import com.example.englishlearning.repository.LearningProgressRepository;
import com.example.englishlearning.repository.LessonRepository;
import com.example.englishlearning.repository.TestAttemptRepository;
import com.example.englishlearning.repository.UserProfileRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.repository.VocabularyProgressRepository;
import com.example.englishlearning.service.impl.ProgressServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ProgressServiceImplLearningTest {

    private LearningProgressRepository progressRepository;
    private CourseEnrollmentRepository enrollmentRepository;
    private LessonRepository lessonRepository;
    private UserRepository userRepository;
    private ProgressServiceImpl service;
    private User student;
    private Course course;
    private Lesson first;
    private Lesson second;

    @BeforeEach
    void setUp() {
        progressRepository = mock(LearningProgressRepository.class);
        enrollmentRepository = mock(CourseEnrollmentRepository.class);
        lessonRepository = mock(LessonRepository.class);
        userRepository = mock(UserRepository.class);
        service = new ProgressServiceImpl(
                progressRepository,
                enrollmentRepository,
                mock(CourseOwnershipRepository.class),
                mock(CourseRepository.class),
                lessonRepository,
                mock(TestAttemptRepository.class),
                mock(VocabularyProgressRepository.class),
                mock(com.example.englishlearning.repository.VocabularyRepository.class),
                userRepository,
                mock(UserProfileRepository.class)
        );

        Role role = new Role(); role.setCode("STUDENT");
        student = new User(); student.setId(9L); student.setEmail("student@test.local"); student.setRole(role);
        course = new Course(); course.setId(3L); course.setTitle("Course"); course.setCourseType(Course.CourseType.FREE);
        Chapter chapter = new Chapter(); chapter.setId(4L); chapter.setCourse(course); chapter.setTitle("Chapter");
        first = lesson(21L, "First", chapter, 1);
        second = lesson(22L, "Second", chapter, 2);

        when(userRepository.findByEmailAndDeletedAtIsNull(student.getEmail())).thenReturn(Optional.of(student));
        when(enrollmentRepository.existsByUserIdAndCourseIdAndStatus(
                student.getId(), course.getId(), CourseEnrollment.EnrollmentStatus.ACTIVE)).thenReturn(true);
        when(lessonRepository.findCourseLessonsInLearningOrder(course.getId())).thenReturn(List.of(first, second));
        when(progressRepository.findByUserIdAndCourseId(student.getId(), course.getId())).thenReturn(List.of());
    }

    @Test
    void firstLessonIsUnlockedForCourseOwner() {
        when(lessonRepository.findById(first.getId())).thenReturn(Optional.of(first));
        when(progressRepository.findByUserIdAndLessonId(student.getId(), first.getId())).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> service.startLesson(student.getEmail(), first.getId(), new LessonProgressRequest()));
        verify(progressRepository).save(any(LearningProgress.class));
    }

    @Test
    void nextLessonIsForbiddenUntilPreviousLessonCompleted() {
        when(lessonRepository.findById(second.getId())).thenReturn(Optional.of(second));
        LearningProgress previous = progress(first, LearningProgress.ProgressStatus.IN_PROGRESS, "70");
        when(progressRepository.findByUserIdAndLessonId(student.getId(), first.getId())).thenReturn(Optional.of(previous));

        assertThrows(ForbiddenException.class,
                () -> service.startLesson(student.getEmail(), second.getId(), new LessonProgressRequest()));
    }

    @Test
    void completionIsRejectedBelowRequiredContentCoverage() {
        when(lessonRepository.findById(first.getId())).thenReturn(Optional.of(first));
        LearningProgress current = progress(first, LearningProgress.ProgressStatus.IN_PROGRESS, "40");
        when(progressRepository.findByUserIdAndLessonId(student.getId(), first.getId())).thenReturn(Optional.of(current));
        LessonProgressRequest request = new LessonProgressRequest(); request.setContentProgressPercent(new BigDecimal("40"));
        request.setCheckpointAnswer("hello");

        assertThrows(BadRequestException.class,
                () -> service.completeLesson(student.getEmail(), first.getId(), request));
    }

    private Lesson lesson(Long id, String title, Chapter chapter, int position) {
        Lesson lesson = new Lesson(); lesson.setId(id); lesson.setTitle(title); lesson.setChapter(chapter);
        lesson.setPosition(position); lesson.setLessonType(Lesson.LessonType.TEXT);
        lesson.setStatus(Lesson.LessonStatus.PUBLISHED); lesson.setCheckpointAnswer("hello");
        return lesson;
    }

    private LearningProgress progress(Lesson lesson, LearningProgress.ProgressStatus status, String percent) {
        LearningProgress progress = new LearningProgress(); progress.setUser(student); progress.setCourse(course);
        progress.setLesson(lesson); progress.setStatus(status); progress.setContentProgressPercent(new BigDecimal(percent));
        progress.setProgressPercent(new BigDecimal(percent)); return progress;
    }
}
