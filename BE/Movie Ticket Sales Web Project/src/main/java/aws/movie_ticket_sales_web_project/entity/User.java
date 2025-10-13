package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Lob
    @Column(name = "gender")
    private String gender;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

    @ColumnDefault("0")
    @Column(name = "is_email_verified")
    private Boolean isEmailVerified;

    @ColumnDefault("0")
    @Column(name = "is_phone_verified")
    private Boolean isPhoneVerified;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @Column(name = "phone_verified_at")
    private Instant phoneVerifiedAt;

    @ColumnDefault("0")
    @Column(name = "privacy_policy_accepted")
    private Boolean privacyPolicyAccepted;

    @Column(name = "privacy_policy_version", length = 20)
    private String privacyPolicyVersion;

    @Column(name = "privacy_policy_accepted_at")
    private Instant privacyPolicyAcceptedAt;

    @ColumnDefault("0")
    @Column(name = "terms_of_service_accepted")
    private Boolean termsOfServiceAccepted;

    @Column(name = "terms_of_service_version", length = 20)
    private String termsOfServiceVersion;

    @Column(name = "terms_of_service_accepted_at")
    private Instant termsOfServiceAcceptedAt;

    @ColumnDefault("0")
    @Column(name = "marketing_email_consent")
    private Boolean marketingEmailConsent;

    @ColumnDefault("0")
    @Column(name = "marketing_sms_consent")
    private Boolean marketingSmsConsent;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @ColumnDefault("0")
    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_expires")
    private Instant passwordResetExpires;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsEmailVerified() {
        return isEmailVerified;
    }

    public void setIsEmailVerified(Boolean isEmailVerified) {
        this.isEmailVerified = isEmailVerified;
    }

    public Boolean getIsPhoneVerified() {
        return isPhoneVerified;
    }

    public void setIsPhoneVerified(Boolean isPhoneVerified) {
        this.isPhoneVerified = isPhoneVerified;
    }

    public Instant getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    public void setEmailVerifiedAt(Instant emailVerifiedAt) {
        this.emailVerifiedAt = emailVerifiedAt;
    }

    public Instant getPhoneVerifiedAt() {
        return phoneVerifiedAt;
    }

    public void setPhoneVerifiedAt(Instant phoneVerifiedAt) {
        this.phoneVerifiedAt = phoneVerifiedAt;
    }

    public Boolean getPrivacyPolicyAccepted() {
        return privacyPolicyAccepted;
    }

    public void setPrivacyPolicyAccepted(Boolean privacyPolicyAccepted) {
        this.privacyPolicyAccepted = privacyPolicyAccepted;
    }

    public String getPrivacyPolicyVersion() {
        return privacyPolicyVersion;
    }

    public void setPrivacyPolicyVersion(String privacyPolicyVersion) {
        this.privacyPolicyVersion = privacyPolicyVersion;
    }

    public Instant getPrivacyPolicyAcceptedAt() {
        return privacyPolicyAcceptedAt;
    }

    public void setPrivacyPolicyAcceptedAt(Instant privacyPolicyAcceptedAt) {
        this.privacyPolicyAcceptedAt = privacyPolicyAcceptedAt;
    }

    public Boolean getTermsOfServiceAccepted() {
        return termsOfServiceAccepted;
    }

    public void setTermsOfServiceAccepted(Boolean termsOfServiceAccepted) {
        this.termsOfServiceAccepted = termsOfServiceAccepted;
    }

    public String getTermsOfServiceVersion() {
        return termsOfServiceVersion;
    }

    public void setTermsOfServiceVersion(String termsOfServiceVersion) {
        this.termsOfServiceVersion = termsOfServiceVersion;
    }

    public Instant getTermsOfServiceAcceptedAt() {
        return termsOfServiceAcceptedAt;
    }

    public void setTermsOfServiceAcceptedAt(Instant termsOfServiceAcceptedAt) {
        this.termsOfServiceAcceptedAt = termsOfServiceAcceptedAt;
    }

    public Boolean getMarketingEmailConsent() {
        return marketingEmailConsent;
    }

    public void setMarketingEmailConsent(Boolean marketingEmailConsent) {
        this.marketingEmailConsent = marketingEmailConsent;
    }

    public Boolean getMarketingSmsConsent() {
        return marketingSmsConsent;
    }

    public void setMarketingSmsConsent(Boolean marketingSmsConsent) {
        this.marketingSmsConsent = marketingSmsConsent;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }

    public void setLockedUntil(Instant lockedUntil) {
        this.lockedUntil = lockedUntil;
    }

    public String getPasswordResetToken() {
        return passwordResetToken;
    }

    public void setPasswordResetToken(String passwordResetToken) {
        this.passwordResetToken = passwordResetToken;
    }

    public Instant getPasswordResetExpires() {
        return passwordResetExpires;
    }

    public void setPasswordResetExpires(Instant passwordResetExpires) {
        this.passwordResetExpires = passwordResetExpires;
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

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(User updatedBy) {
        this.updatedBy = updatedBy;
    }
}