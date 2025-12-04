package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.enums.FormatType;
import aws.movie_ticket_sales_web_project.enums.ShowtimeStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final CinemaHallRepository hallRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRoleRepository userRoleRepository;

    /**
     * Get showtimes for a cinema
     */
    public ApiResponse<PagedShowtimeResponse> getShowtimesByCinema(
            Integer cinemaId, Integer page, Integer size, String search) {

        try {
            // Verify cinema exists
            if (!cinemaRepository.existsById(cinemaId)) {
                return ApiResponse.<PagedShowtimeResponse>builder()
                        .success(false)
                        .message("Rạp chiếu phim không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size);

            Page<Showtime> showtimes;

            if (search != null && !search.trim().isEmpty()) {
                // Search by movie name or hall name
                showtimes = showtimeRepository.findShowtimesByCinemaWithSearch(
                        cinemaId, search.toLowerCase(), pageable);
            } else {
                showtimes = showtimeRepository.findShowtimesByCinema(cinemaId, pageable);
            }

            List<ShowtimeDto> dtos = showtimes.getContent().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            PagedShowtimeResponse response = PagedShowtimeResponse.builder()
                    .showtimes(dtos)
                    .currentPage(page)
                    .totalPages(showtimes.getTotalPages())
                    .totalItems(showtimes.getTotalElements())
                    .build();

            return ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .message("Lấy danh sách suất chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting showtimes for cinema: {}", cinemaId, e);
            return ApiResponse.<PagedShowtimeResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách suất chiếu")
                    .build();
        }
    }

    /**
     * Get showtimes for a hall
     */
    public ApiResponse<PagedShowtimeResponse> getShowtimesByHall(
            Integer hallId, Integer page, Integer size) {

        try {
            // Verify hall exists
            if (!hallRepository.existsById(hallId)) {
                return ApiResponse.<PagedShowtimeResponse>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<Showtime> showtimes = showtimeRepository.findShowtimesByHall(hallId, pageable);

            List<ShowtimeDto> dtos = showtimes.getContent().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            PagedShowtimeResponse response = PagedShowtimeResponse.builder()
                    .showtimes(dtos)
                    .currentPage(page)
                    .totalPages(showtimes.getTotalPages())
                    .totalItems(showtimes.getTotalElements())
                    .build();

            return ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .message("Lấy danh sách suất chiếu thành công")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error getting showtimes for hall: {}", hallId, e);
            return ApiResponse.<PagedShowtimeResponse>builder()
                    .success(false)
                    .message("Lỗi khi lấy danh sách suất chiếu")
                    .build();
        }
    }

    /**
     * Get showtime by ID
     */
    public ApiResponse<ShowtimeDto> getShowtimeById(Integer showtimeId) {

        try {
            Optional<Showtime> showtime = showtimeRepository.findById(showtimeId);

            if (showtime.isEmpty()) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Suất chiếu không tồn tại")
                        .build();
            }

            ShowtimeDto dto = convertToDto(showtime.get());

            return ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Lấy suất chiếu thành công")
                    .data(dto)
                    .build();

        } catch (Exception e) {
            log.error("Error getting showtime: {}", showtimeId, e);
            return ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Lỗi khi lấy suất chiếu")
                    .build();
        }
    }

    /**
     * Create showtime (admin only)
     */
    @Transactional
    public ApiResponse<ShowtimeDto> createShowtime(
            CreateShowtimeRequest request, Integer userId) {

        try {
            // Verify user is admin
            if (!isSystemAdmin(userId)) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Chỉ quản trị viên có thể tạo suất chiếu")
                        .build();
            }

            // Verify movie exists
            Optional<Movie> movie = movieRepository.findById(request.getMovieId());
            if (movie.isEmpty()) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Phim không tồn tại")
                        .build();
            }

            // Verify hall exists
            Optional<CinemaHall> hall = hallRepository.findById(request.getHallId());
            if (hall.isEmpty()) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Phòng chiếu không tồn tại")
                        .build();
            }

            // Verify start time < end time
            if (!request.getStartTime().isBefore(request.getEndTime())) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Thời gian bắt đầu phải trước thời gian kết thúc")
                        .build();
            }

            // Create showtime
            Showtime showtime = new Showtime();
            showtime.setMovie(movie.get());
            showtime.setHall(hall.get());
            showtime.setShowDate(request.getShowDate());
            showtime.setStartTime(request.getStartTime());
            showtime.setEndTime(request.getEndTime());
            
            // Handle format type
            try {
                if (request.getFormatType() != null) {
                    showtime.setFormatType(FormatType.valueOf(request.getFormatType().toUpperCase()));
                } else {
                    showtime.setFormatType(FormatType.valueOf("2D"));
                }
            } catch (IllegalArgumentException e) {
                showtime.setFormatType(FormatType.valueOf("2D"));
            }
            
            showtime.setSubtitleLanguage(request.getSubtitleLanguage());
            if (request.getPrice() != null) {
                showtime.setBasePrice(BigDecimal.valueOf(request.getPrice()));
            }
            showtime.setAvailableSeats(hall.get().getTotalSeats());
            showtime.setStatus(ShowtimeStatus.SCHEDULED);

            Showtime saved = showtimeRepository.save(showtime);

            ShowtimeDto dto = convertToDto(saved);

            return ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Tạo suất chiếu thành công")
                    .data(dto)
                    .build();

        } catch (Exception e) {
            log.error("Error creating showtime", e);
            return ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Lỗi khi tạo suất chiếu")
                    .build();
        }
    }

    /**
     * Update showtime (admin only)
     */
    @Transactional
    public ApiResponse<ShowtimeDto> updateShowtime(
            UpdateShowtimeRequest request, Integer userId) {

        try {
            // Verify user is admin
            if (!isSystemAdmin(userId)) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Chỉ quản trị viên có thể cập nhật suất chiếu")
                        .build();
            }

            // Verify showtime exists
            Optional<Showtime> showtimeOpt = showtimeRepository.findById(request.getShowtimeId());
            if (showtimeOpt.isEmpty()) {
                return ApiResponse.<ShowtimeDto>builder()
                        .success(false)
                        .message("Suất chiếu không tồn tại")
                        .build();
            }

            Showtime showtime = showtimeOpt.get();

            // Update fields if provided
            if (request.getPrice() != null) {
                showtime.setBasePrice(BigDecimal.valueOf(request.getPrice()));
            }
            if (request.getFormatType() != null) {
                try {
                    showtime.setFormatType(FormatType.valueOf(request.getFormatType().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    // Keep existing format
                }
            }
            if (request.getSubtitleLanguage() != null) {
                showtime.setSubtitleLanguage(request.getSubtitleLanguage());
            }
            if (request.getStatus() != null) {
                showtime.setStatus(request.getStatus());
            }
            if (request.getStartTime() != null && request.getEndTime() != null) {
                if (!request.getStartTime().isBefore(request.getEndTime())) {
                    return ApiResponse.<ShowtimeDto>builder()
                            .success(false)
                            .message("Thời gian bắt đầu phải trước thời gian kết thúc")
                            .build();
                }
                showtime.setStartTime(request.getStartTime());
                showtime.setEndTime(request.getEndTime());
            }

            Showtime updated = showtimeRepository.save(showtime);
            ShowtimeDto dto = convertToDto(updated);

            return ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Cập nhật suất chiếu thành công")
                    .data(dto)
                    .build();

        } catch (Exception e) {
            log.error("Error updating showtime", e);
            return ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Lỗi khi cập nhật suất chiếu")
                    .build();
        }
    }

    /**
     * Delete showtime (admin only)
     */
    @Transactional
    public ApiResponse<Void> deleteShowtime(Integer showtimeId, Integer userId) {

        try {
            // Verify user is admin
            if (!isSystemAdmin(userId)) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Chỉ quản trị viên có thể xóa suất chiếu")
                        .build();
            }

            // Verify showtime exists
            if (!showtimeRepository.existsById(showtimeId)) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Suất chiếu không tồn tại")
                        .build();
            }

            showtimeRepository.deleteById(showtimeId);

            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Xóa suất chiếu thành công")
                    .build();

        } catch (Exception e) {
            log.error("Error deleting showtime", e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Lỗi khi xóa suất chiếu")
                    .build();
        }
    }

    /**
     * Check if user is system admin
     */
    private boolean isSystemAdmin(Integer userId) {
        try {
            List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
            return userRoles.stream()
                    .anyMatch(userRole -> {
                        String roleName = userRole.getRole().getRoleName();
                        return "SYSTEM_ADMIN".equals(roleName) || "ADMIN".equals(roleName);
                    });
        } catch (Exception e) {
            log.error("Error checking if user is admin", e);
            return false;
        }
    }

    /**
     * Convert Showtime entity to ShowtimeDto
     */
    private ShowtimeDto convertToDto(Showtime showtime) {
        return ShowtimeDto.builder()
                .showtimeId(showtime.getId())
                .movieId(showtime.getMovie().getId())
                .movieName(showtime.getMovie().getTitle())
                .hallId(showtime.getHall().getId())
                .hallName(showtime.getHall().getHallName())
                .cinemaId(showtime.getHall().getCinema().getId())
                .cinemaName(showtime.getHall().getCinema().getCinemaName())
                .showDate(showtime.getShowDate())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .formatType(showtime.getFormatType() != null ? showtime.getFormatType().toString() : "2D")
                .subtitleLanguage(showtime.getSubtitleLanguage())
                .price(showtime.getBasePrice() != null ? showtime.getBasePrice().doubleValue() : 0.0)
                .availableSeats(showtime.getAvailableSeats())
                .status(showtime.getStatus())
                .build();
    }
}
