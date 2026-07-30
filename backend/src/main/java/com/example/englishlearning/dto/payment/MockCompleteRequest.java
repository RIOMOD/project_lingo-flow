package com.example.englishlearning.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MockCompleteRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "SUCCESS|FAILED|CANCELED", message = "Status must be SUCCESS, FAILED, or CANCELED")
    private String status;
}
