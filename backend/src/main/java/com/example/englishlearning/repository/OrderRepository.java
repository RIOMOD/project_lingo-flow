package com.example.englishlearning.repository;

import com.example.englishlearning.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Override
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Order> findById(Long id);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Order> findByOrderCode(String orderCode);

    Optional<Order> findByOrderCodeAndUserId(String orderCode, Long userId);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            select sum(o.totalAmount)
            from Order o
            where o.user.id = :userId and o.status = :status
            """)
    BigDecimal sumAmountByUserIdAndStatus(@Param("userId") Long userId, @Param("status") Order.OrderStatus status);
}
