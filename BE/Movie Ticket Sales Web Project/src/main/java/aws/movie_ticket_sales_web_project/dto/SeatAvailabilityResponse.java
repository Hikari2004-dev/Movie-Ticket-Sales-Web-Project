package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatAvailabilityResponse {
    private Integer showtimeId;
    private List<Integer> availableSeatIds;
    private List<SeatHoldInfo> heldSeats;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatHoldInfo {
        private Integer seatId;
        private String heldBy; // "you" or "another_user"
        private Long expiresAt; // Epoch milliseconds
    }
}
