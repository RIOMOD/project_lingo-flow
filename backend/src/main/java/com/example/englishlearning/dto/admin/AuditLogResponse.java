package com.example.englishlearning.dto.admin;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AuditLogResponse {
    private Long id;
    private Long adminId;
    private String adminName;
    private String adminEmail;
    private String action;
    private String targetType;
    private Long targetId;
    private String valueBefore;
    private String valueAfter;
    private String notes;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
