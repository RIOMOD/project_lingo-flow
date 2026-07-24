package com.example.englishlearning.service;

import com.example.englishlearning.entity.AuditLog;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.repository.AuditLogRepository;
import com.example.englishlearning.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logAction(String action, String targetType, Long targetId, String valueBefore, String valueAfter, String notes) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmailAndDeletedAtIsNull(currentUserEmail).orElseThrow(() -> new RuntimeException("Admin not found"));

        AuditLog log = new AuditLog();
        log.setAdmin(admin);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setValueBefore(valueBefore);
        log.setValueAfter(valueAfter);
        log.setNotes(notes);
        // Note: IP and UserAgent would typically come from an interceptor or request context

        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
}
