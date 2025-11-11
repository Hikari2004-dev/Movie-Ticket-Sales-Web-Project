package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.service.RoleManagementService;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final RoleManagementService roleManagementService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Get all users with their roles (Admin only)
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserInfo>>> getAllUsers(
            @RequestHeader("Authorization") String token) {
        
        try {
            Integer userId = getUserIdFromToken(token);
            ApiResponse<List<UserInfo>> response = roleManagementService.getAllUsersWithRoles(userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting users", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<UserInfo>>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Update user role (Admin only)
     * PUT /api/admin/users/role
     */
    @PutMapping("/users/role")
    public ResponseEntity<ApiResponse<UserInfo>> updateUserRole(
            @RequestBody UpdateUserRoleRequest request,
            @RequestHeader("Authorization") String token) {
        
        try {
            Integer userId = getUserIdFromToken(token);
            ApiResponse<UserInfo> response = roleManagementService.updateUserRole(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error updating user role", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<UserInfo>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Extract user ID from JWT token
     */
    private Integer getUserIdFromToken(String token) {
        String actualToken = token.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromToken(actualToken);
    }
}