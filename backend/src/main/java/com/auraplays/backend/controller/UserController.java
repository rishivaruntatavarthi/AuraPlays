package com.auraplays.backend.controller;

import com.auraplays.backend.entity.User;
import com.auraplays.backend.dto.response.UserResponse;
import com.auraplays.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Base64;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @PostMapping("/profile-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadProfileImage(@RequestParam("file") MultipartFile file, Principal principal) {
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // For MVP, we save as Base64. In prod, save to AWS S3.
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String imageUrl = "data:" + file.getContentType() + ";base64," + base64Image;
            
            user.setProfileImageUrl(imageUrl);
            userRepository.save(user);
            
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload image");
        }
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateProfile(@RequestBody User updateRequest, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updateRequest.getName() != null) user.setName(updateRequest.getName());
        if (updateRequest.getPhone() != null) user.setPhone(updateRequest.getPhone());
        if (updateRequest.getSkillLevel() != null) user.setSkillLevel(updateRequest.getSkillLevel());
        
        userRepository.save(user);
        
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .role(user.getRole().name())
                .karmaPoints(user.getKarmaPoints())
                .skillLevel(user.getSkillLevel())
                .build();
                
        return ResponseEntity.ok(response);
    }
}
