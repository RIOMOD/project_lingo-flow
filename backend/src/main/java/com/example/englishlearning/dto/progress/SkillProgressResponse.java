package com.example.englishlearning.dto.progress;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class SkillProgressResponse {
    private String skill;
    private BigDecimal averageScore;
    private long attempts;
}
