package com.auraplays.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("Clearing database records for a fresh start...");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0;");
            jdbcTemplate.execute("TRUNCATE TABLE game_players;");
            jdbcTemplate.execute("TRUNCATE TABLE games;");
            jdbcTemplate.execute("TRUNCATE TABLE reviews;");
            jdbcTemplate.execute("TRUNCATE TABLE payments;");
            jdbcTemplate.execute("TRUNCATE TABLE bookings;");
            jdbcTemplate.execute("TRUNCATE TABLE court_slots;");
            jdbcTemplate.execute("TRUNCATE TABLE court_images;");
            jdbcTemplate.execute("TRUNCATE TABLE courts;");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1;");
            System.out.println("Database tables truncated successfully!");
        } catch (Exception e) {
            System.out.println("Failed to clear database: " + e.getMessage());
        }

        try {
            // Drop old unique constraint if it exists
            jdbcTemplate.execute("ALTER TABLE court_slots DROP INDEX UKdl5b2cbcufk4hakn2g10o4gds");
            System.out.println("Successfully dropped old unique constraint UKdl5b2cbcufk4hakn2g10o4gds");
        } catch (Exception e) {
            // It might already be dropped or not exist, so we catch and ignore the exception
            System.out.println("Old unique constraint UKdl5b2cbcufk4hakn2g10o4gds not found or already dropped: " + e.getMessage());
        }

        try {
            // Update all existing courts to have auto-approve enabled by default
            jdbcTemplate.execute("UPDATE courts SET is_auto_approve_enabled = true WHERE is_auto_approve_enabled = false OR is_auto_approve_enabled IS NULL");
            System.out.println("Successfully set auto-approve to true for all existing courts");
        } catch (Exception e) {
            System.out.println("Failed to update existing courts' auto-approve status: " + e.getMessage());
        }
    }
}
