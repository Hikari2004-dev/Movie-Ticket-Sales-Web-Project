package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ConcessionOrderDTO;
import aws.movie_ticket_sales_web_project.dto.CreateConcessionOrderRequest;
import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import aws.movie_ticket_sales_web_project.service.ConcessionOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConcessionOrderController Unit Tests")
class ConcessionOrderControllerTest {

    @Mock
    private ConcessionOrderService orderService;

    @InjectMocks
    private ConcessionOrderController concessionOrderController;

    private static final Integer ORDER_ID = 1;
    private static final Integer USER_ID = 10;
    private static final Integer CINEMA_ID = 5;
    private static final Integer BOOKING_ID = 20;
    private static final String ORDER_NUMBER = "CO1234567890";

    private ConcessionOrderDTO createTestOrder() {
        return ConcessionOrderDTO.builder()
                .orderId(ORDER_ID)
                .userId(USER_ID)
                .userName("Test User")
                .userEmail("test@example.com")
                .cinemaId(CINEMA_ID)
                .cinemaName("Test Cinema")
                .showtimeId(15)
                .movieTitle("Test Movie")
                .showtimeDate(Instant.now())
                .totalAmount(new BigDecimal("150000"))
                .status(ConcessionOrderStatus.PENDING)
                .pickupCode("12345")
                .notes("Test notes")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .items(new ArrayList<>())
                .build();
    }

    @Nested
    @DisplayName("createOrder Tests")
    class CreateOrderTests {

        @Test
        @DisplayName("Should create order successfully")
        void shouldCreateOrderSuccessfully() {
            // Arrange
            CreateConcessionOrderRequest request = CreateConcessionOrderRequest.builder()
                    .userId(USER_ID)
                    .cinemaId(CINEMA_ID)
                    .showtimeId(15)
                    .notes("Test notes")
                    .items(new ArrayList<>())
                    .build();

            ConcessionOrderDTO expectedOrder = createTestOrder();
            when(orderService.createOrder(request)).thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.createOrder(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getOrderId()).isEqualTo(ORDER_ID);
            assertThat(response.getBody().getUserId()).isEqualTo(USER_ID);
            assertThat(response.getBody().getCinemaId()).isEqualTo(CINEMA_ID);
            verify(orderService).createOrder(request);
        }

        @Test
        @DisplayName("Should create order without showtime")
        void shouldCreateOrderWithoutShowtime() {
            // Arrange
            CreateConcessionOrderRequest request = CreateConcessionOrderRequest.builder()
                    .userId(USER_ID)
                    .cinemaId(CINEMA_ID)
                    .showtimeId(null)
                    .items(new ArrayList<>())
                    .build();

            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setShowtimeId(null);
            when(orderService.createOrder(request)).thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.createOrder(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getShowtimeId()).isNull();
        }
    }

    @Nested
    @DisplayName("getOrder Tests")
    class GetOrderTests {

        @Test
        @DisplayName("Should return order by ID successfully")
        void shouldReturnOrderByIdSuccessfully() {
            // Arrange
            ConcessionOrderDTO expectedOrder = createTestOrder();
            when(orderService.getOrderById(ORDER_ID)).thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.getOrder(ORDER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getOrderId()).isEqualTo(ORDER_ID);
            verify(orderService).getOrderById(ORDER_ID);
        }
    }

    @Nested
    @DisplayName("getOrderByNumber Tests")
    class GetOrderByNumberTests {

