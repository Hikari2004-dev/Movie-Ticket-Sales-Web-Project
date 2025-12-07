package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final SeatHoldService seatHoldService;
    
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10% tax
    private static final BigDecimal SERVICE_FEE = new BigDecimal("5000"); // 5000 VND service fee per ticket
    
    /**
     * Get all bookings with pagination (excluding CANCELLED)
     */
    public PagedBookingResponse getAllBookings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookingPage = bookingRepository.findByStatusNot(StatusBooking.CANCELLED, pageable);
        
        return buildPagedResponse(bookingPage);
    }
    
    /**
     * Get booking by ID
     */
    public BookingDto getBookingById(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        return convertToDto(booking, true);
    }
    
    /**
     * Get booking by booking code
     */
    public BookingDto getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Booking not found with code: " + bookingCode));
        
        return convertToDto(booking, true);
    }
    
    /**
     * Get bookings by user ID
     */
    public PagedBookingResponse getBookingsByUserId(Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookingPage = bookingRepository.findByUserId(userId, pageable);
        
        return buildPagedResponse(bookingPage);
    }
    
    /**
     * Get bookings by status
     */
    public PagedBookingResponse getBookingsByStatus(StatusBooking status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookingPage = bookingRepository.findByStatus(status, pageable);
        
        return buildPagedResponse(bookingPage);
    }
    
    /**
     * Get bookings by showtime ID
     */
    public PagedBookingResponse getBookingsByShowtimeId(Integer showtimeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookingPage = bookingRepository.findByShowtimeId(showtimeId, pageable);
        
        return buildPagedResponse(bookingPage);
    }
    
    /**
     * Create a new booking
     */
    @Transactional
    public BookingDto createBooking(CreateBookingRequest request) {
        try {
            // Validate showtime exists
            Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));
            
            // Verify seats are held by this session (Redis check)
            boolean seatsHeld = seatHoldService.areSeatsHeldBySession(request.getShowtimeId(), request.getSeatIds(), request.getSessionId());
            
            if (!seatsHeld) {
                log.warn("Booking failed - seats not held: showtimeId={}, seatIds={}, sessionId={}", 
                        request.getShowtimeId(), request.getSeatIds(), request.getSessionId());
                throw new RuntimeException("Seats are not held by your session. Please select seats again.");
            }
            
            // Extend hold by 2 more minutes to ensure booking completes
            try {
                seatHoldService.extendHold(request.getSessionId(), request.getShowtimeId(), request.getSeatIds(), 2);
                log.info("Extended seat hold during booking creation");
            } catch (Exception e) {
                log.warn("Failed to extend hold, but continuing with booking", e);
            }
            
            // Validate seats
            List<Seat> seats = new ArrayList<>();
            for (Integer seatId : request.getSeatIds()) {
                Seat seat = seatRepository.findById(seatId)
                        .orElseThrow(() -> new RuntimeException("Seat not found with ID: " + seatId));
                
                // Double-check if seat is already booked in database (active tickets only)
                if (ticketRepository.findActiveBySeatIdAndShowtimeId(seatId, request.getShowtimeId()).isPresent()) {
                    throw new RuntimeException("Seat " + seat.getSeatRow() + seat.getSeatNumber() + " is already booked");
                }
                
                seats.add(seat);
            }
            
            // Get user if provided and auto-fill customer info
            User user = null;
            String customerName = request.getCustomerName();
            String customerEmail = request.getCustomerEmail();
            String customerPhone = request.getCustomerPhone();
            
            if (request.getUserId() != null) {
                user = userRepository.findById(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));
                
                // Auto-fill customer info from user if not provided
                if (customerName == null || customerName.isBlank()) {
                    customerName = user.getFullName();
                }
                if (customerEmail == null || customerEmail.isBlank()) {
                    customerEmail = user.getEmail();
                }
                if (customerPhone == null || customerPhone.isBlank()) {
                    customerPhone = user.getPhoneNumber();
                }
            } else {
                // Guest booking - validate customer info is provided
                if (customerName == null || customerName.isBlank()) {
                    throw new RuntimeException("Customer name is required for guest bookings");
                }
                if (customerEmail == null || customerEmail.isBlank()) {
                    throw new RuntimeException("Customer email is required for guest bookings");
                }
                if (customerPhone == null || customerPhone.isBlank()) {
                    throw new RuntimeException("Customer phone is required for guest bookings");
                }
            }
            
            // Calculate amounts
            BigDecimal subtotal = showtime.getBasePrice().multiply(new BigDecimal(seats.size()));
            BigDecimal serviceFeeTotal = SERVICE_FEE.multiply(new BigDecimal(seats.size()));
            BigDecimal taxAmount = subtotal.multiply(TAX_RATE);
            BigDecimal totalAmount = subtotal.add(serviceFeeTotal).add(taxAmount);
            
            // Create booking
            Booking booking = new Booking();
            booking.setBookingCode(generateBookingCode());
            booking.setUser(user);
            booking.setShowtime(showtime);
            booking.setCustomerName(customerName);
            booking.setCustomerEmail(customerEmail);
            booking.setCustomerPhone(customerPhone);
            booking.setBookingDate(Instant.now());
            booking.setTotalSeats(seats.size());
            booking.setSubtotal(subtotal);
            booking.setDiscountAmount(BigDecimal.ZERO);
            booking.setTaxAmount(taxAmount);
            booking.setServiceFee(serviceFeeTotal);
            booking.setTotalAmount(totalAmount);
            booking.setStatus(StatusBooking.PENDING);
            booking.setPaymentStatus(PaymentStatus.PENDING);
            booking.setPaymentMethod(request.getPaymentMethod());
            booking.setHoldExpiresAt(Instant.now().plusSeconds(900)); // 15 minutes hold
            booking.setCreatedAt(Instant.now());
            booking.setUpdatedAt(Instant.now());
            
            Booking savedBooking = bookingRepository.save(booking);
            
            // Create tickets for each seat
            List<Ticket> tickets = new ArrayList<>();
            for (Seat seat : seats) {
                Ticket ticket = new Ticket();
                ticket.setBooking(savedBooking);
                ticket.setSeat(seat);
                ticket.setTicketCode(generateTicketCode());
                ticket.setBasePrice(showtime.getBasePrice());
                ticket.setSurchargeAmount(BigDecimal.ZERO);
                ticket.setDiscountAmount(BigDecimal.ZERO);
                ticket.setFinalPrice(showtime.getBasePrice().add(SERVICE_FEE).add(showtime.getBasePrice().multiply(TAX_RATE)));
                ticket.setStatus(TicketStatus.BOOKED);
                
                tickets.add(ticket);
            }
            
            ticketRepository.saveAll(tickets);
            
            // Update available seats in showtime
            int newAvailableSeats = showtime.getAvailableSeats() - seats.size();
            showtime.setAvailableSeats(newAvailableSeats);
            showtimeRepository.save(showtime);
            
            // Remove seat hold from Redis (booking confirmed)
            seatHoldService.confirmBooking(request.getShowtimeId(), request.getSeatIds());
            
            log.info("Booking created successfully: {}", savedBooking.getBookingCode());
            return convertToDto(savedBooking, true);
            
        } catch (Exception e) {
            log.error("Error creating booking", e);
            throw new RuntimeException("Failed to create booking: " + e.getMessage());
        }
    }
    
    /**
     * Update booking
     */
    @Transactional
    public BookingDto updateBooking(Integer bookingId, UpdateBookingRequest request) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Update fields if provided
            if (request.getStatus() != null) {
                booking.setStatus(request.getStatus());
                
                // If status is CANCELLED, update seat availability
                if (request.getStatus() == StatusBooking.CANCELLED) {
                    List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
                    Showtime showtime = booking.getShowtime();
                    showtime.setAvailableSeats(showtime.getAvailableSeats() + tickets.size());
                    showtimeRepository.save(showtime);
                    
                    // Update ticket status
                    tickets.forEach(ticket -> ticket.setStatus(TicketStatus.CANCELLED));
                    ticketRepository.saveAll(tickets);
                }
                
                // If status is PAID, update payment info
                if (request.getStatus() == StatusBooking.PAID) {
                    booking.setPaidAt(Instant.now());
                    booking.setPaymentStatus(PaymentStatus.COMPLETED);
                }
            }
            
            if (request.getPaymentStatus() != null) {
                booking.setPaymentStatus(request.getPaymentStatus());
            }
            
            if (request.getPaymentReference() != null) {
                booking.setPaymentReference(request.getPaymentReference());
            }
            
            if (request.getCustomerName() != null) {
                booking.setCustomerName(request.getCustomerName());
            }
            
            if (request.getCustomerEmail() != null) {
                booking.setCustomerEmail(request.getCustomerEmail());
            }
            
            if (request.getCustomerPhone() != null) {
                booking.setCustomerPhone(request.getCustomerPhone());
            }
            
            booking.setUpdatedAt(Instant.now());
            
            Booking updatedBooking = bookingRepository.save(booking);
            log.info("Booking updated successfully: {}", bookingId);
            
            return convertToDto(updatedBooking, true);
            
        } catch (Exception e) {
            log.error("Error updating booking", e);
            throw new RuntimeException("Failed to update booking: " + e.getMessage());
        }
    }
    
    /**
     * Cancel booking
     */
    @Transactional
    public void cancelBooking(Integer bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            if (booking.getStatus() == StatusBooking.CANCELLED) {
                throw new RuntimeException("Booking is already cancelled");
            }
            
            if (booking.getStatus() == StatusBooking.PAID) {
                throw new RuntimeException("Cannot cancel a paid booking. Please request a refund.");
            }
            
            // Update booking status
            booking.setStatus(StatusBooking.CANCELLED);
            booking.setUpdatedAt(Instant.now());
            bookingRepository.save(booking);
            
            // Release seats
            List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
            Showtime showtime = booking.getShowtime();
            showtime.setAvailableSeats(showtime.getAvailableSeats() + tickets.size());
            showtimeRepository.save(showtime);
            
            // Update ticket status
            tickets.forEach(ticket -> ticket.setStatus(TicketStatus.CANCELLED));
            ticketRepository.saveAll(tickets);
            
            log.info("Booking cancelled successfully: {}", bookingId);
            
        } catch (Exception e) {
            log.error("Error cancelling booking", e);
            throw new RuntimeException("Failed to cancel booking: " + e.getMessage());
        }
    }
    
    /**
     * Delete booking (admin only)
     */
    @Transactional
    public void deleteBooking(Integer bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Delete associated tickets first
            List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
            ticketRepository.deleteAll(tickets);
            
            // Restore seat availability
            Showtime showtime = booking.getShowtime();
            showtime.setAvailableSeats(showtime.getAvailableSeats() + tickets.size());
            showtimeRepository.save(showtime);
            
            // Delete booking
            bookingRepository.delete(booking);
            
            log.info("Booking deleted successfully: {}", bookingId);
            
        } catch (Exception e) {
            log.error("Error deleting booking", e);
            throw new RuntimeException("Failed to delete booking: " + e.getMessage());
        }
    }
    
    /**
     * Convert Booking entity to DTO
     */
    private BookingDto convertToDto(Booking booking, boolean includeTickets) {
        BookingDto dto = BookingDto.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .username(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                .customerPhone(booking.getCustomerPhone())
                .showtimeId(booking.getShowtime().getId())
                .movieTitle(booking.getShowtime().getMovie().getTitle())
                .cinemaName(booking.getShowtime().getHall().getCinema().getCinemaName())
                .hallName(booking.getShowtime().getHall().getHallName())
                .showDate(booking.getShowtime().getShowDate().toString())
                .startTime(booking.getShowtime().getStartTime().toString())
                .formatType(booking.getShowtime().getFormatType().getValue())
                .bookingDate(booking.getBookingDate())
                .totalSeats(booking.getTotalSeats())
                .subtotal(booking.getSubtotal())
                .discountAmount(booking.getDiscountAmount())
                .taxAmount(booking.getTaxAmount())
                .serviceFee(booking.getServiceFee())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .paymentMethod(booking.getPaymentMethod())
                .paymentReference(booking.getPaymentReference())
                .paidAt(booking.getPaidAt())
                .holdExpiresAt(booking.getHoldExpiresAt())
                .qrCode(booking.getQrCode())
                .invoiceNumber(booking.getInvoiceNumber())
                .invoiceIssuedAt(booking.getInvoiceIssuedAt())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
        
        if (includeTickets) {
            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            dto.setTickets(tickets.stream().map(this::convertTicketToDto).collect(Collectors.toList()));
        }
        
        return dto;
    }
    
    /**
     * Convert Ticket entity to DTO
     */
    private TicketDto convertTicketToDto(Ticket ticket) {
        return TicketDto.builder()
                .ticketId(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .seatId(ticket.getSeat().getId())
                .seatNumber(String.valueOf(ticket.getSeat().getSeatNumber()))
                .seatRow(ticket.getSeat().getSeatRow())
                .seatType(ticket.getSeat().getSeatType().name())
                .basePrice(ticket.getBasePrice())
                .surchargeAmount(ticket.getSurchargeAmount())
                .discountAmount(ticket.getDiscountAmount())
                .finalPrice(ticket.getFinalPrice())
                .status(ticket.getStatus())
                .checkedInAt(ticket.getCheckedInAt())
                .checkedInByUsername(ticket.getCheckedInBy() != null ? ticket.getCheckedInBy().getEmail() : null)
                .build();
    }
    
    /**
     * Build paged response
     */
    private PagedBookingResponse buildPagedResponse(Page<Booking> bookingPage) {
        List<BookingDto> bookingDtos = bookingPage.getContent().stream()
                .map(booking -> convertToDto(booking, false))
                .collect(Collectors.toList());
        
        return PagedBookingResponse.builder()
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .currentPage(bookingPage.getNumber())
                .pageSize(bookingPage.getSize())
                .hasNext(bookingPage.hasNext())
                .hasPrevious(bookingPage.hasPrevious())
                .data(bookingDtos)
                .build();
    }
    
    /**
     * Generate unique booking code
     */
    private String generateBookingCode() {
        String code;
        do {
            code = "BK" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + 
                    String.format("%04d", (int)(Math.random() * 10000));
        } while (bookingRepository.existsByBookingCode(code));
        
        return code;
    }
    
    /**
     * Generate unique ticket code
     */
    private String generateTicketCode() {
        String code;
        do {
            code = "TK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (ticketRepository.existsByTicketCode(code));
        
        return code;
    }
}
