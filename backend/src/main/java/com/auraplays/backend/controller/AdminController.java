package com.auraplays.backend.controller;

import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.User;
import com.auraplays.backend.repository.CourtRepository;
import com.auraplays.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final CourtRepository courtRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.isActive());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/courts")
    public ResponseEntity<List<Court>> getAllCourts() {
        return ResponseEntity.ok(courtRepository.findAll());
    }
}
