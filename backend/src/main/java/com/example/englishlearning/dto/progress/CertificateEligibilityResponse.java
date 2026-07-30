package com.example.englishlearning.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateEligibilityResponse {
    private boolean eligible;
    private boolean listeningCompleted;
    private boolean speakingCompleted;
    private boolean writingCompleted;
    private double listeningProgress;
    private double speakingProgress;
    private double writingProgress;
    private double averageProgress;
    private int completedSkillCoursesCount;
    private String studentName;
    private String message;
    private List<SkillCourseInfo> skillCourses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillCourseInfo {
        private String skillType; // LISTENING, SPEAKING, WRITING
        private String skillName; // "Nghe (Listening)", "Nói (Speaking)", "Viết (Writing)"
        private String courseTitle;
        private double progressPercent;
        private boolean isPassed; // progressPercent >= 95.0
    }
}
