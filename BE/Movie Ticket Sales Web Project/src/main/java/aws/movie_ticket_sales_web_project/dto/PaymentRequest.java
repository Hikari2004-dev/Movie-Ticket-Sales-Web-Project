package aws.movie_ticket_sales_web_project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    
    @NotNull(message = "Booking ID is required")
    private Integer bookingId;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, E_WALLET, CASH
    
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    
    // For card payments
    private String cardNumber;
    private String cardHolderName;
    private String expiryDate;
    private String cvv;
    
    // For bank transfer
    private String bankCode;
    private String accountNumber;
    
    // For e-wallet
    private String walletProvider; // MOMO, ZALOPAY, VNPAY, etc.
    private String walletPhone;
    
    // Return URL for payment gateway callback
    private String returnUrl;
    private String cancelUrl;
}
