package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.user.ProfileResponse;
import com.example.englishlearning.dto.user.UpdateProfileRequest;
import com.example.englishlearning.dto.user.UserCourseResponse;
import com.example.englishlearning.dto.user.UserOrderResponse;
import com.example.englishlearning.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Users")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserManagementService userManagementService;

    public UserController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @Operation(summary = "Get current user's profile", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> getProfile(Authentication authentication) {
        return ApiResponse.success(userManagementService.getProfile(authentication.getName()));
    }

    @Operation(summary = "Update current user's profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/profile")
    public ApiResponse<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.success("Profile updated successfully", userManagementService.updateProfile(authentication.getName(), request));
    }

    @Operation(summary = "Get current user's orders", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @GetMapping("/me/orders")
    public ApiResponse<PageResponse<UserOrderResponse>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(userManagementService.getMyOrders(authentication.getName(), PageRequest.of(page, size)));
    }

    @Operation(summary = "Get current user's owned courses", security = @SecurityRequirement(name = "bearerAuth"))
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @GetMapping("/me/courses")
    public ApiResponse<PageResponse<UserCourseResponse>> getMyCourses(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.success(userManagementService.getMyCourses(authentication.getName(), PageRequest.of(page, size)));
    }
}
