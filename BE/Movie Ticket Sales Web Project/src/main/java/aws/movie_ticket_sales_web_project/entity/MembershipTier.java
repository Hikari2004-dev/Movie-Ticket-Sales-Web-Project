package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "membership_tiers")
public class MembershipTier {
    @Id
    @Column(name = "tier_id", nullable = false)
    private Integer id;

    @Column(name = "tier_name", nullable = false, length = 100)
    private String tierName;

    @Column(name = "tier_name_display", length = 100)
    private String tierNameDisplay;

    @ColumnDefault("0.00")
    @Column(name = "min_annual_spending", precision = 12, scale = 2)
    private BigDecimal minAnnualSpending;

    @ColumnDefault("0")
    @Column(name = "min_visits_per_year")
    private Integer minVisitsPerYear;

    @ColumnDefault("1.00")
    @Column(name = "points_earn_rate", precision = 5, scale = 2)
    private BigDecimal pointsEarnRate;

    @Lob
    @Column(name = "birthday_gift_description")
    private String birthdayGiftDescription;

    @ColumnDefault("0.00")
    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage;

    @ColumnDefault("0")
    @Column(name = "free_tickets_per_year")
    private Integer freeTicketsPerYear;

    @ColumnDefault("0")
    @Column(name = "priority_booking")
    private Boolean priorityBooking;

    @ColumnDefault("0")
    @Column(name = "free_upgrades")
    private Boolean freeUpgrades;

    @Column(name = "tier_level", nullable = false)
    private Integer tierLevel;

    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTierName() {
        return tierName;
    }

    public void setTierName(String tierName) {
        this.tierName = tierName;
    }

    public String getTierNameDisplay() {
        return tierNameDisplay;
    }

    public void setTierNameDisplay(String tierNameDisplay) {
        this.tierNameDisplay = tierNameDisplay;
    }

    public BigDecimal getMinAnnualSpending() {
        return minAnnualSpending;
    }

    public void setMinAnnualSpending(BigDecimal minAnnualSpending) {
        this.minAnnualSpending = minAnnualSpending;
    }

    public Integer getMinVisitsPerYear() {
        return minVisitsPerYear;
    }

    public void setMinVisitsPerYear(Integer minVisitsPerYear) {
        this.minVisitsPerYear = minVisitsPerYear;
    }

    public BigDecimal getPointsEarnRate() {
        return pointsEarnRate;
    }

    public void setPointsEarnRate(BigDecimal pointsEarnRate) {
        this.pointsEarnRate = pointsEarnRate;
    }

    public String getBirthdayGiftDescription() {
        return birthdayGiftDescription;
    }

    public void setBirthdayGiftDescription(String birthdayGiftDescription) {
        this.birthdayGiftDescription = birthdayGiftDescription;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public Integer getFreeTicketsPerYear() {
        return freeTicketsPerYear;
    }

    public void setFreeTicketsPerYear(Integer freeTicketsPerYear) {
        this.freeTicketsPerYear = freeTicketsPerYear;
    }

    public Boolean getPriorityBooking() {
        return priorityBooking;
    }

    public void setPriorityBooking(Boolean priorityBooking) {
        this.priorityBooking = priorityBooking;
    }

    public Boolean getFreeUpgrades() {
        return freeUpgrades;
    }

    public void setFreeUpgrades(Boolean freeUpgrades) {
        this.freeUpgrades = freeUpgrades;
    }

    public Integer getTierLevel() {
        return tierLevel;
    }

    public void setTierLevel(Integer tierLevel) {
        this.tierLevel = tierLevel;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

}