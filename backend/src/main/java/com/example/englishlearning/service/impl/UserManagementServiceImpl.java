package com.example.englishlearning.service.impl;

import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.user.AdminUpdateUserRequest;
import com.example.englishlearning.dto.user.CreateTeacherRequest;
import com.example.englishlearning.dto.user.ProfileResponse;
import com.example.englishlearning.dto.user.UpdateProfileRequest;
import com.example.englishlearning.dto.user.UpdateUserRoleRequest;
import com.example.englishlearning.dto.user.UpdateUserStatusRequest;
import com.example.englishlearning.dto.user.UserCourseResponse;
import com.example.englishlearning.dto.user.UserDetailResponse;
import com.example.englishlearning.dto.user.UserOrderResponse;
import com.example.englishlearning.dto.user.UserSummaryResponse;
import com.example.englishlearning.entity.Role;
import com.example.englishlearning.entity.Order;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.entity.UserProfile;
import com.example.englishlearning.exception.BadRequestException;
import com.example.englishlearning.exception.ResourceNotFoundException;
import com.example.englishlearning.repository.CourseOwnershipRepository;
import com.example.englishlearning.repository.OrderRepository;
import com.example.englishlearning.repository.RefreshTokenRepository;
import com.example.englishlearning.repository.RoleRepository;
import com.example.englishlearning.repository.UserProfileRepository;
import com.example.englishlearning.repository.UserRepository;
import com.example.englishlearning.service.AuditLogService;
import com.example.englishlearning.service.UserManagementService;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class UserManagementServiceImpl implements UserManagementService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrderRepository orderRepository;
    private final CourseOwnershipRepository courseOwnershipRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserManagementServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserProfileRepository userProfileRepository,
            OrderRepository orderRepository,
            CourseOwnershipRepository courseOwnershipRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userProfileRepository = userProfileRepository;
        this.orderRepository = orderRepository;
        this.courseOwnershipRepository = courseOwnershipRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserSummaryResponse> getUsers(String search, String role, String status, Pageable pageable) {
        User.UserStatus parsedStatus = parseStatusOrNull(status);
        String normalizedRole = blankToNull(role == null ? null : role.trim().toUpperCase());
        String normalizedSearch = blankToNull(search == null ? null : search.trim());

        return PageResponse.from(userRepository.searchUsers(
                normalizedSearch,
                normalizedRole,
                parsedStatus,
                pageable
        ).map(UserSummaryResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetailResponse getUserDetail(Long userId) {
        User user = findUser(userId);
        return toDetail(user);
    }

    @Override
    @Transactional
    public UserDetailResponse createTeacher(CreateTeacherRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new BadRequestException("Email is already registered");
        }

        Role teacherRole = roleRepository.findByCode(ROLE_TEACHER)
                .orElseThrow(() -> new ResourceNotFoundException("TEACHER role not found"));

        User user = new User();
        user.setRole(teacherRole);
        user.setEmail(email);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(User.UserStatus.ACTIVE);
        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        userProfileRepository.save(profile);

        return toDetail(user);
    }

    @Override
    @Transactional
    public UserDetailResponse updateUser(Long userId, AdminUpdateUserRequest request) {
        User user = findUser(userId);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = normalizeEmail(request.getEmail());
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmailAndDeletedAtIsNull(newEmail)) {
                    throw new BadRequestException("Email is already registered by another account");
                }
                user.setEmail(newEmail);
            }
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
        }

        if (request.getRole() != null && !request.getRole().isBlank()) {
            String roleCode = request.getRole().trim().toUpperCase();
            Role role = roleRepository.findByCode(roleCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Role " + roleCode + " not found"));
            user.setRole(role);
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        return toDetail(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = findUser(userId);
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getEmail().equalsIgnoreCase(currentUserEmail)) {
            throw new BadRequestException("Cannot delete your own admin account");
        }
        user.setDeletedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);
        auditLogService.logAction("DELETE_USER", "USER", user.getId(), user.getEmail(), "DELETED", "Admin deleted user account");
    }

    @Override
    @Transactional
    public UserDetailResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User user = findUser(userId);
        User.UserStatus newStatus = parseRequiredStatus(request.getStatus());
        if (newStatus != User.UserStatus.ACTIVE) {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            if (user.getEmail().equals(currentUserEmail)) {
                throw new BadRequestException("Cannot lock your own account");
            }
        }

        if (user.getRole().getCode().equals(ROLE_ADMIN) && newStatus != User.UserStatus.ACTIVE) {
            ensureNotLastActiveAdmin(user.getId());
        }

        String statusBefore = user.getStatus().name();
        user.setStatus(newStatus);
        user = userRepository.save(user);
        if (newStatus != User.UserStatus.ACTIVE) {
            refreshTokenRepository.deleteByUser(user);
        }

        auditLogService.logAction("UPDATE_USER_STATUS", "USER", user.getId(), statusBefore, newStatus.name(), "Admin updated user status");

        return toDetail(user);
    }

    @Override
    @Transactional
    public UserDetailResponse updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User user = findUser(userId);
        String roleCode = request.getRole().trim().toUpperCase();
        Role role = roleRepository.findByCode(roleCode)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (user.getRole().getCode().equals(ROLE_ADMIN) && !roleCode.equals(ROLE_ADMIN)) {
            String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            if (user.getEmail().equals(currentUserEmail)) {
                throw new BadRequestException("Cannot demote your own account");
            }
            ensureNotLastActiveAdmin(user.getId());
        }

        String roleBefore = user.getRole().getCode();
        user.setRole(role);
        user = userRepository.save(user);
        refreshTokenRepository.deleteByUser(user);

        auditLogService.logAction("UPDATE_USER_ROLE", "USER", user.getId(), roleBefore, roleCode, "Admin updated user role");

        return toDetail(user);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserOrderResponse> getUserOrders(Long userId, Pageable pageable) {
        ensureUserExists(userId);
        return PageResponse.from(orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(UserOrderResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserCourseResponse> getUserCourses(Long userId, Pageable pageable) {
        ensureUserExists(userId);
        return PageResponse.from(courseOwnershipRepository.findByUserId(userId, pageable)
                .map(UserCourseResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        User user = findUserByEmail(email);
        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
        return ProfileResponse.from(user, profile);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());

        UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            UserProfile created = new UserProfile();
            created.setUser(user);
            return created;
        });
        profile.setLearningGoal(request.getLearningGoal());
        profile.setBio(request.getBio());

        userRepository.save(user);
        profile = userProfileRepository.save(profile);
        return ProfileResponse.from(user, profile);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserOrderResponse> getMyOrders(String email, Pageable pageable) {
        return getUserOrders(findUserByEmail(email).getId(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserCourseResponse> getMyCourses(String email, Pageable pageable) {
        return getUserCourses(findUserByEmail(email).getId(), pageable);
    }

    private UserDetailResponse toDetail(User user) {
        BigDecimal totalPaid = orderRepository.sumAmountByUserIdAndStatus(user.getId(), Order.OrderStatus.PAID);
        if (totalPaid == null) {
            totalPaid = BigDecimal.ZERO;
        }
        return UserDetailResponse.from(user, totalPaid);
    }

    private void ensureNotLastActiveAdmin(Long adminUserId) {
        long activeAdmins = userRepository.countByRole_CodeAndStatusAndDeletedAtIsNull(
                ROLE_ADMIN,
                User.UserStatus.ACTIVE
        );
        if (activeAdmins <= 1) {
            throw new BadRequestException("Cannot lock or demote the last active admin");
        }
    }

    private void ensureUserExists(Long userId) {
        findUser(userId);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .filter(user -> user.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailAndDeletedAtIsNull(normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private User.UserStatus parseRequiredStatus(String status) {
        try {
            return User.UserStatus.valueOf(status.trim().toUpperCase());
        } catch (RuntimeException exception) {
            throw new BadRequestException("Invalid user status");
        }
    }

    private User.UserStatus parseStatusOrNull(String status) {
        if (blankToNull(status) == null) {
            return null;
        }
        return parseRequiredStatus(status);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
