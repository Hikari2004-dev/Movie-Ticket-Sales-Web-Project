package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    private final QRCodeService qrCodeService;
    private final InvoiceService invoiceService;
    
    @Value("${spring.mail.username:noreply@movieticket.com}")
    private String fromEmail;
    
    /**
     * Send booking confirmation email (async)
     */
    @Async
    public void sendBookingConfirmation(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(booking.getCustomerEmail());
            helper.setSubject("Xác nhận đặt vé - " + booking.getBookingCode());
            
            // Generate email content
            String emailContent = buildConfirmationEmailHtml(booking);
            helper.setText(emailContent, true);
            
            // Attach QR Code
            byte[] qrCodeBytes = qrCodeService.generateQRCodeBytes(booking.getBookingCode());
            helper.addAttachment("QRCode.png", new ByteArrayDataSource(qrCodeBytes, "image/png"));
            
            // Attach Invoice (if available)
            byte[] invoicePdf = invoiceService.generateInvoicePdf(booking);
            if (invoicePdf.length > 0) {
                helper.addAttachment("Invoice.pdf", new ByteArrayDataSource(invoicePdf, "application/pdf"));
            }
            
            mailSender.send(message);
            log.info("Confirmation email sent to: {}", booking.getCustomerEmail());
            
        } catch (Exception e) {
            log.error("Error sending confirmation email for booking: {}", booking.getBookingCode(), e);
        }
    }
    
    /**
     * Build HTML email content
     */
    private String buildConfirmationEmailHtml(Booking booking) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .booking-info { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #d32f2f; }
                    .total { font-size: 24px; color: #d32f2f; font-weight: bold; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    .qr-section { text-align: center; padding: 20px; background: white; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎬 XÁC NHẬN ĐẶT VÉ THÀNH CÔNG</h1>
                    </div>
                    <div class="content">
                        <h2>Xin chào %s,</h2>
                        <p>Cảm ơn bạn đã đặt vé xem phim. Đặt vé của bạn đã được xác nhận!</p>
                        
                        <div class="booking-info">
                            <h3>Thông tin đặt vé</h3>
                            <p><strong>Mã đặt vé:</strong> %s</p>
                            <p><strong>Phim:</strong> %s</p>
                            <p><strong>Rạp:</strong> %s - %s</p>
                            <p><strong>Ngày chiếu:</strong> %s</p>
                            <p><strong>Giờ chiếu:</strong> %s</p>
                            <p><strong>Số ghế:</strong> %d</p>
                            <p class="total">Tổng tiền: %,d VNĐ</p>
                        </div>
                        
                        <div class="qr-section">
                            <h3>📱 QR Code Check-in</h3>
                            <p>Vui lòng xuất trình mã QR này tại quầy để nhận vé:</p>
                            <p><em>(QR Code đính kèm trong email)</em></p>
                        </div>
                        
                        <div class="booking-info">
                            <h3>⚠️ Lưu ý quan trọng</h3>
                            <ul>
                                <li>Vui lòng đến trước giờ chiếu 15 phút để check-in</li>
                                <li>Mang theo mã QR Code hoặc mã đặt vé: <strong>%s</strong></li>
                                <li>Không được hoàn tiền sau khi đã check-in</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Nếu có thắc mắc, vui lòng liên hệ: support@movieticket.com</p>
                        <p>&copy; 2024 Movie Ticket System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            booking.getCustomerName(),
            booking.getBookingCode(),
            booking.getShowtime().getMovie().getTitle(),
            booking.getShowtime().getHall().getCinema().getCinemaName(),
            booking.getShowtime().getHall().getHallName(),
            booking.getShowtime().getShowDate().toString(),
            booking.getShowtime().getStartTime().toString(),
            booking.getTotalSeats(),
            booking.getTotalAmount().longValue(),
            booking.getBookingCode()
        );
    }
    
    /**
     * Send refund confirmation email
     */
    @Async
    public void sendRefundConfirmation(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(booking.getCustomerEmail());
            helper.setSubject("Xác nhận hoàn tiền - " + booking.getBookingCode());
            
            String emailContent = String.format("""
                <h2>Xác nhận hoàn tiền</h2>
                <p>Xin chào %s,</p>
                <p>Đặt vé <strong>%s</strong> của bạn đã được hoàn tiền.</p>
                <p>Số tiền hoàn: <strong>%,d VNĐ</strong></p>
                <p>Số tiền sẽ được chuyển về tài khoản của bạn trong vòng 5-7 ngày làm việc.</p>
                <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
                """,
                booking.getCustomerName(),
                booking.getBookingCode(),
                booking.getTotalAmount().longValue()
            );
            
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            log.info("Refund confirmation email sent to: {}", booking.getCustomerEmail());
            
        } catch (Exception e) {
            log.error("Error sending refund email for booking: {}", booking.getBookingCode(), e);
        }
    }
}
