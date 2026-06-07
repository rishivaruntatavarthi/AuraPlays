package com.auraplays.backend.service.impl;

import com.auraplays.backend.dto.request.LoginRequest;
import com.auraplays.backend.dto.request.RegisterRequest;
import com.auraplays.backend.dto.response.AuthResponse;
import com.auraplays.backend.dto.response.UserResponse;
import com.auraplays.backend.entity.User;
import com.auraplays.backend.entity.enums.Role;
import com.auraplays.backend.exception.BadRequestException;
import com.auraplays.backend.exception.DuplicateResourceException;
import com.auraplays.backend.exception.ResourceNotFoundException;
import com.auraplays.backend.repository.UserRepository;
import com.auraplays.backend.security.JwtTokenProvider;
import com.auraplays.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService Implementation — handles registration and login business logic.
 *
 * Registration flow:
 * 1. Check if email already exists → throw 409 if duplicate
 * 2. Encode password with BCrypt (never store plain text)
 * 3. Parse role from request (default to USER)
 * 4. Save user to MySQL
 * 5. Generate JWT token
 * 6. Return AuthResponse with token + user info
 *
 * Login flow:
 * 1. Authenticate via Spring Security's AuthenticationManager
 *    (which uses CustomUserDetailsService + BCrypt comparison)
 * 2. If credentials invalid → Spring throws BadCredentialsException → caught by GlobalExceptionHandler
 * 3. Generate JWT token
 * 4. Return AuthResponse
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        // Parse role — default to CUSTOMER if not specified
        Role role = Role.CUSTOMER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + request.getRole()
                        + ". Allowed values: CUSTOMER, COURT_OWNER");
            }
            // Prevent self-registration as ADMIN
            if (role == Role.ADMIN) {
                throw new BadRequestException("Admin accounts cannot be self-registered");
            }
        }

        // Build and save user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        // Generate JWT
        String token = jwtTokenProvider.generateToken(savedUser.getEmail());

        return buildAuthResponse(token, savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Authenticate via Spring Security
        // This internally calls CustomUserDetailsService.loadUserByUsername()
        // and compares passwords using BCrypt
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If we reach here, authentication succeeded
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return buildAuthResponse(token, user);
    }

    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return mapToUserResponse(user);
    }

    // ─── Helper Methods ───────────────────────────────────────────

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserResponse(user))
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole().name())
                .karmaPoints(user.getKarmaPoints())
                .skillLevel(user.getSkillLevel())
                .build();
    }
}
