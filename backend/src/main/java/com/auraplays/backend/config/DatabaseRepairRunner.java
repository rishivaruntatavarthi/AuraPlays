package com.auraplays.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseRepairRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Drop the status column if it exists to fix the schema mismatch
            jdbcTemplate.execute("ALTER TABLE courts DROP COLUMN status;");
            System.out.println("✅ AuraPlays: Successfully dropped old 'status' column from courts table!");
        } catch (Exception e) {
            System.out.println("ℹ️ AuraPlays: Old 'status' column not found or already dropped.");
        }

        try {
            // Force LONGTEXT for images to avoid Base64 truncation
            jdbcTemplate.execute("ALTER TABLE court_images MODIFY COLUMN image_url LONGTEXT NOT NULL;");
            System.out.println("✅ AuraPlays: Successfully altered court_images.image_url to LONGTEXT!");
        } catch (Exception e) {
            System.out.println("ℹ️ AuraPlays: court_images table might not exist yet.");
        }

        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN profile_image_url LONGTEXT;");
            System.out.println("✅ AuraPlays: Successfully altered users.profile_image_url to LONGTEXT!");
        } catch (Exception e) {
            System.out.println("ℹ️ AuraPlays: users.profile_image_url might not exist yet.");
        }
    }
}
