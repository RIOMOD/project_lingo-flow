package com.example.englishlearning.dto.progress;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.math.BigDecimal;

@Getter
@Builder
public class ProgressDashboardResponse {
    private long activeCourses;
    private long startedLessons;
    private long completedLessons;
    private long learnedWords;
    private long rememberedWords;
    private Integer studyTimeMinutes;
    private Integer streakDays;
    private SkillProgressResponse strongestSkill;
    private SkillProgressResponse weakestSkill;
    private List<ChartPointResponse> weeklyChart;
    private List<ChartPointResponse> monthlyChart;
    private List<CourseProgressResponse> courses;
    private String studentName;
    private String learningGoal;
    private long completedExercises;
    private BigDecimal averageScore;
    private long dueReviewWords;
    private CourseProgressResponse continueLearning;
}
