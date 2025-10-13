package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "concession_items")
public class ConcessionItem {
    @Id
    @Column(name = "item_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ConcessionCategory category;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "size", length = 50)
    private String size;

    @Column(name = "calories")
    private Integer calories;

    @Lob
    @Column(name = "ingredients")
    private String ingredients;

    @ColumnDefault("0")
    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @ColumnDefault("5")
    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @ColumnDefault("0")
    @Column(name = "is_combo")
    private Boolean isCombo;

    @Column(name = "combo_items")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> comboItems;

    @ColumnDefault("1")
    @Column(name = "is_available")
    private Boolean isAvailable;

    @Column(name = "available_cinemas")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> availableCinemas;

    @ColumnDefault("0")
    @Column(name = "display_order")
    private Integer displayOrder;

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

    public ConcessionCategory getCategory() {
        return category;
    }

    public void setCategory(ConcessionCategory category) {
        this.category = category;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public Boolean getIsCombo() {
        return isCombo;
    }

    public void setIsCombo(Boolean isCombo) {
        this.isCombo = isCombo;
    }

    public Map<String, Object> getComboItems() {
        return comboItems;
    }

    public void setComboItems(Map<String, Object> comboItems) {
        this.comboItems = comboItems;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public Map<String, Object> getAvailableCinemas() {
        return availableCinemas;
    }

    public void setAvailableCinemas(Map<String, Object> availableCinemas) {
        this.availableCinemas = availableCinemas;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
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