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
import java.time.LocalTime;
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

            // Validate booking status
            if (booking.getStatus() != StatusBooking.PAID) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Booking is not paid. Status: " + booking.getStatus())
                        .build();
            }

            // Check showtime timing (allow check-in 30 minutes before)
            LocalTime startTime = booking.getShowtime().getStartTime();
            LocalTime now = LocalTime.now();
            if (now.isBefore(startTime.minusMinutes(30))) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Too early for check-in. Please arrive 30 minutes before showtime.")
                        .build();
            }

            if (now.isAfter(startTime.plusMinutes(30))) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Check-in time has passed. Showtime started " + startTime)
                        .build();
            }

            // Get staff user
            User staff = userRepository.findById(request.getStaffId())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));

            // Update tickets
            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            for (Ticket ticket : tickets) {
                if (ticket.getStatus() == TicketStatus.USED) {
                    return ApiResponse.<String>builder()
                            .success(false)
                            .message("Ticket already checked in")
                            .build();
                }

                ticket.setStatus(TicketStatus.USED);
                ticket.setCheckedInAt(Instant.now());
                ticket.setCheckedInBy(staff);
            }
            ticketRepository.saveAll(tickets);

            // Update booking
            booking.setStatus(StatusBooking.PAID);
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