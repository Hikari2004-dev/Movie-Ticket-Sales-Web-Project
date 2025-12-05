package aws.movie_ticket_sales_web_project.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    
    private Integer userId; // Optional - for registered users
    
    @NotNull(message = "Showtime ID is required")
    private Integer showtimeId;
    
    // Customer information (required if user is not logged in)
    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name must not exceed 100 characters")
    private String customerName;
    
    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;
    
    @NotBlank(message = "Customer phone is required")
    @Pattern(regexp = "^[0-9]{10,20}$", message = "Invalid phone number format")
    private String customerPhone;
    
    // Seat selection
    @NotEmpty(message = "At least one seat must be selected")
    private List<Integer> seatIds;
    
    // Session ID for seat hold verification
    @NotBlank(message = "Session ID is required")
    private String sessionId;
    
    // Optional voucher/discount
    private String voucherCode;
    
    // Payment
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
