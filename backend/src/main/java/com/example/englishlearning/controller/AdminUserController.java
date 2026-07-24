package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.user.AdminUpdateUserRequest;
import com.example.englishlearning.dto.user.CreateTeacherRequest;
import com.example.englishlearning.dto.user.LockUserRequest;
import com.example.englishlearning.dto.user.UpdateUserRoleRequest;
import com.example.englishlearning.dto.user.UpdateUserStatusRequest;
import com.example.englishlearning.dto.user.UserCourseResponse;
import com.example.englishlearning.dto.user.UserDetailResponse;
import com.example.englishlearning.dto.user.UserOrderResponse;
import com.example.englishlearning.dto.user.UserSummaryResponse;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin Users")
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserManagementService userManagementService;

    public AdminUserController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @Operation(summary = "Get users", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ApiResponse<PageResponse<UserSummaryResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.success(userManagementService.getUsers(search, role, status, pageable));
    }

    @Operation(summary = "Get user detail", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ApiResponse<UserDetailResponse> getUserDetail(@PathVariable Long userId) {
        return ApiResponse.success(userManagementService.getUserDetail(userId));
    }

    @Operation(summary = "Create teacher account", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/teachers")
    public ApiResponse<UserDetailResponse> createTeacher(@Valid @RequestBody CreateTeacherRequest request) {
        return ApiResponse.success("Teacher created successfully", userManagementService.createTeacher(request));
    }

    @Operation(summary = "Update user", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}")
    public ApiResponse<UserDetailResponse> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        return ApiResponse.success("User updated successfully", userManagementService.updateUser(userId, request));
    }

    @Operation(summary = "Update user status", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/status")
    public ApiResponse<UserDetailResponse> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        return ApiResponse.success("User status updated successfully", userManagementService.updateUserStatus(userId, request));
    }

    @Operation(summary = "Update user role", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/role")
    public ApiResponse<UserDetailResponse> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        return ApiResponse.success("User role updated successfully", userManagementService.updateUserRole(userId, request));
    }

    @Operation(summary = "Get user's orders", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}/orders")
    public ApiResponse<PageResponse<UserOrderResponse>> getUserOrders(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(userManagementService.getUserOrders(userId, PageRequest.of(page, size)));
    }

    @Operation(summary = "Get user's owned courses", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}/courses")
    public ApiResponse<PageResponse<UserCourseResponse>> getUserCourses(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(userManagementService.getUserCourses(userId, PageRequest.of(page, size)));
    }

    @Operation(summary = "Lock or unlock a user account", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}/lock")
    public ApiResponse<Void> lockUser(@PathVariable Long userId, @RequestBody LockUserRequest request) {
        UpdateUserStatusRequest statusRequest = new UpdateUserStatusRequest();
        statusRequest.setStatus(request.isLocked() ? User.UserStatus.LOCKED.name() : User.UserStatus.ACTIVE.name());
        userManagementService.updateUserStatus(userId, statusRequest);
        return ApiResponse.success(request.isLocked() ? "Account locked" : "Account unlocked", null);
    }
}
