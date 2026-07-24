package com.example.englishlearning.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionResponse {
    private Long id;
    private String optionText;
    private Boolean correct;
    private Integer position;
}
