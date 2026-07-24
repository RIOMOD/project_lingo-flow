package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCaseAndDeletedAtIsNull(String code);

    @Override
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Coupon> findById(Long id);
}
