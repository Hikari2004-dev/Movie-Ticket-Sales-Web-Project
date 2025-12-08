package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.ChangePasswordRequest;
import aws.movie_ticket_sales_web_project.dto.UpdateProfileRequest;
import aws.movie_ticket_sales_web_project.dto.UserProfileDto;
import aws.movie_ticket_sales_web_project.entity.Membership;
import aws.movie_ticket_sales_web_project.entity.MembershipTier;
import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.entity.UserRole;
import aws.movie_ticket_sales_web_project.repository.MembershipRepository;
import aws.movie_ticket_sales_web_project.repository.MembershipTierRepository;
import aws.movie_ticket_sales_web_project.repository.UserRepository;
import aws.movie_ticket_sales_web_project.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Lấy thông tin profile của user
     */
    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Integer userId) {
        log.info("Getting profile for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        return convertToDto(user);
    }

    /**
     * Cập nhật thông tin cá nhân
     */
    @Transactional
    public UserProfileDto updateProfile(Integer userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        // Cập nhật các field nếu được gửi lên
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        
        if (request.getPhoneNumber() != null) {
            // Kiểm tra số điện thoại đã tồn tại chưa (trừ user hiện tại)
            if (!request.getPhoneNumber().isBlank() && 
                userRepository.existsByPhoneNumber(request.getPhoneNumber()) &&
                !request.getPhoneNumber().equals(user.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại này đã được sử dụng bởi tài khoản khác");
            }
            user.setPhoneNumber(request.getPhoneNumber().isBlank() ? null : request.getPhoneNumber().trim());
        }
        
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().isBlank() ? null : request.getAvatarUrl().trim());
        }
        
        if (request.getMarketingEmailConsent() != null) {
            user.setMarketingEmailConsent(request.getMarketingEmailConsent());
        }
        
        if (request.getMarketingSmsConsent() != null) {
            user.setMarketingSmsConsent(request.getMarketingSmsConsent());
        }
        
        user.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(user);
        
        log.info("Profile updated successfully for user: {}", userId);
        return convertToDto(updatedUser);
    }

    /**
     * Thay đổi mật khẩu
     */
    @Transactional
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        
        // Kiểm tra mật khẩu mới và xác nhận khớp nhau
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }
        
        // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }
        
        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", userId);
    }

    /**
     * Cập nhật avatar
     */
    @Transactional
    public UserProfileDto updateAvatar(Integer userId, String avatarUrl) {
        log.info("Updating avatar for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        user.setAvatarUrl(avatarUrl);
        user.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(user);
        
        log.info("Avatar updated successfully for user: {}", userId);
        return convertToDto(updatedUser);
    }

    /**
     * Convert User entity to DTO
     */
    private UserProfileDto convertToDto(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(user.getId());
        List<String> roles = userRoles.stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());
        
        // Lấy thông tin membership
        UserProfileDto.MembershipInfo membershipInfo = getMembershipInfo(user.getId());
        
        return UserProfileDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .fullName(user.getFullName())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .marketingEmailConsent(user.getMarketingEmailConsent())
                .marketingSmsConsent(user.getMarketingSmsConsent())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roles)
                .membership(membershipInfo)
                .build();
    }
    
    /**
     * Lấy thông tin hạng thành viên của user
     */
    private UserProfileDto.MembershipInfo getMembershipInfo(Integer userId) {
        return membershipRepository.findByUserId(userId)
                .map(membership -> {
                    // Tự động kiểm tra và nâng hạng nếu đủ điều kiện
                    checkAndUpgradeTier(membership);
                    
                    MembershipTier currentTier = membership.getTier();
                    
                    // Tìm hạng tiếp theo (nếu có)
                    MembershipTier nextTier = membershipTierRepository.findByTierLevel(currentTier.getTierLevel() + 1)
                            .orElse(null);
                    
                    return UserProfileDto.MembershipInfo.builder()
                            .membershipNumber(membership.getMembershipNumber())
                            .tierName(currentTier.getTierName())
                            .tierNameDisplay(currentTier.getTierNameDisplay())
                            .tierLevel(currentTier.getTierLevel())
                            .totalPoints(membership.getTotalPoints())
                            .availablePoints(membership.getAvailablePoints())
                            .lifetimeSpending(membership.getLifetimeSpending())
                            .annualSpending(membership.getAnnualSpending())
                            .pointsEarnRate(currentTier.getPointsEarnRate())
                            .freeTicketsPerYear(currentTier.getFreeTicketsPerYear())
                            .birthdayGift(currentTier.getBirthdayGiftDescription())
                            .minSpendingForNextTier(nextTier != null ? nextTier.getMinAnnualSpending() : null)
                            .nextTierName(nextTier != null ? nextTier.getTierNameDisplay() : null)
                            .status(membership.getStatus() != null ? membership.getStatus().name() : "ACTIVE")
                            .build();
                })
                .orElseGet(() -> {
                    // Nếu user chưa có membership, trả về thông tin mặc định (BRONZE)
                    return membershipTierRepository.findByTierLevel(1)
                            .map(defaultTier -> {
                                MembershipTier nextTier = membershipTierRepository.findByTierLevel(2).orElse(null);
                                return UserProfileDto.MembershipInfo.builder()
                                        .membershipNumber("Chưa đăng ký")
                                        .tierName(defaultTier.getTierName())
                                        .tierNameDisplay(defaultTier.getTierNameDisplay())
                                        .tierLevel(defaultTier.getTierLevel())
                                        .totalPoints(0)
                                        .availablePoints(0)
                                        .lifetimeSpending(java.math.BigDecimal.ZERO)
                                        .annualSpending(java.math.BigDecimal.ZERO)
                                        .pointsEarnRate(defaultTier.getPointsEarnRate())
                                        .freeTicketsPerYear(defaultTier.getFreeTicketsPerYear())
                                        .birthdayGift(defaultTier.getBirthdayGiftDescription())
                                        .minSpendingForNextTier(nextTier != null ? nextTier.getMinAnnualSpending() : null)
                                        .nextTierName(nextTier != null ? nextTier.getTierNameDisplay() : null)
                                        .status("NEW")
                                        .build();
                            })
                            .orElse(null);
                });
    }
    
    /**
     * Kiểm tra và nâng hạng membership khi xem profile
     */
    private void checkAndUpgradeTier(Membership membership) {
        try {
            MembershipTier currentTier = membership.getTier();
            if (currentTier == null) {
                return;
            }
            
            java.math.BigDecimal annualSpending = membership.getAnnualSpending() != null 
                    ? membership.getAnnualSpending() 
                    : java.math.BigDecimal.ZERO;
            
            log.info("Checking tier upgrade: userId={}, annualSpending={}, currentTier={}, currentTierLevel={}", 
                    membership.getUser().getId(), annualSpending, currentTier.getTierName(), currentTier.getTierLevel());
            
            // Log all tiers for debug
            java.util.List<MembershipTier> allTiers = membershipTierRepository.findAll();
            log.info("All tiers count: {}", allTiers.size());
            allTiers.forEach(t -> log.info("  Tier: {} level={} minSpending={}", 
                    t.getTierName(), t.getTierLevel(), t.getMinAnnualSpending()));
            
            // Tìm tier CAO NHẤT mà user đủ điều kiện
            java.util.Optional<MembershipTier> qualifiedTier = membershipTierRepository.findAll().stream()
                    .filter(tier -> tier.getTierLevel() != null && currentTier.getTierLevel() != null)
                    .filter(tier -> tier.getTierLevel() > currentTier.getTierLevel())
                    .filter(tier -> {
                        java.math.BigDecimal minSpending = tier.getMinAnnualSpending() != null 
                                ? tier.getMinAnnualSpending() 
                                : java.math.BigDecimal.ZERO;
                        boolean qualified = annualSpending.compareTo(minSpending) >= 0;
                        log.info("  Checking {} (level {}): minSpending={}, qualified={}", 
                                tier.getTierName(), tier.getTierLevel(), minSpending, qualified);
                        return qualified;
                    })
                    .max((t1, t2) -> t1.getTierLevel().compareTo(t2.getTierLevel()));
                    
            if (qualifiedTier.isPresent()) {
                MembershipTier newTier = qualifiedTier.get();
                log.info("🎉 Auto-upgrading user {} from {} to {}", 
                        membership.getUser().getId(), 
                        currentTier.getTierName(), 
                        newTier.getTierName());
                membership.setTier(newTier);
                membership.setTierStartDate(java.time.LocalDate.now());
                membership.setUpdatedAt(Instant.now());
                membershipRepository.save(membership);
            } else {
                log.info("No tier upgrade available for user {}", membership.getUser().getId());
            }
                    
        } catch (Exception e) {
            log.error("Error checking tier upgrade: {}", e.getMessage(), e);
        }
    }
}
