package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "memberships")
public class Membership {
    @Id
    @Column(name = "membership_id", nullable = false)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "membership_number", nullable = false, length = 50)
    private String membershipNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tier_id", nullable = false)
    private MembershipTier tier;

    @ColumnDefault("0")
    @Column(name = "total_points")
    private Integer totalPoints;

    @ColumnDefault("0")
    @Column(name = "available_points")
    private Integer availablePoints;

    @ColumnDefault("0.00")
    @Column(name = "lifetime_spending", precision = 12, scale = 2)
    private BigDecimal lifetimeSpending;

    @ColumnDefault("0.00")
    @Column(name = "annual_spending", precision = 12, scale = 2)
    private BigDecimal annualSpending;

    @ColumnDefault("0")
    @Column(name = "total_visits")
    private Integer totalVisits;

    @Column(name = "tier_start_date")
    private LocalDate tierStartDate;

    @Column(name = "next_tier_review_date")
    private LocalDate nextTierReviewDate;

    @ColumnDefault("'ACTIVE'")
    @Lob
    @Column(name = "status")
    private String status;

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMembershipNumber() {
        return membershipNumber;
    }

    public void setMembershipNumber(String membershipNumber) {
        this.membershipNumber = membershipNumber;
    }

    public MembershipTier getTier() {
        return tier;
    }

    public void setTier(MembershipTier tier) {
        this.tier = tier;
    }

    public Integer getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(Integer totalPoints) {
        this.totalPoints = totalPoints;
    }

    public Integer getAvailablePoints() {
        return availablePoints;
    }

    public void setAvailablePoints(Integer availablePoints) {
        this.availablePoints = availablePoints;
    }

    public BigDecimal getLifetimeSpending() {
        return lifetimeSpending;
    }

    public void setLifetimeSpending(BigDecimal lifetimeSpending) {
        this.lifetimeSpending = lifetimeSpending;
    }

    public BigDecimal getAnnualSpending() {
        return annualSpending;
    }

    public void setAnnualSpending(BigDecimal annualSpending) {
        this.annualSpending = annualSpending;
    }

    public Integer getTotalVisits() {
        return totalVisits;
    }

    public void setTotalVisits(Integer totalVisits) {
        this.totalVisits = totalVisits;
    }

    public LocalDate getTierStartDate() {
        return tierStartDate;
    }

    public void setTierStartDate(LocalDate tierStartDate) {
        this.tierStartDate = tierStartDate;
    }

    public LocalDate getNextTierReviewDate() {
        return nextTierReviewDate;
    }

    public void setNextTierReviewDate(LocalDate nextTierReviewDate) {
        this.nextTierReviewDate = nextTierReviewDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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