package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.CinemaHallService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cinema-halls")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class CinemaHallController {

    private final CinemaHallService cinemaHallService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Extract user ID from JWT token
     */
    private Integer getUserIdFromToken(String token) {
        try {
            String actualToken = token.replace("Bearer ", "");
            return jwtTokenProvider.getUserIdFromToken(actualToken);
        } catch (Exception e) {
            log.error("Error extracting user ID from token", e);
            return null;
        }
    }

    /**
     * Get all cinema halls for a cinema (public - active only)
     * GET /api/cinema-halls/cinema/{cinemaId}
     */
    @GetMapping("/cinema/{cinemaId}")
    public ResponseEntity<ApiResponse<PagedCinemaHallResponse>> getAllHallsByCinema(
            @PathVariable Integer cinemaId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String search) {

        log.info("Getting all halls for cinema: {} - page: {}, size: {}, search: {}", cinemaId, page, size, search);

        ApiResponse<PagedCinemaHallResponse> response = cinemaHallService.getAllHallsByCinema(cinemaId, page, size, search);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get all cinema halls for a cinema (admin - all including inactive)
     * GET /api/cinema-halls/cinema/{cinemaId}/admin
     */
    @GetMapping("/cinema/{cinemaId}/admin")
    public ResponseEntity<ApiResponse<PagedCinemaHallResponse>> getAllHallsByCinemaAdmin(
            @PathVariable Integer cinemaId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String search,
            @RequestHeader("Authorization") String token) {

        log.info("Admin getting all halls for cinema: {} - page: {}, size: {}, search: {}", cinemaId, page, size, search);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<PagedCinemaHallResponse>builder()
                                .success(false)
                                .message("Token không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            ApiResponse<PagedCinemaHallResponse> response = cinemaHallService.getAllHallsByCinemaAdmin(cinemaId, page, size, search, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting cinema halls for admin", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<PagedCinemaHallResponse>builder()
                            .success(false)
                            .message("Token không hợp lệ hoặc đã hết hạn")
                            .build());
        }
    }

    /**
     * Create cinema hall (admin only)
     * POST /api/cinema-halls/admin
     */
    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<CinemaHallDto>> createCinemaHall(
            @RequestBody CreateCinemaHallRequest request,
            @RequestHeader("Authorization") String token) {

        log.info("Creating cinema hall: {} for cinema: {}", request.getHallName(), request.getCinemaId());

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<CinemaHallDto>builder()
                                .success(false)
                                .message("Token không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            ApiResponse<CinemaHallDto> response = cinemaHallService.createCinemaHall(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error creating cinema hall", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<CinemaHallDto>builder()
                            .success(false)
                            .message("Token không hợp lệ hoặc đã hết hạn")
                            .build());
        }
    }

    /**
     * Update cinema hall (admin only)
     * PUT /api/cinema-halls/admin/{hallId}
     */
    @PutMapping("/admin/{hallId}")
    public ResponseEntity<ApiResponse<CinemaHallDto>> updateCinemaHall(
            @PathVariable Integer hallId,
            @RequestBody UpdateCinemaHallRequest request,
            @RequestHeader("Authorization") String token) {

        log.info("Updating cinema hall: {} for cinema: {}", hallId, request.getCinemaId());

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<CinemaHallDto>builder()
                                .success(false)
                                .message("Token không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            // Ensure hallId in URL matches request body
            request.setHallId(hallId);

            ApiResponse<CinemaHallDto> response = cinemaHallService.updateCinemaHall(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error updating cinema hall", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<CinemaHallDto>builder()
                            .success(false)
                            .message("Token không hợp lệ hoặc đã hết hạn")
                            .build());
        }
    }

    /**
     * Delete cinema hall (admin only)
     * DELETE /api/cinema-halls/admin/{hallId}?cinemaId={cinemaId}
     */
    @DeleteMapping("/admin/{hallId}")
    public ResponseEntity<ApiResponse<Void>> deleteCinemaHall(
            @PathVariable Integer hallId,
            @RequestParam Integer cinemaId,
            @RequestHeader("Authorization") String token) {

        log.info("Deleting cinema hall: {} for cinema: {}", hallId, cinemaId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<Void>builder()
                                .success(false)
                                .message("Token không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            ApiResponse<Void> response = cinemaHallService.deleteCinemaHall(cinemaId, hallId, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error deleting cinema hall", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Token không hợp lệ hoặc đã hết hạn")
                            .build());
        }
    }
}
