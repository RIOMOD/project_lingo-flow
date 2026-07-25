package com.example.englishlearning.repository;

import com.example.englishlearning.entity.RefundRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefundRequestRepository extends JpaRepository<RefundRequest, Long> {

    Page<RefundRequest> findAllByOrderByRequestedAtDesc(Pageable pageable);
}
