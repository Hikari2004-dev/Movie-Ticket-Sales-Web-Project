package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class RoleManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    /**
     * Check if user has admin role
     */
    public boolean isUserAdmin(Integer userId) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        return userRoles.stream()
                .anyMatch(userRole -> {
                    String roleName = userRole.getRole().getRoleName();
                    return "SYSTEM_ADMIN".equals(roleName) || "ADMIN".equals(roleName);
                });
    }

    /**
     * Get all users with their roles (Admin only)
     */
    public ApiResponse<List<UserInfo>> getAllUsersWithRoles(Integer requestingUserId) {
        log.info("Getting all users with roles, requested by user: {}", requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<List<UserInfo>>builder()
                    .success(false)
                    .message("Access denied. Only administrators can view all users.")
                    .build();
        }

        try {
            List<User> users = userRepository.findAll();
            List<UserInfo> userInfoList = users.stream()
                    .map(this::convertToUserInfo)
                    .collect(Collectors.toList());

            return ApiResponse.<List<UserInfo>>builder()
                    .success(true)
                    .message("Users retrieved successfully")
                    .data(userInfoList)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving users", e);
            return ApiResponse.<List<UserInfo>>builder()
                    .success(false)
                    .message("Failed to retrieve users: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update user role (Admin only)
     */
    @Transactional
    public ApiResponse<UserInfo> updateUserRole(UpdateUserRoleRequest request, Integer requestingUserId) {
        log.info("Updating role for user: {} to role: {}, requested by: {}", 
                request.getUserId(), request.getRoleName(), requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<UserInfo>builder()
                    .success(false)
                    .message("Access denied. Only administrators can update user roles.")
                    .build();
        }

        try {
            // Validate role exists in database
            Role role = roleRepository.findByRoleName(request.getRoleName())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleName()));

            // Find user
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Remove existing roles
            List<UserRole> existingRoles = userRoleRepository.findByUserId(request.getUserId());
            userRoleRepository.deleteAll(existingRoles);

            // Assign new role
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            userRole.setAssignedAt(Instant.now());

            User assignedByUser = userRepository.findById(requestingUserId)
                    .orElse(null);
            userRole.setAssignedBy(assignedByUser);

            userRoleRepository.save(userRole);

            UserInfo userInfo = convertToUserInfo(user);

            log.info("Role updated successfully for user: {} to role: {}", 
                    request.getUserId(), request.getRoleName());

            return ApiResponse.<UserInfo>builder()
                    .success(true)
                    .message("User role updated successfully")
                    .data(userInfo)
                    .build();

        } catch (Exception e) {
            log.error("Error updating user role", e);
            return ApiResponse.<UserInfo>builder()
                    .success(false)
                    .message("Failed to update user role: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert User entity to UserInfo DTO
     */
    private UserInfo convertToUserInfo(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(user.getId());
        List<String> roleNames = userRoles.stream()
                .map(userRole -> userRole.getRole().getRoleName())
                .collect(Collectors.toList());

        UserInfo userInfo = new UserInfo();
        userInfo.setUserId(user.getId());
        userInfo.setEmail(user.getEmail());
        userInfo.setFullName(user.getFullName());
        userInfo.setRoles(roleNames);
        
        // Note: Membership info could be added here if needed
        userInfo.setMembershipTier(null);
        userInfo.setAvailablePoints(0);

        return userInfo;
    }

    /**
     * Get all available roles (Admin only)
     */
    public ApiResponse<List<Role>> getAllRoles(Integer requestingUserId) {
        log.info("Getting all roles, requested by user: {}", requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<List<Role>>builder()
                    .success(false)
                    .message("Access denied. Only administrators can view all roles.")
                    .build();
        }

        try {
            List<Role> roles = roleRepository.findAll();

            return ApiResponse.<List<Role>>builder()
                    .success(true)
                    .message("Roles retrieved successfully")
                    .data(roles)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving roles", e);
            return ApiResponse.<List<Role>>builder()
                    .success(false)
                    .message("Failed to retrieve roles: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Add new role (Admin only)
     */
    @Transactional
    public ApiResponse<Role> addRole(String roleName, String description, Integer requestingUserId) {
        log.info("Adding new role: {} by user: {}", roleName, requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<Role>builder()
                    .success(false)
                    .message("Access denied. Only administrators can add new roles.")
                    .build();
        }

        try {
            // Check if role already exists
            if (roleRepository.findByRoleName(roleName).isPresent()) {
                return ApiResponse.<Role>builder()
                        .success(false)
                        .message("Role already exists: " + roleName)
                        .build();
            }

            Role newRole = new Role();
            newRole.setRoleName(roleName.toUpperCase());
            newRole.setDescription(description);
            newRole.setCreatedAt(Instant.now());

            Role savedRole = roleRepository.save(newRole);

            log.info("Role added successfully: {}", roleName);

            return ApiResponse.<Role>builder()
                    .success(true)
                    .message("Role added successfully")
                    .data(savedRole)
                    .build();

        } catch (Exception e) {
            log.error("Error adding role", e);
            return ApiResponse.<Role>builder()
                    .success(false)
                    .message("Failed to add role: " + e.getMessage())
                    .build();
        }
    }
}