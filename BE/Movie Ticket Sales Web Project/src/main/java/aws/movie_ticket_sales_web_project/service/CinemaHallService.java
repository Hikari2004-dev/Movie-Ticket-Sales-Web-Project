package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.CinemaHall;
import aws.movie_ticket_sales_web_project.entity.UserRole;
import aws.movie_ticket_sales_web_project.repository.CinemaHallRepository;
import aws.movie_ticket_sales_web_project.repository.CinemaRepository;
import aws.movie_ticket_sales_web_project.repository.UserRoleRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class CinemaHallService {

    private final CinemaHallRepository cinemaHallRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRoleRepository userRoleRepository;

    /**
     * Check if user has SYSTEM_ADMIN or ADMIN role
     */
    private boolean isSystemAdmin(Integer userId) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        return userRoles.stream()
                .anyMatch(userRole -> {
                    String roleName = userRole.getRole().getRoleName();
                    return "SYSTEM_ADMIN".equals(roleName) || "ADMIN".equals(roleName);
                });
    }

    /**
     * Check if user is manager of the cinema
     */
    private boolean isCinemaManager(Integer userId, Integer cinemaId) {
        Optional<Cinema> cinema = cinemaRepository.findById(cinemaId);
        if (cinema.isEmpty()) {
            return false;
        }
        Cinema c = cinema.get();
        return c.getManager() != null && c.getManager().getId().equals(userId);
    }

    /**
     * Get all halls in a cinema (public - active only)
     */
    public ApiResponse<PagedCinemaHallResponse> getAllHallsByCinema(Integer cinemaId, Integer page, Integer size, String search) {
        log.info("Getting all halls for cinema: {}, page: {}, size: {}, search: {}", cinemaId, page, size, search);

        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        try {
            // Verify cinema exists
            if (!cinemaRepository.existsById(cinemaId)) {
                return ApiResponse.<PagedCinemaHallResponse>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<CinemaHall> hallPage;

            if (search != null && !search.isEmpty()) {
                log.debug("Searching halls in cinema {} with term: {}", cinemaId, search);
                hallPage = cinemaHallRepository.searchActiveByNameInCinema(cinemaId, search, pageable);
            } else {
                log.debug("Getting all active halls in cinema: {}", cinemaId);
                hallPage = cinemaHallRepository.findByCinemaIdAndIsActiveTrue(cinemaId, pageable);
            }

            List<CinemaHallDto> hallDtos = hallPage.getContent()
                    .stream()
                    .map(this::convertToCinemaHallDto)
                    .collect(Collectors.toList());

            PagedCinemaHallResponse response = PagedCinemaHallResponse.builder()
                    .totalElements(hallPage.getTotalElements())
                    .totalPages(hallPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .hasNext(hallPage.hasNext())
                    .hasPrevious(hallPage.hasPrevious())
                    .data(hallDtos)
                    .build();

            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Lấy danh sách phòng chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting halls by cinema", e);
            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all halls in a cinema for manager (admin - all including inactive)
     */
    public ApiResponse<PagedCinemaHallResponse> getAllHallsByCinemaAdmin(Integer cinemaId, Integer page, Integer size, String search, Integer userId) {
        log.info("Admin getting all halls for cinema: {}, page: {}, size: {}, search: {}", cinemaId, page, size, search);

        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        // Log authorization check
        boolean isAdmin = isSystemAdmin(userId);
        boolean isManager = isCinemaManager(userId, cinemaId);
        log.info("Authorization check - User ID: {}, Is System Admin: {}, Is Cinema Manager: {}", userId, isAdmin, isManager);

        if (!isAdmin && !isManager) {
            log.warn("User {} does not have permission to view halls for cinema {}", userId, cinemaId);
            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Bạn không có quyền xem phòng chiếu của rạp này")
                    .build();
        }

        try {
            // Verify cinema exists
            if (!cinemaRepository.existsById(cinemaId)) {
                return ApiResponse.<PagedCinemaHallResponse>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<CinemaHall> hallPage;

            if (search != null && !search.isEmpty()) {
                log.debug("Manager searching halls in cinema {} with term: {}", cinemaId, search);
                hallPage = cinemaHallRepository.searchByNameInCinema(cinemaId, search, pageable);
            } else {
                log.debug("Manager getting all halls in cinema: {}", cinemaId);
                hallPage = cinemaHallRepository.findByCinemaId(cinemaId, pageable);
            }

            List<CinemaHallDto> hallDtos = hallPage.getContent()
                    .stream()
                    .map(this::convertToCinemaHallDto)
                    .collect(Collectors.toList());

            PagedCinemaHallResponse response = PagedCinemaHallResponse.builder()
                    .totalElements(hallPage.getTotalElements())
                    .totalPages(hallPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .hasNext(hallPage.hasNext())
                    .hasPrevious(hallPage.hasPrevious())
                    .data(hallDtos)
                    .build();

            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(true)
                    .message("Lấy danh sách phòng chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting halls by cinema for admin", e);
            return ApiResponse.<PagedCinemaHallResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create cinema hall
     */
    @Transactional
    public ApiResponse<CinemaHallDto> createCinemaHall(CreateCinemaHallRequest request, Integer userId) {
        log.info("Creating cinema hall: {} for cinema: {}, requested by: {}", request.getHallName(), request.getCinemaId(), userId);

        // Validate request first
        if (request.getCinemaId() == null) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Mã rạp không được để trống")
                    .build();
        }

        // Check authorization - SYSTEM_ADMIN or cinema manager
        boolean isAdmin = isSystemAdmin(userId);
        boolean isManager = isCinemaManager(userId, request.getCinemaId());

        if (!isAdmin && !isManager) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Bạn không có quyền tạo phòng chiếu cho rạp này")
                    .build();
        }

        // Validate request
        if (request.getCinemaId() == null || request.getHallName() == null || request.getHallName().isEmpty()) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Mã rạp và tên phòng chiếu không được để trống")
                    .build();
        }

        if (request.getTotalSeats() == null || request.getTotalSeats() <= 0) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Số ghế phải lớn hơn 0")
                    .build();
        }

        try {
            // Verify cinema exists
            Optional<Cinema> cinema = cinemaRepository.findById(request.getCinemaId());
            if (cinema.isEmpty()) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            // Check if hall name already exists in this cinema
            if (cinemaHallRepository.existsByHallNameInCinema(request.getCinemaId(), request.getHallName())) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Phòng chiếu với tên này đã tồn tại")
                        .build();
            }

            CinemaHall hall = new CinemaHall();
            hall.setCinema(cinema.get());
            hall.setHallName(request.getHallName());
            if (request.getHallType() != null) {
                try {
                    hall.setHallType(aws.movie_ticket_sales_web_project.enums.HallType.valueOf(request.getHallType()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid hall type: {}, using default", request.getHallType());
                }
            }
            hall.setTotalSeats(request.getTotalSeats());
            hall.setRowsCount(request.getRowsCount());
            hall.setSeatsPerRow(request.getSeatsPerRow());
            hall.setScreenType(request.getScreenType());
            hall.setSoundSystem(request.getSoundSystem());
            hall.setSeatLayout(request.getSeatLayout());
            hall.setIsActive(true);
            hall.setCreatedAt(Instant.now());
            hall.setUpdatedAt(Instant.now());

            CinemaHall savedHall = cinemaHallRepository.save(hall);

            log.info("Cinema hall created successfully with ID: {}", savedHall.getId());
            return ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Tạo phòng chiếu thành công")
                    .data(convertToCinemaHallDto(savedHall))
                    .build();

        } catch (Exception e) {
            log.error("Error creating cinema hall", e);
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Lỗi khi tạo phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update cinema hall
     */
    @Transactional
    public ApiResponse<CinemaHallDto> updateCinemaHall(UpdateCinemaHallRequest request, Integer userId) {
        log.info("Updating cinema hall ID: {} for cinema: {}, requested by: {}", request.getHallId(), request.getCinemaId(), userId);

        // Validate request
        if (request.getHallId() == null || request.getCinemaId() == null) {
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Mã phòng chiếu và mã rạp không được để trống")
                    .build();
        }

        try {
            Optional<CinemaHall> existingHall = cinemaHallRepository.findByIdAndCinemaId(request.getHallId(), request.getCinemaId());

            if (existingHall.isEmpty()) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }

            CinemaHall hall = existingHall.get();

            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, request.getCinemaId());

            if (!isAdmin && !isManager) {
                return ApiResponse.<CinemaHallDto>builder()
                        .success(false)
                        .message("Bạn không có quyền cập nhật phòng chiếu này")
                        .build();
            }

            // Check if new name already exists (excluding current hall)
            if (request.getHallName() != null && !request.getHallName().isEmpty() &&
                    !request.getHallName().equals(hall.getHallName())) {
                if (cinemaHallRepository.existsByHallNameInCinemaExcludingId(request.getCinemaId(), request.getHallName(), request.getHallId())) {
                    return ApiResponse.<CinemaHallDto>builder()
                            .success(false)
                            .message("Phòng chiếu với tên này đã tồn tại")
                            .build();
                }
                hall.setHallName(request.getHallName());
            }

            if (request.getHallType() != null) {
                try {
                    hall.setHallType(aws.movie_ticket_sales_web_project.enums.HallType.valueOf(request.getHallType()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid hall type: {}, skipping update", request.getHallType());
                }
            }
            if (request.getTotalSeats() != null && request.getTotalSeats() > 0) {
                hall.setTotalSeats(request.getTotalSeats());
            }
            if (request.getRowsCount() != null) {
                hall.setRowsCount(request.getRowsCount());
            }
            if (request.getSeatsPerRow() != null) {
                hall.setSeatsPerRow(request.getSeatsPerRow());
            }
            if (request.getScreenType() != null) {
                hall.setScreenType(request.getScreenType());
            }
            if (request.getSoundSystem() != null) {
                hall.setSoundSystem(request.getSoundSystem());
            }
            if (request.getSeatLayout() != null) {
                hall.setSeatLayout(request.getSeatLayout());
            }
            if (request.getIsActive() != null) {
                hall.setIsActive(request.getIsActive());
            }

            hall.setUpdatedAt(Instant.now());

            CinemaHall updatedHall = cinemaHallRepository.save(hall);

            log.info("Cinema hall updated successfully with ID: {}", updatedHall.getId());
            return ApiResponse.<CinemaHallDto>builder()
                    .success(true)
                    .message("Cập nhật phòng chiếu thành công")
                    .data(convertToCinemaHallDto(updatedHall))
                    .build();

        } catch (Exception e) {
            log.error("Error updating cinema hall", e);
            return ApiResponse.<CinemaHallDto>builder()
                    .success(false)
                    .message("Lỗi khi cập nhật phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete cinema hall (soft delete)
     */
    @Transactional
    public ApiResponse<Void> deleteCinemaHall(Integer cinemaId, Integer hallId, Integer userId) {
        log.info("Deleting cinema hall ID: {} for cinema: {}, requested by: {}", hallId, cinemaId, userId);

        try {
            Optional<CinemaHall> existingHall = cinemaHallRepository.findByIdAndCinemaId(hallId, cinemaId);

            if (existingHall.isEmpty()) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }

            CinemaHall hall = existingHall.get();

            // Check authorization
            boolean isAdmin = isSystemAdmin(userId);
            boolean isManager = isCinemaManager(userId, cinemaId);

            if (!isAdmin && !isManager) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Bạn không có quyền xóa phòng chiếu này")
                        .build();
            }

            hall.setIsActive(false);
            hall.setUpdatedAt(Instant.now());

            cinemaHallRepository.save(hall);

            log.info("Cinema hall deleted successfully with ID: {}", hallId);
            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Xóa phòng chiếu thành công")
                    .build();

        } catch (Exception e) {
            log.error("Error deleting cinema hall", e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Lỗi khi xóa phòng chiếu: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert CinemaHall entity to DTO
     */
    private CinemaHallDto convertToCinemaHallDto(CinemaHall hall) {
        return CinemaHallDto.builder()
                .hallId(hall.getId())
                .cinemaId(hall.getCinema().getId())
                .cinemaName(hall.getCinema().getCinemaName())
                .hallName(hall.getHallName())
                .hallType(hall.getHallType() != null ? hall.getHallType().toString() : null)
                .totalSeats(hall.getTotalSeats())
                .rowsCount(hall.getRowsCount())
                .seatsPerRow(hall.getSeatsPerRow())
                .screenType(hall.getScreenType())
                .soundSystem(hall.getSoundSystem())
                .seatLayout(hall.getSeatLayout())
                .isActive(hall.getIsActive())
                .createdAt(hall.getCreatedAt())
                .updatedAt(hall.getUpdatedAt())
                .build();
    }
}
