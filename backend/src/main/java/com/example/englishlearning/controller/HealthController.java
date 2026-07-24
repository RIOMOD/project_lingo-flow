package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@Tag(name = "Health")
@RestController
@RequestMapping("/api")
public class HealthController {

    @Operation(summary = "Check backend health")
    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        Map<String, Object> data = Map.of(
                "status", "UP",
                "service", "english-learning-backend",
                "time", Instant.now()
        );
        return ApiResponse.success("Backend is running", data);
    }
}

