package com.example.englishlearning.controller;

import com.example.englishlearning.dto.admin.AuditLogResponse;
import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.entity.AuditLog;
import com.example.englishlearning.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
public class AdminAuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ApiResponse<PageResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<AuditLog> logs = auditLogService.getAllLogs(pageable);
        Page<AuditLogResponse> responsePage = logs.map(log -> AuditLogResponse.builder()
                .id(log.getId())
                .adminId(log.getAdmin() != null ? log.getAdmin().getId() : null)
                .adminName(log.getAdmin() != null ? log.getAdmin().getFullName() : "System")
                .adminEmail(log.getAdmin() != null ? log.getAdmin().getEmail() : null)
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .valueBefore(log.getValueBefore())
                .valueAfter(log.getValueAfter())
                .notes(log.getNotes())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .createdAt(log.getCreatedAt())
                .build());
        return ApiResponse.success(PageResponse.from(responsePage));
    }
}
