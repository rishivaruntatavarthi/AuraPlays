package com.auraplays.backend.security;

import com.auraplays.backend.entity.User;
import com.auraplays.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Bridges our User entity with Spring Security's UserDetails interface.
 *
 * Spring Security needs a UserDetailsService to load user data during authentication.
 * This service fetches the user by email from MySQL and wraps it in Spring Security's
 * User object with the appropriate role-based authority.
 *
 * Authority format: "ROLE_USER", "ROLE_VENUE_OWNER", "ROLE_ADMIN"
 * This prefix is required by Spring Security's hasRole() checks.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isActive(),        // enabled
                true,                   // accountNonExpired
                true,                   // credentialsNonExpired
                true,                   // accountNonLocked
                Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
                )
        );
    }
}
