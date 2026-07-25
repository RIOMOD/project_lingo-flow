package com.example.englishlearning.dto.user;

import com.example.englishlearning.entity.User;
import com.example.englishlearning.entity.UserProfile;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProfileResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String role;
    private String status;
    private String learningGoal;
    private String bio;

    public static ProfileResponse from(User user, UserProfile profile) {
        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().getCode())
                .status(user.getStatus().name())
                .learningGoal(profile == null ? null : profile.getLearningGoal())
                .bio(profile == null ? null : profile.getBio())
                .build();
    }
}

