package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.CheckInRequest;
import aws.movie_ticket_sales_web_project.service.TicketCheckInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {
    
    private final TicketCheckInService ticketCheckInService;
    
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
}
