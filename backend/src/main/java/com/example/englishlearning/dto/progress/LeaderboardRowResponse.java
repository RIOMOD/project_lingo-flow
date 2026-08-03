package com.example.englishlearning.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardRowResponse {
    private int rank;
    private String name;
    private String email;
    private int xp;
    private int streak;
    private int words;
    private String badge;
}
