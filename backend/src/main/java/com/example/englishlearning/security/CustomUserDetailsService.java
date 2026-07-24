package com.example.englishlearning.security;

import com.example.englishlearning.entity.User;
import com.example.englishlearning.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        boolean enabled = user.getStatus() == User.UserStatus.ACTIVE;

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().getCode())))
                .accountLocked(user.getStatus() == User.UserStatus.LOCKED)
                .disabled(!enabled)
                .build();
    }
}

