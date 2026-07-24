package com.example.englishlearning.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private boolean success;
    private String message;
    private ErrorDetail error;
    private Instant timestamp;
    private String path;

    public static ErrorResponse of(String message, String code, String path) {
        return ErrorResponse.builder()
                .success(false)
                .message(message)
                .error(ErrorDetail.builder().code(code).build())
                .timestamp(Instant.now())
                .path(path)
                .build();
    }

    public static ErrorResponse validation(String message, List<FieldErrorDetail> details, String path) {
        return ErrorResponse.builder()
                .success(false)
                .message(message)
                .error(ErrorDetail.builder().code("VALIDATION_ERROR").details(details).build())
                .timestamp(Instant.now())
                .path(path)
                .build();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetail {
        private String code;
        private List<FieldErrorDetail> details;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldErrorDetail {
        private String field;
        private String message;
    }
}

