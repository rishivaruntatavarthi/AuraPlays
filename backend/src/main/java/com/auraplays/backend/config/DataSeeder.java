package com.auraplays.backend.config;

import com.auraplays.backend.entity.User;
import com.auraplays.backend.entity.enums.Role;
import com.auraplays.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Forcefully alter the role column to VARCHAR(50) to bypass MySQL ENUM truncation errors
            // This is safer than relying on ddl-auto=create which might be ignored by IDE caches
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL");
            System.out.println("Forcefully updated 'role' column to VARCHAR(50)");
        } catch (Exception e) {
            System.out.println("Could not alter table (might not exist yet): " + e.getMessage());
        }

        if (!userRepository.existsByEmail("admin@auraplay.com")) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@auraplay.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user seeded successfully.");
        }
    }
}
