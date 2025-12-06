package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.CheckInRequest;
import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.entity.Ticket;
import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketCheckInService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApiResponse<String> checkIn(CheckInRequest request) {
        try {
            // Find booking
            Booking booking = bookingRepository.findByBookingCode(request.getBookingCode())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Validate booking status - only allow PAID bookings
            // COMPLETED means already checked in
            if (booking.getStatus() == StatusBooking.COMPLETED) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Vé đã được check-in trước đó. Booking đã hoàn tất!")
                        .build();
            }
            
            if (booking.getStatus() != StatusBooking.PAID && booking.getStatus() != StatusBooking.CONFIRMED) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Booking chưa thanh toán. Status: " + booking.getStatus())
                        .build();
            }

            // Get staff user
            User staff = userRepository.findById(request.getStaffId())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));

            // Update tickets
            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            
            // Check if any ticket is already used
            boolean hasUsedTicket = tickets.stream()
                    .anyMatch(ticket -> ticket.getStatus() == TicketStatus.USED);
            
            if (hasUsedTicket) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Vé đã được check-in trước đó. Không thể check-in lại!")
                        .build();
            }
            
            // Check-in all tickets
            for (Ticket ticket : tickets) {
                ticket.setStatus(TicketStatus.USED);
                ticket.setCheckedInAt(Instant.now());
                ticket.setCheckedInBy(staff);
            }
            ticketRepository.saveAll(tickets);

            // Update booking status to COMPLETED after successful check-in
            booking.setStatus(StatusBooking.COMPLETED);
            booking.setUpdatedAt(Instant.now());
            bookingRepository.save(booking);

            log.info("Check-in successful for booking: {}", booking.getBookingCode());

            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Check-in successful for " + tickets.size() + " ticket(s)")
                    .data(booking.getBookingCode())
                    .build();

        } catch (Exception e) {
            log.error("Error during check-in", e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Check-in failed: " + e.getMessage())
                    .build();
        }
    }
}