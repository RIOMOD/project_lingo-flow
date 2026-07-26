package com.example.englishlearning.repository;

import com.example.englishlearning.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    boolean existsByOrderId(Long orderId);
}
