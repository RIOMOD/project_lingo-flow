package com.example.englishlearning.repository;

import com.example.englishlearning.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartIdOrderByAddedAtDesc(Long cartId);

    boolean existsByCartIdAndCourseId(Long cartId, Long courseId);

    Optional<CartItem> findByCartIdAndCourseId(Long cartId, Long courseId);

    void deleteByCartId(Long cartId);
}
