package com.auraplays.backend.service;

import com.auraplays.backend.dto.request.LoginRequest;
import com.auraplays.backend.dto.request.RegisterRequest;
import com.auraplays.backend.dto.response.AuthResponse;
import com.auraplays.backend.dto.response.UserResponse;

/**
 * Auth Service Interface — defines the contract for authentication operations.
 *
 * Why interface + impl?
 * 1. Testability: Easy to mock in unit tests
 * 2. Flexibility: Can swap implementations (e.g., OAuth in the future)
 * 3. Clean architecture: Controller depends on abstraction, not concrete class
 */
public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse getCurrentUser(String email);
}
