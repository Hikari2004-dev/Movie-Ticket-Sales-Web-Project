package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.CinemaChain;
import aws.movie_ticket_sales_web_project.entity.UserRole;
import aws.movie_ticket_sales_web_project.repository.CinemaChainRepository;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final CinemaChainRepository cinemaChainRepository;
    private final UserRoleRepository userRoleRepository;

    /**
     * Check if user has SYSTEM_ADMIN role
     */
    private boolean isSystemAdmin(Integer userId) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        return userRoles.stream()
                .anyMatch(userRole -> "SYSTEM_ADMIN".equals(userRole.getRole().getRoleName()));
    }

    /**
     * Get all cinemas for a chain (public - active only)
     */
    public ApiResponse<PagedCinemaResponse> getAllCinemasByChain(Integer chainId, Integer page, Integer size, String search) {
        log.info("Getting all cinemas for chain: {}, page: {}, size: {}, search: {}", chainId, page, size, search);

        // Set defaults
        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        try {
            // Verify chain exists
            if (!cinemaChainRepository.existsById(chainId)) {
                return ApiResponse.<PagedCinemaResponse>builder()
                        .success(false)
                        .message("Chuỗi rạp không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Cinema> cinemaPage;

            if (search != null && !search.isEmpty()) {
                cinemaPage = cinemaRepository.searchActiveByChainIdAndName(chainId, search, pageable);
            } else {
                cinemaPage = cinemaRepository.findByChainIdAndIsActiveTrue(chainId, pageable);
            }

            List<CinemaDto> cinemaDtos = cinemaPage.getContent()
                    .stream()
                    .map(this::convertToCinemaDto)
                    .collect(Collectors.toList());

            PagedCinemaResponse response = PagedCinemaResponse.builder()
                    .totalElements(cinemaPage.getTotalElements())
                    .totalPages(cinemaPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .data(cinemaDtos)
                    .build();

            return ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Danh sách rạp được tải thành công")
                    .data(response)
                    .build();
        } catch (Exception e) {
            log.error("Error getting cinemas by chain", e);
            return ApiResponse.<PagedCinemaResponse>builder()
                    .success(false)
                    .message("Lỗi khi tải danh sách rạp: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all cinemas for a chain (admin - all including inactive)
     */
    public ApiResponse<PagedCinemaResponse> getAllCinemasByChainAdmin(Integer chainId, Integer page, Integer size, String search, Integer userId) {
        log.info("Admin getting all cinemas for chain: {}, page: {}, size: {}, search: {}", chainId, page, size, search);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<PagedCinemaResponse>builder()
                    .success(false)
                    .message("Chỉ SYSTEM_ADMIN mới có thể truy cập")
                    .build();
        }

        // Set defaults
        page = (page != null) ? page : 0;
        size = (size != null) ? size : 10;

        try {
            // Verify chain exists
            if (!cinemaChainRepository.existsById(chainId)) {
                return ApiResponse.<PagedCinemaResponse>builder()
                        .success(false)
                        .message("Chuỗi rạp không tồn tại")
                        .build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Cinema> cinemaPage;

            if (search != null && !search.isEmpty()) {
                cinemaPage = cinemaRepository.searchByChainIdAndName(chainId, search, pageable);
            } else {
                cinemaPage = cinemaRepository.findByChainId(chainId, pageable);
            }

            List<CinemaDto> cinemaDtos = cinemaPage.getContent()
                    .stream()
                    .map(this::convertToCinemaDto)
                    .collect(Collectors.toList());

            PagedCinemaResponse response = PagedCinemaResponse.builder()
                    .totalElements(cinemaPage.getTotalElements())
                    .totalPages(cinemaPage.getTotalPages())
                    .currentPage(page)
                    .pageSize(size)
                    .data(cinemaDtos)
                    .build();

            return ApiResponse.<PagedCinemaResponse>builder()
                    .success(true)
                    .message("Danh sách rạp được tải thành công")
                    .data(response)
                    .build();
        } catch (Exception e) {
            log.error("Error getting cinemas by chain for admin", e);
            return ApiResponse.<PagedCinemaResponse>builder()
                    .success(false)
                    .message("Lỗi khi tải danh sách rạp: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get cinema by ID
     */
    public ApiResponse<CinemaDto> getCinemaById(Integer chainId, Integer cinemaId) {
        log.info("Getting cinema: {} for chain: {}", cinemaId, chainId);

        try {
            Optional<Cinema> cinema = cinemaRepository.findByIdAndChainId(cinemaId, chainId);

            if (cinema.isPresent() && cinema.get().getIsActive()) {
                return ApiResponse.<CinemaDto>builder()
                        .success(true)
                        .message("Rạp được tải thành công")
                        .data(convertToCinemaDto(cinema.get()))
                        .build();
            } else {
                return ApiResponse.<CinemaDto>builder()
                        .success(false)
                        .message("Rạp không tồn tại hoặc không hoạt động")
                        .build();
            }
        } catch (Exception e) {
            log.error("Error getting cinema by ID", e);
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Lỗi khi tải rạp: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Create cinema (admin only)
     */
    @Transactional
    public ApiResponse<CinemaDto> createCinema(CreateCinemaRequest request, Integer userId) {
        log.info("Creating cinema: {} for chain: {}, requested by: {}", request.getCinemaName(), request.getChainId(), userId);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Chỉ SYSTEM_ADMIN mới có thể tạo rạp")
                    .build();
        }

        // Validate request
        if (request.getCinemaName() == null || request.getCinemaName().trim().isEmpty()) {
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Tên rạp không được để trống")
                    .build();
        }

        if (request.getChainId() == null) {
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Mã chuỗi rạp không được để trống")
                    .build();
        }

        // Verify chain exists
        Optional<CinemaChain> cinemaChain = cinemaChainRepository.findById(request.getChainId());
        if (!cinemaChain.isPresent()) {
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Chuỗi rạp không tồn tại")
                    .build();
        }

        // Check if name already exists in this chain
        if (cinemaRepository.existsByChainIdAndCinemaName(request.getChainId(), request.getCinemaName())) {
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Rạp với tên này đã tồn tại trong chuỗi này")
                    .build();
        }

        try {
            Cinema cinema = new Cinema();
            cinema.setChain(cinemaChain.get());
            cinema.setCinemaName(request.getCinemaName());
            cinema.setAddress(request.getAddress());
            cinema.setCity(request.getCity());
            cinema.setDistrict(request.getDistrict());
            cinema.setPhoneNumber(request.getPhoneNumber());
            cinema.setEmail(request.getEmail());
            cinema.setTaxCode(request.getTaxCode());
            cinema.setLegalName(request.getLegalName());
            
            if (request.getLatitude() != null) {
                cinema.setLatitude(BigDecimal.valueOf(request.getLatitude()));
            }
            if (request.getLongitude() != null) {
                cinema.setLongitude(BigDecimal.valueOf(request.getLongitude()));
            }
            
            cinema.setOpeningHours(request.getOpeningHours());
            cinema.setFacilities(request.getFacilities());
            cinema.setIsActive(true);
            cinema.setCreatedAt(Instant.now());
            cinema.setUpdatedAt(Instant.now());

            Cinema savedCinema = cinemaRepository.save(cinema);

            log.info("Cinema created successfully with ID: {}", savedCinema.getId());
            return ApiResponse.<CinemaDto>builder()
                    .success(true)
                    .message("Tạo rạp thành công")
                    .data(convertToCinemaDto(savedCinema))
                    .build();
        } catch (Exception e) {
            log.error("Error creating cinema", e);
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Lỗi khi tạo rạp: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update cinema (admin only)
     */
    @Transactional
    public ApiResponse<CinemaDto> updateCinema(UpdateCinemaRequest request, Integer userId) {
        log.info("Updating cinema ID: {} for chain: {}, requested by: {}", request.getCinemaId(), request.getChainId(), userId);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Chỉ SYSTEM_ADMIN mới có thể cập nhật rạp")
                    .build();
        }

        // Validate request
        if (request.getCinemaId() == null || request.getChainId() == null) {
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Mã rạp và mã chuỗi rạp không được để trống")
                    .build();
        }

        try {
            Optional<Cinema> existingCinema = cinemaRepository.findByIdAndChainId(request.getCinemaId(), request.getChainId());

            if (!existingCinema.isPresent()) {
                return ApiResponse.<CinemaDto>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            Cinema cinema = existingCinema.get();

            // Check if new name already exists (excluding current cinema)
            if (request.getCinemaName() != null && !request.getCinemaName().isEmpty() &&
                    !request.getCinemaName().equals(cinema.getCinemaName())) {
                if (cinemaRepository.existsByChainIdAndCinemaNameExcludingId(request.getChainId(), request.getCinemaName(), request.getCinemaId())) {
                    return ApiResponse.<CinemaDto>builder()
                            .success(false)
                            .message("Rạp với tên này đã tồn tại trong chuỗi này")
                            .build();
                }
                cinema.setCinemaName(request.getCinemaName());
            }

            if (request.getAddress() != null) {
                cinema.setAddress(request.getAddress());
            }
            if (request.getCity() != null) {
                cinema.setCity(request.getCity());
            }
            if (request.getDistrict() != null) {
                cinema.setDistrict(request.getDistrict());
            }
            if (request.getPhoneNumber() != null) {
                cinema.setPhoneNumber(request.getPhoneNumber());
            }
            if (request.getEmail() != null) {
                cinema.setEmail(request.getEmail());
            }
            if (request.getTaxCode() != null) {
                cinema.setTaxCode(request.getTaxCode());
            }
            if (request.getLegalName() != null) {
                cinema.setLegalName(request.getLegalName());
            }
            if (request.getLatitude() != null) {
                cinema.setLatitude(BigDecimal.valueOf(request.getLatitude()));
            }
            if (request.getLongitude() != null) {
                cinema.setLongitude(BigDecimal.valueOf(request.getLongitude()));
            }
            if (request.getOpeningHours() != null) {
                cinema.setOpeningHours(request.getOpeningHours());
            }
            if (request.getFacilities() != null) {
                cinema.setFacilities(request.getFacilities());
            }
            if (request.getIsActive() != null) {
                cinema.setIsActive(request.getIsActive());
            }

            cinema.setUpdatedAt(Instant.now());

            Cinema updatedCinema = cinemaRepository.save(cinema);

            log.info("Cinema updated successfully with ID: {}", updatedCinema.getId());
            return ApiResponse.<CinemaDto>builder()
                    .success(true)
                    .message("Cập nhật rạp thành công")
                    .data(convertToCinemaDto(updatedCinema))
                    .build();
        } catch (Exception e) {
            log.error("Error updating cinema", e);
            return ApiResponse.<CinemaDto>builder()
                    .success(false)
                    .message("Lỗi khi cập nhật rạp: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete cinema (admin only) - soft delete
     */
    @Transactional
    public ApiResponse<Void> deleteCinema(Integer chainId, Integer cinemaId, Integer userId) {
        log.info("Deleting cinema ID: {} for chain: {}, requested by: {}", cinemaId, chainId, userId);

        if (!isSystemAdmin(userId)) {
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Chỉ SYSTEM_ADMIN mới có thể xóa rạp")
                    .build();
        }

        try {
            Optional<Cinema> existingCinema = cinemaRepository.findByIdAndChainId(cinemaId, chainId);

            if (!existingCinema.isPresent()) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Rạp không tồn tại")
                        .build();
            }

            Cinema cinema = existingCinema.get();
            cinema.setIsActive(false);
            cinema.setUpdatedAt(Instant.now());

            cinemaRepository.save(cinema);

            log.info("Cinema deleted successfully with ID: {}", cinemaId);
            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Xóa rạp thành công")
                    .build();
        } catch (Exception e) {
            log.error("Error deleting cinema", e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Lỗi khi xóa rạp: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert Cinema entity to DTO
     */
    private CinemaDto convertToCinemaDto(Cinema cinema) {
        return CinemaDto.builder()
                .cinemaId(cinema.getId())
                .chainId(cinema.getChain().getId())
                .chainName(cinema.getChain().getChainName())
                .cinemaName(cinema.getCinemaName())
                .address(cinema.getAddress())
                .city(cinema.getCity())
                .district(cinema.getDistrict())
                .phoneNumber(cinema.getPhoneNumber())
                .email(cinema.getEmail())
                .taxCode(cinema.getTaxCode())
                .legalName(cinema.getLegalName())
                .latitude(cinema.getLatitude() != null ? cinema.getLatitude().doubleValue() : null)
                .longitude(cinema.getLongitude() != null ? cinema.getLongitude().doubleValue() : null)
                .openingHours(cinema.getOpeningHours())
                .facilities(cinema.getFacilities())
                .isActive(cinema.getIsActive())
                .createdAt(cinema.getCreatedAt())
                .updatedAt(cinema.getUpdatedAt())
                .build();
    }
}
