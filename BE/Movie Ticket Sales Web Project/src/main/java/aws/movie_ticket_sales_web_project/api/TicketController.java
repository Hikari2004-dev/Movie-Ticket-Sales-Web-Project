package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.CheckInRequest;
import aws.movie_ticket_sales_web_project.service.TicketCheckInService;
import aws.movie_ticket_sales_web_project.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {
    
    private final TicketCheckInService ticketCheckInService;
    private final TicketService ticketService;
    
    /**
     * Check-in ticket at cinema
     * POST /api/tickets/check-in
     */
    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<String>> checkIn(@Valid @RequestBody CheckInRequest request) {
        log.info("Check-in request for booking: {}", request.getBookingCode());
        ApiResponse<String> response = ticketCheckInService.checkIn(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get booking details for staff check-in
     * GET /api/tickets/staff/booking-details
     */
    @GetMapping("/staff/booking-details")
    public ResponseEntity<Map<String, Object>> getBookingDetailsForStaff(@RequestParam String bookingCode) {
        log.info("Staff requesting booking details for: {}", bookingCode);
        Map<String, Object> details = ticketService.getBookingDetailsForCheckIn(bookingCode);
        return ResponseEntity.ok(details);
    }
    
    /**
     * Process staff check-in by booking code
     * POST /api/tickets/staff/check-in-booking
     */
    @PostMapping("/staff/check-in-booking")
    public ResponseEntity<Map<String, Object>> staffCheckInBooking(
            @RequestParam String bookingCode,
            @RequestParam Integer staffId) {
        log.info("Staff {} checking in booking: {}", staffId, bookingCode);
        Map<String, Object> response = ticketService.checkInByBookingCode(bookingCode, staffId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Process staff cash payment
     * POST /api/tickets/staff/cash-payment
     */
    @PostMapping("/staff/cash-payment")
    public ResponseEntity<Map<String, Object>> staffCashPayment(
            @RequestParam String bookingCode,
            @RequestParam Integer staffId) {
        log.info("Staff {} processing cash payment for booking: {}", staffId, bookingCode);
        Map<String, Object> response = ticketService.processStaffCashPayment(bookingCode, staffId);
        return ResponseEntity.ok(response);
    }
}

