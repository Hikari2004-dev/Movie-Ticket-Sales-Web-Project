package aws.movie_ticket_sales_web_project.enums;

/**
 * Enum representing different types of points transactions
 */
public enum TransactionType {
    EARN,     // Tích điểm
    REDEEM,   // Đổi điểm
    EXPIRE,   // Hết hạn
    ADJUST,   // Điều chỉnh
    GIFT      // Tặng điểm
}