package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for user profile response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    
    private Integer userId;
    
    private String email;
    
    private String phoneNumber;
    
    private String fullName;
    
    private LocalDate dateOfBirth;
    
    private Gender gender;
    
    private String avatarUrl;
    
    private Boolean isActive;
    
    private Boolean isEmailVerified;
    
    private Boolean isPhoneVerified;
    
    private Boolean marketingEmailConsent;
    
    private Boolean marketingSmsConsent;
    
    private Instant lastLoginAt;
    
    private Instant createdAt;
    
    private Instant updatedAt;
    
    // Roles
    private List<String> roles;
    
    // Loyalty points
    private Integer loyaltyPoints;
    
    private String membershipTier;
}