        @Test
        @DisplayName("Should return order by order number successfully")
        void shouldReturnOrderByNumberSuccessfully() {
            // Arrange
            ConcessionOrderDTO expectedOrder = createTestOrder();
            when(orderService.getOrderByNumber(ORDER_NUMBER)).thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.getOrderByNumber(ORDER_NUMBER);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getOrderId()).isEqualTo(ORDER_ID);
            verify(orderService).getOrderByNumber(ORDER_NUMBER);
        }
    }

    @Nested
    @DisplayName("getUserOrders Tests")
    class GetUserOrdersTests {

        @Test
        @DisplayName("Should return user orders successfully")
        void shouldReturnUserOrdersSuccessfully() {
            // Arrange
            List<ConcessionOrderDTO> expectedOrders = Arrays.asList(
                    createTestOrder(),
                    createTestOrder()
            );
            when(orderService.getUserOrders(USER_ID)).thenReturn(expectedOrders);

            // Act
            ResponseEntity<List<ConcessionOrderDTO>> response = 
                    concessionOrderController.getUserOrders(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).hasSize(2);
            verify(orderService).getUserOrders(USER_ID);
        }

        @Test
        @DisplayName("Should return empty list when user has no orders")
        void shouldReturnEmptyListWhenUserHasNoOrders() {
            // Arrange
            when(orderService.getUserOrders(USER_ID)).thenReturn(Collections.emptyList());

            // Act
            ResponseEntity<List<ConcessionOrderDTO>> response = 
                    concessionOrderController.getUserOrders(USER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getOrderByBookingId Tests")
    class GetOrderByBookingIdTests {

        @Test
        @DisplayName("Should return order by booking ID successfully")
        void shouldReturnOrderByBookingIdSuccessfully() {
            // Arrange
            ConcessionOrderDTO expectedOrder = createTestOrder();
            when(orderService.getOrderByBookingId(BOOKING_ID)).thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.getOrderByBookingId(BOOKING_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getOrderId()).isEqualTo(ORDER_ID);
            verify(orderService).getOrderByBookingId(BOOKING_ID);
        }

        @Test
        @DisplayName("Should return NO_CONTENT when no order for booking")
        void shouldReturnNoContentWhenNoOrderForBooking() {
            // Arrange
            when(orderService.getOrderByBookingId(BOOKING_ID)).thenReturn(null);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.getOrderByBookingId(BOOKING_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
            assertThat(response.getBody()).isNull();
            verify(orderService).getOrderByBookingId(BOOKING_ID);
        }
    }

    @Nested
    @DisplayName("getCinemaOrders Tests")
    class GetCinemaOrdersTests {

        @Test
        @DisplayName("Should return all cinema orders successfully")
        void shouldReturnAllCinemaOrdersSuccessfully() {
            // Arrange
            List<ConcessionOrderDTO> expectedOrders = Arrays.asList(
                    createTestOrder(),
                    createTestOrder()
            );
            when(orderService.getCinemaOrders(CINEMA_ID, null)).thenReturn(expectedOrders);

            // Act
            ResponseEntity<List<ConcessionOrderDTO>> response = 
                    concessionOrderController.getCinemaOrders(CINEMA_ID, null);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody()).hasSize(2);
            verify(orderService).getCinemaOrders(CINEMA_ID, null);
        }

        @Test
        @DisplayName("Should return cinema orders filtered by status")
        void shouldReturnCinemaOrdersFilteredByStatus() {
            // Arrange
            List<ConcessionOrderDTO> expectedOrders = Arrays.asList(createTestOrder());
            when(orderService.getCinemaOrders(CINEMA_ID, ConcessionOrderStatus.PENDING))
                    .thenReturn(expectedOrders);

            // Act
            ResponseEntity<List<ConcessionOrderDTO>> response = 
                    concessionOrderController.getCinemaOrders(CINEMA_ID, ConcessionOrderStatus.PENDING);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).hasSize(1);
            verify(orderService).getCinemaOrders(CINEMA_ID, ConcessionOrderStatus.PENDING);
        }
    }

    @Nested
    @DisplayName("updateOrderStatus Tests")
    class UpdateOrderStatusTests {

        @Test
        @DisplayName("Should update order status successfully")
        void shouldUpdateOrderStatusSuccessfully() {
            // Arrange
            Map<String, String> request = new HashMap<>();
            request.put("status", "CONFIRMED");

            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setStatus(ConcessionOrderStatus.CONFIRMED);
            when(orderService.updateOrderStatus(ORDER_ID, ConcessionOrderStatus.CONFIRMED))
                    .thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.updateOrderStatus(ORDER_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(ConcessionOrderStatus.CONFIRMED);
            verify(orderService).updateOrderStatus(ORDER_ID, ConcessionOrderStatus.CONFIRMED);
        }
    }

    @Nested
    @DisplayName("confirmOrder Tests")
    class ConfirmOrderTests {

        @Test
        @DisplayName("Should confirm order successfully")
        void shouldConfirmOrderSuccessfully() {
            // Arrange
            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setStatus(ConcessionOrderStatus.CONFIRMED);
            when(orderService.updateOrderStatus(ORDER_ID, ConcessionOrderStatus.CONFIRMED))
                    .thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.confirmOrder(ORDER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(ConcessionOrderStatus.CONFIRMED);
            verify(orderService).updateOrderStatus(ORDER_ID, ConcessionOrderStatus.CONFIRMED);
        }
    }

    @Nested
    @DisplayName("prepareOrder Tests")
    class PrepareOrderTests {

        @Test
        @DisplayName("Should prepare order successfully")
        void shouldPrepareOrderSuccessfully() {
            // Arrange
            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setStatus(ConcessionOrderStatus.PREPARING);
            when(orderService.updateOrderStatus(ORDER_ID, ConcessionOrderStatus.PREPARING))
                    .thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.prepareOrder(ORDER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getStatus()).isEqualTo(ConcessionOrderStatus.PREPARING);
            verify(orderService).updateOrderStatus(ORDER_ID, ConcessionOrderStatus.PREPARING);
        }
    }

    @Nested
    @DisplayName("markOrderReady Tests")
    class MarkOrderReadyTests {

        @Test
        @DisplayName("Should mark order ready successfully")
        void shouldMarkOrderReadySuccessfully() {
            // Arrange
            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setStatus(ConcessionOrderStatus.READY);
            when(orderService.updateOrderStatus(ORDER_ID, ConcessionOrderStatus.READY))
                    .thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.markOrderReady(ORDER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getStatus()).isEqualTo(ConcessionOrderStatus.READY);
            verify(orderService).updateOrderStatus(ORDER_ID, ConcessionOrderStatus.READY);
        }
    }

    @Nested
    @DisplayName("completeOrder Tests")
    class CompleteOrderTests {

        @Test
        @DisplayName("Should complete order successfully")
        void shouldCompleteOrderSuccessfully() {
            // Arrange
            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setStatus(ConcessionOrderStatus.COMPLETED);
            when(orderService.updateOrderStatus(ORDER_ID, ConcessionOrderStatus.COMPLETED))
                    .thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.completeOrder(ORDER_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getStatus()).isEqualTo(ConcessionOrderStatus.COMPLETED);
            verify(orderService).updateOrderStatus(ORDER_ID, ConcessionOrderStatus.COMPLETED);
        }
    }

    @Nested
    @DisplayName("cancelOrder Tests")
    class CancelOrderTests {

        @Test
        @DisplayName("Should cancel order with reason successfully")
        void shouldCancelOrderWithReasonSuccessfully() {
            // Arrange
            Map<String, String> request = new HashMap<>();
            request.put("reason", "Changed my mind");

            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setStatus(ConcessionOrderStatus.CANCELLED);
            when(orderService.cancelOrder(ORDER_ID, "Changed my mind"))
                    .thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.cancelOrder(ORDER_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getStatus()).isEqualTo(ConcessionOrderStatus.CANCELLED);
            verify(orderService).cancelOrder(ORDER_ID, "Changed my mind");
        }

        @Test
        @DisplayName("Should cancel order with default reason when not provided")
        void shouldCancelOrderWithDefaultReason() {
            // Arrange
            Map<String, String> request = new HashMap<>();

            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setStatus(ConcessionOrderStatus.CANCELLED);
            when(orderService.cancelOrder(ORDER_ID, "Không có lý do"))
                    .thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.cancelOrder(ORDER_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getStatus()).isEqualTo(ConcessionOrderStatus.CANCELLED);
            verify(orderService).cancelOrder(ORDER_ID, "Không có lý do");
        }

        @Test
        @DisplayName("Should cancel order with empty reason")
        void shouldCancelOrderWithEmptyReason() {
            // Arrange
            Map<String, String> request = new HashMap<>();
            request.put("reason", "");

            ConcessionOrderDTO expectedOrder = createTestOrder();
            expectedOrder.setStatus(ConcessionOrderStatus.CANCELLED);
            when(orderService.cancelOrder(ORDER_ID, ""))
                    .thenReturn(expectedOrder);

            // Act
            ResponseEntity<ConcessionOrderDTO> response = 
                    concessionOrderController.cancelOrder(ORDER_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(orderService).cancelOrder(ORDER_ID, "");
        }
    }
}
