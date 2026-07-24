package com.example.englishlearning.repository;

import com.example.englishlearning.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmailAndDeletedAtIsNull(String email);

    long countByRole_CodeAndStatusAndDeletedAtIsNull(String roleCode, User.UserStatus status);

    @Query("""
            select u
            from User u
            join u.role r
            where u.deletedAt is null
              and (:search is null
                or lower(u.email) like lower(concat('%', :search, '%'))
                or lower(u.fullName) like lower(concat('%', :search, '%'))
                or u.phone like concat('%', :search, '%'))
              and (:role is null or r.code = :role)
              and (:status is null or u.status = :status)
            """)
    Page<User> searchUsers(
            @Param("search") String search,
            @Param("role") String role,
            @Param("status") User.UserStatus status,
            Pageable pageable
    );
}
