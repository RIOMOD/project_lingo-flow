package com.example.englishlearning.repository;

import com.example.englishlearning.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    @Override
    @EntityGraph(attributePaths = "admin")
    Page<AuditLog> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "admin")
    Page<AuditLog> findByActionContainingIgnoreCase(String action, Pageable pageable);

    @EntityGraph(attributePaths = "admin")
    Page<AuditLog> findByAdminId(Long adminId, Pageable pageable);
}
