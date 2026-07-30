package com.example.englishlearning.controller;

import com.example.englishlearning.dto.common.ApiResponse;
import com.example.englishlearning.entity.Notification;
import com.example.englishlearning.entity.User;
import com.example.englishlearning.repository.NotificationRepository;
import com.example.englishlearning.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/notifications")
public class NotificationRealtimeController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NotificationRealtimeController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null) return null;
        return userRepository.findByEmailAndDeletedAtIsNull(userDetails.getUsername()).orElse(null);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> responseList = new ArrayList<>();
        for (Notification n : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("type", n.getType().name().toLowerCase());
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("read", Boolean.TRUE.equals(n.getRead()));
            map.put("createdAt", n.getCreatedAt());
            responseList.add(map);
        }
        return ResponseEntity.ok(ApiResponse.success(responseList));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        if (user != null) {
            notificationRepository.findById(id).ifPresent(n -> {
                if (n.getUser().getId().equals(user.getId())) {
                    n.setRead(true);
                    n.setReadAt(LocalDateTime.now());
                    notificationRepository.save(n);
                }
            });
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        if (user != null) {
            List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            for (Notification n : list) {
                if (!Boolean.TRUE.equals(n.getRead())) {
                    n.setRead(true);
                    n.setReadAt(LocalDateTime.now());
                }
            }
            notificationRepository.saveAll(list);
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        if (user != null) {
            notificationRepository.findById(id).ifPresent(n -> {
                if (n.getUser().getId().equals(user.getId())) {
                    notificationRepository.delete(n);
                }
            });
        }
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 mins
        User user = getAuthenticatedUser(userDetails);
        if (user == null) {
            emitter.complete();
            return emitter;
        }

        Long userId = user.getId();
        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(e -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected to Realtime Notification Stream"));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(userId);
            }
        }
    }
}
