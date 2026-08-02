package com.example.englishlearning.service;

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
import org.springframework.data.domain.Pageable;

public interface UserManagementService {

    PageResponse<UserSummaryResponse> getUsers(String search, String role, String status, Pageable pageable);

    UserDetailResponse getUserDetail(Long userId);

    UserDetailResponse createTeacher(CreateTeacherRequest request);

    UserDetailResponse updateUser(Long userId, AdminUpdateUserRequest request);

    UserDetailResponse updateUserStatus(Long userId, UpdateUserStatusRequest request);

    UserDetailResponse updateUserRole(Long userId, UpdateUserRoleRequest request);

    void deleteUser(Long userId);

    PageResponse<UserOrderResponse> getUserOrders(Long userId, Pageable pageable);

    PageResponse<UserCourseResponse> getUserCourses(Long userId, Pageable pageable);

    ProfileResponse getProfile(String email);

    ProfileResponse updateProfile(String email, UpdateProfileRequest request);

    PageResponse<UserOrderResponse> getMyOrders(String email, Pageable pageable);

    PageResponse<UserCourseResponse> getMyCourses(String email, Pageable pageable);
}

