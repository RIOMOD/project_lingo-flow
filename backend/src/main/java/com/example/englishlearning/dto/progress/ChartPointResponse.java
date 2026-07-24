package com.example.englishlearning.dto.progress;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChartPointResponse {
    private String label;
    private long value;
}
