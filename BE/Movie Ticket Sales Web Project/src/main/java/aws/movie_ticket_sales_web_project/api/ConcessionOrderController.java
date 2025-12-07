package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ConcessionOrderDTO;
import aws.movie_ticket_sales_web_project.dto.CreateConcessionOrderRequest;
import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import aws.movie_ticket_sales_web_project.service.ConcessionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API quản lý đơn hàng bắp nước
 */
@RestController
@RequestMapping("/api/concessions/orders")
@RequiredArgsConstructor
@Slf4j
public class ConcessionOrderController {

    private final ConcessionOrderService orderService;

    /**
     * Tạo đơn hàng mới
     * POST /api/concessions/orders
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> createOrder(
            @RequestBody CreateConcessionOrderRequest request) {
        
        log.info("Creating new concession order");
        ConcessionOrderDTO order = orderService.createOrder(request);
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy chi tiết đơn hàng
     * GET /api/concessions/orders/123
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> getOrder(@PathVariable Integer orderId) {
        log.info("Fetching order: {}", orderId);
        ConcessionOrderDTO order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy đơn hàng theo order number
     * GET /api/concessions/orders/number/CO1234567890
     */
    @GetMapping("/number/{orderNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> getOrderByNumber(
            @PathVariable String orderNumber) {
        
        log.info("Fetching order by number: {}", orderNumber);
        ConcessionOrderDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy danh sách đơn hàng của user
     * GET /api/concessions/orders/user/5
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ConcessionOrderDTO>> getUserOrders(
            @PathVariable Integer userId) {
        
        log.info("Fetching orders for user: {}", userId);
        List<ConcessionOrderDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy danh sách đơn hàng của rạp
     * GET /api/concessions/orders/cinema/1?status=PENDING
     */
    @GetMapping("/cinema/{cinemaId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<ConcessionOrderDTO>> getCinemaOrders(
            @PathVariable Integer cinemaId,
            @RequestParam(required = false) ConcessionOrderStatus status) {
        
        log.info("Fetching orders for cinema {} with status {}", cinemaId, status);
        List<ConcessionOrderDTO> orders = orderService.getCinemaOrders(cinemaId, status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Cập nhật trạng thái đơn hàng (Manager only)
     * PUT /api/concessions/orders/123/status
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<ConcessionOrderDTO> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request) {
        
        ConcessionOrderStatus newStatus = ConcessionOrderStatus.valueOf(
                request.get("status"));
        
        log.info("Updating order {} status to {}", orderId, newStatus);
        ConcessionOrderDTO order = orderService.updateOrderStatus(orderId, newStatus);
        return ResponseEntity.ok(order);
    }

    /**
     * Xác nhận đơn hàng (Manager only)
     * PUT /api/concessions/orders/123/confirm
     */
    @PutMapping("/{orderId}/confirm")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<ConcessionOrderDTO> confirmOrder(@PathVariable Integer orderId) {
        log.info("Confirming order: {}", orderId);
        ConcessionOrderDTO order = orderService.updateOrderStatus(
                orderId, ConcessionOrderStatus.CONFIRMED);
        return ResponseEntity.ok(order);
    }

    /**
     * Bắt đầu chuẩn bị đơn hàng (Manager only)
     * PUT /api/concessions/orders/123/prepare
     */
    @PutMapping("/{orderId}/prepare")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<ConcessionOrderDTO> prepareOrder(@PathVariable Integer orderId) {
        log.info("Preparing order: {}", orderId);
        ConcessionOrderDTO order = orderService.updateOrderStatus(
                orderId, ConcessionOrderStatus.PREPARING);
        return ResponseEntity.ok(order);
    }

    /**
     * Đánh dấu đơn hàng sẵn sàng lấy (Manager only)
     * PUT /api/concessions/orders/123/ready
     */
    @PutMapping("/{orderId}/ready")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<ConcessionOrderDTO> markOrderReady(@PathVariable Integer orderId) {
        log.info("Marking order ready: {}", orderId);
        ConcessionOrderDTO order = orderService.updateOrderStatus(
                orderId, ConcessionOrderStatus.READY);
        return ResponseEntity.ok(order);
    }

    /**
     * Hoàn thành đơn hàng (Manager only)
     * PUT /api/concessions/orders/123/complete
     */
    @PutMapping("/{orderId}/complete")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<ConcessionOrderDTO> completeOrder(@PathVariable Integer orderId) {
        log.info("Completing order: {}", orderId);
        ConcessionOrderDTO order = orderService.updateOrderStatus(
                orderId, ConcessionOrderStatus.COMPLETED);
        return ResponseEntity.ok(order);
    }

    /**
     * Hủy đơn hàng
     * PUT /api/concessions/orders/123/cancel
     */
    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> cancelOrder(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request) {
        
        String reason = request.getOrDefault("reason", "Không có lý do");
        log.info("Cancelling order {}: {}", orderId, reason);
        
        ConcessionOrderDTO order = orderService.cancelOrder(orderId, reason);
        return ResponseEntity.ok(order);
    }
}
