package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.dto.common.PageResponse;
import com.example.englishlearning.dto.user.CreateTeacherRequest;
import com.example.englishlearning.dto.user.UserSummaryResponse;
import com.example.englishlearning.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/teachers")
@RequiredArgsConstructor
public class AdminTeacherController {

    private final UserManagementService userManagementService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PageResponse<UserSummaryResponse>> getTeachers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        // Here we hardcode role to "TEACHER"
        return ApiResponse.success(userManagementService.getUsers(search, "TEACHER", status, PageRequest.of(page, size)));
    }

    // Creating teachers is already in AdminUserController, but we can have it here too
    // or just leave it in AdminUserController.
    // We will leave the specific permission stuff for later if required.
}
