package aws.movie_ticket_sales_web_project.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class QRCodeService {
    
    @Value("${qr.code.directory:uploads/qr-codes}")
    private String qrCodeDirectory;
    
    @Value("${qr.code.base-url:http://localhost:8080/uploads/qr-codes}")
    private String qrCodeBaseUrl;
    
    /**
     * Generate QR Code for booking
     */
    public String generateQRCode(String bookingCode) {
        try {
            // Create directory if not exists
            Path directory = FileSystems.getDefault().getPath(qrCodeDirectory);
            if (!directory.toFile().exists()) {
                directory.toFile().mkdirs();
                log.info("Created QR code directory: {}", qrCodeDirectory);
            }
            
            String fileName = "QR_" + bookingCode + ".png";
            String filePath = qrCodeDirectory + "/" + fileName;
            
            // Create QR code
            generateQRCodeImage(bookingCode, 300, 300, filePath);
            
            String qrCodeUrl = qrCodeBaseUrl + "/" + fileName;
            log.info("QR Code generated successfully: {}", qrCodeUrl);
            
            return qrCodeUrl;
            
        } catch (Exception e) {
            log.error("Error generating QR code for booking: {}", bookingCode, e);
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }
    
    /**
     * Generate QR Code image file
     */
    private void generateQRCodeImage(String text, int width, int height, String filePath)
            throws WriterException, IOException {
        
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);
        
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);
        
        Path path = FileSystems.getDefault().getPath(filePath);
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", path);
    }
    
    /**
     * Generate QR Code as byte array (for email attachment)
     */
    public byte[] generateQRCodeBytes(String text) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 300, 300, hints);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return outputStream.toByteArray();
    }
}
