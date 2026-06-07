package com.auraplays.backend.controller;

import com.auraplays.backend.dto.request.LoginRequest;
import com.auraplays.backend.dto.request.RegisterRequest;
import com.auraplays.backend.dto.response.AuthResponse;
import com.auraplays.backend.dto.response.UserResponse;
import com.auraplays.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Auth Controller — handles user registration, login, and profile retrieval.
 *
 * Endpoints:
 *   POST /api/auth/register  → Create new account (public)
 *   POST /api/auth/login     → Authenticate and get JWT (public)
 *   GET  /api/auth/me        → Get current user profile (authenticated)
 *
 * All endpoints return consistent JSON responses.
 * @Valid triggers Jakarta Bean Validation on request DTOs.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserResponse response = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
