package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConcessionOrderService {

    private final ConcessionOrderRepository orderRepository;
    private final ConcessionOrderItemRepository orderItemRepository;
    private final CinemaConcessionItemRepository cinemaConcessionItemRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRepository userRepository;

    /**
     * Tạo đơn hàng bắp nước mới
     */
    @Transactional
    public ConcessionOrderDTO createOrder(CreateConcessionOrderRequest request) {
        log.info("Creating concession order for user {} at cinema {}", 
                request.getUserId(), request.getCinemaId());
        
        // Validate
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Rạp không tồn tại"));
        
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Đơn hàng phải có ít nhất 1 sản phẩm");
        }
        
        // Tạo order
        ConcessionOrder order = new ConcessionOrder();
        order.setUser(user);
        order.setCinema(cinema);
        order.setOrderNumber("CO" + System.currentTimeMillis());
        order.setStatus(ConcessionOrderStatus.PENDING);
        order.setNotes(request.getNotes());
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        
        // Tính tổng tiền
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (CreateConcessionOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            // Lấy giá từ cinema_concession_items
            CinemaConcessionItem cinemaItem = cinemaConcessionItemRepository
                    .findByCinemaIdAndItemId(request.getCinemaId(), itemReq.getItemId())
                    .orElseThrow(() -> new RuntimeException(
                            "Item không có bán tại rạp này: " + itemReq.getItemId()));
            
            if (!cinemaItem.getIsAvailable()) {
                throw new RuntimeException("Item không còn bán: " + cinemaItem.getItem().getItemName());
            }
            
            BigDecimal unitPrice = cinemaItem.getEffectivePrice();
            BigDecimal itemSubtotal = unitPrice.multiply(new BigDecimal(itemReq.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);
        }
        
        order.setSubtotal(subtotal);
        order.setTaxAmount(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(subtotal);
        
        // Lưu order
        ConcessionOrder savedOrder = orderRepository.save(order);
        
        // Tạo order items
        for (CreateConcessionOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            CinemaConcessionItem cinemaItem = cinemaConcessionItemRepository
                    .findByCinemaIdAndItemId(request.getCinemaId(), itemReq.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item không tồn tại"));
            
            ConcessionOrderItem orderItem = new ConcessionOrderItem();
            orderItem.setConcessionOrder(savedOrder);
            orderItem.setItem(cinemaItem.getItem());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(cinemaItem.getEffectivePrice());
            orderItem.setTotalPrice(cinemaItem.getEffectivePrice()
                    .multiply(new BigDecimal(itemReq.getQuantity())));
            orderItem.setCustomizationNotes(itemReq.getNotes());
            orderItem.setCreatedAt(Instant.now());
            
            orderItemRepository.save(orderItem);
        }
        
        log.info("Created order {} with total amount {}", 
                savedOrder.getOrderNumber(), savedOrder.getTotalAmount());
        
        return convertToDTO(savedOrder);
    }

    /**
     * Lấy đơn hàng theo ID
     */
    @Transactional(readOnly = true)
    public ConcessionOrderDTO getOrderById(Integer orderId) {
        ConcessionOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        return convertToDTO(order);
    }

    /**
     * Lấy đơn hàng theo order number
     */
    @Transactional(readOnly = true)
    public ConcessionOrderDTO getOrderByNumber(String orderNumber) {
        ConcessionOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        return convertToDTO(order);
    }

    /**
     * Lấy danh sách orders của user
     */
    @Transactional(readOnly = true)
    public List<ConcessionOrderDTO> getUserOrders(Integer userId) {
        List<ConcessionOrder> orders = orderRepository.findByUserId(userId);
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy concession order theo booking ID
     */
    @Transactional(readOnly = true)
    public ConcessionOrderDTO getOrderByBookingId(Integer bookingId) {
        return orderRepository.findByBookingId(bookingId)
                .map(this::convertToDTO)
                .orElse(null); // Return null if no concession order for this booking
    }

    /**
     * Lấy danh sách orders của rạp
     */
    @Transactional(readOnly = true)
    public List<ConcessionOrderDTO> getCinemaOrders(Integer cinemaId, ConcessionOrderStatus status) {
        List<ConcessionOrder> orders;
        if (status != null) {
            orders = orderRepository.findByCinemaIdAndStatus(cinemaId, status);
        } else {
            orders = orderRepository.findByCinemaId(cinemaId);
        }
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    @Transactional
    public ConcessionOrderDTO updateOrderStatus(Integer orderId, ConcessionOrderStatus newStatus) {
        ConcessionOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        order.setStatus(newStatus);
        order.setUpdatedAt(Instant.now());
        
        if (newStatus == ConcessionOrderStatus.READY) {
            order.setPickupTime(Instant.now());
        }
        
        ConcessionOrder updated = orderRepository.save(order);
        log.info("Updated order {} status to {}", order.getOrderNumber(), newStatus);
        
        return convertToDTO(updated);
    }

    /**
     * Hủy đơn hàng
     */
    @Transactional
    public ConcessionOrderDTO cancelOrder(Integer orderId, String reason) {
        ConcessionOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        if (order.getStatus() == ConcessionOrderStatus.COMPLETED) {
            throw new RuntimeException("Không thể hủy đơn hàng đã hoàn thành");
        }
        
        order.setStatus(ConcessionOrderStatus.CANCELLED);
        order.setNotes((order.getNotes() != null ? order.getNotes() + "\n" : "") 
                + "Lý do hủy: " + reason);
        order.setUpdatedAt(Instant.now());
        
        ConcessionOrder updated = orderRepository.save(order);
        log.info("Cancelled order {}: {}", order.getOrderNumber(), reason);
        
        return convertToDTO(updated);
    }

    /**
     * Convert entity to DTO
     */
    private ConcessionOrderDTO convertToDTO(ConcessionOrder order) {
        List<ConcessionOrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        
        List<ConcessionOrderItemDTO> itemDTOs = orderItems.stream()
                .map(item -> ConcessionOrderItemDTO.builder()
                        .orderItemId(item.getId())
                        .itemId(item.getItem().getId())
                        .itemName(item.getItem().getItemName())
                        .imageUrl(item.getItem().getImageUrl())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getTotalPrice())
                        .notes(item.getCustomizationNotes())
                        .build())
                .collect(Collectors.toList());
        
        return ConcessionOrderDTO.builder()
                .orderId(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userName(order.getUser() != null ? order.getUser().getFullName() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .cinemaId(order.getCinema().getId())
                .cinemaName(order.getCinema().getCinemaName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .pickupTime(order.getPickupTime())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemDTOs)
                .build();
    }
}
