package com.example.englishlearning.exception;

import com.example.englishlearning.dto.common.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        return build(HttpStatus.NOT_FOUND, exception.getMessage(), "RESOURCE_NOT_FOUND", request);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException exception,
            HttpServletRequest request
    ) {
        return build(HttpStatus.BAD_REQUEST, exception.getMessage(), "BAD_REQUEST", request);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException exception,
            HttpServletRequest request
    ) {
        return build(HttpStatus.UNAUTHORIZED, exception.getMessage(), "UNAUTHORIZED", request);
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(
            ForbiddenException exception,
            HttpServletRequest request
    ) {
        return build(HttpStatus.FORBIDDEN, exception.getMessage(), "FORBIDDEN", request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        List<ErrorResponse.FieldErrorDetail> details = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::toFieldErrorDetail)
                .toList();

        ErrorResponse response = ErrorResponse.validation(
                "Validation failed",
                details,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        List<ErrorResponse.FieldErrorDetail> details = exception.getConstraintViolations()
                .stream()
                .map(violation -> ErrorResponse.FieldErrorDetail.builder()
                        .field(violation.getPropertyPath().toString())
                        .message(violation.getMessage())
                        .build())
                .toList();

        ErrorResponse response = ErrorResponse.validation(
                "Validation failed",
                details,
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccess(
            DataAccessException exception,
            HttpServletRequest request
    ) {
        log.error("Database access error at {}", request.getRequestURI(), exception);
        return build(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Database is unavailable or schema is not ready",
                "DATABASE_ERROR",
                request
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error("Unexpected error at {}", request.getRequestURI(), exception);
        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected server error",
                "INTERNAL_ERROR",
                request
        );
    }

    private ErrorResponse.FieldErrorDetail toFieldErrorDetail(FieldError fieldError) {
        return ErrorResponse.FieldErrorDetail.builder()
                .field(fieldError.getField())
                .message(fieldError.getDefaultMessage())
                .build();
    }

    private ResponseEntity<ErrorResponse> build(
            HttpStatus status,
            String message,
            String code,
            HttpServletRequest request
    ) {
        ErrorResponse response = ErrorResponse.of(message, code, request.getRequestURI());
        return ResponseEntity.status(status).body(response);
    }
}
