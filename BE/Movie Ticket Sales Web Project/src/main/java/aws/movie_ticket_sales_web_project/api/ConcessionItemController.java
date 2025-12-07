package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.entity.ConcessionItem;
import aws.movie_ticket_sales_web_project.repository.ConcessionItemRepository;
import aws.movie_ticket_sales_web_project.repository.ConcessionCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * API quản lý sản phẩm bắp nước (master data)
 * Đây là data gốc, giá mặc định cho tất cả các rạp
 */
@RestController
@RequestMapping("/api/concessions/items")
@RequiredArgsConstructor
@Slf4j
public class ConcessionItemController {

    private final ConcessionItemRepository itemRepository;
    private final ConcessionCategoryRepository categoryRepository;

    /**
     * Lấy tất cả items available
     * GET /api/concessions/items
     */
    @GetMapping
    public ResponseEntity<List<ConcessionItem>> getAllItems() {
        log.info("Fetching all concession items");
        List<ConcessionItem> items = itemRepository.findAllAvailableItems();
        return ResponseEntity.ok(items);
    }

    /**
     * Lấy items theo category
     * GET /api/concessions/items/category/1
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ConcessionItem>> getItemsByCategory(
            @PathVariable Integer categoryId) {
        
        log.info("Fetching items for category: {}", categoryId);
        List<ConcessionItem> items = itemRepository.findByCategoryId(categoryId);
        return ResponseEntity.ok(items);
    }

    /**
     * Lấy tất cả combos
     * GET /api/concessions/items/combos
     */
    @GetMapping("/combos")
    public ResponseEntity<List<ConcessionItem>> getAllCombos() {
        log.info("Fetching all combo items");
        List<ConcessionItem> combos = itemRepository.findAllCombos();
        return ResponseEntity.ok(combos);
    }

    /**
     * Lấy items không phải combo
     * GET /api/concessions/items/non-combos
     */
    @GetMapping("/non-combos")
    public ResponseEntity<List<ConcessionItem>> getNonComboItems() {
        log.info("Fetching all non-combo items");
        List<ConcessionItem> items = itemRepository.findAllNonComboItems();
        return ResponseEntity.ok(items);
    }

    /**
     * Lấy item theo ID
     * GET /api/concessions/items/5
     */
    @GetMapping("/{id}")
    public ResponseEntity<ConcessionItem> getItemById(@PathVariable Integer id) {
        log.info("Fetching item: {}", id);
        ConcessionItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại"));
        return ResponseEntity.ok(item);
    }

    /**
     * Search items theo tên
     * GET /api/concessions/items/search?keyword=combo
     */
    @GetMapping("/search")
    public ResponseEntity<List<ConcessionItem>> searchItems(
            @RequestParam String keyword) {
        
        log.info("Searching items with keyword: {}", keyword);
        List<ConcessionItem> items = itemRepository.searchByName(keyword);
        return ResponseEntity.ok(items);
    }

    /**
     * Tạo item mới (Admin only)
     * POST /api/concessions/items
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<ConcessionItem> createItem(
            @RequestBody ConcessionItem item) {
        
        log.info("Creating new item: {}", item.getItemName());
        
        // Check tên đã tồn tại
        if (itemRepository.existsByItemName(item.getItemName())) {
            throw new RuntimeException("Tên item đã tồn tại");
        }
        
        // Validate category
        if (item.getCategory() == null || item.getCategory().getId() == null) {
            throw new RuntimeException("Category không được để trống");
        }
        
        categoryRepository.findById(item.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category không tồn tại"));
        
        item.setCreatedAt(Instant.now());
        item.setUpdatedAt(Instant.now());
        if (item.getIsAvailable() == null) {
            item.setIsAvailable(true);
        }
        if (item.getIsCombo() == null) {
            item.setIsCombo(false);
        }
        
        ConcessionItem saved = itemRepository.save(item);
        log.info("Created item with ID: {}", saved.getId());
        
        return ResponseEntity.ok(saved);
    }

    /**
     * Cập nhật item (Admin only)
     * PUT /api/concessions/items/5
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<ConcessionItem> updateItem(
            @PathVariable Integer id,
            @RequestBody ConcessionItem itemData) {
        
        log.info("Updating item: {}", id);
        
        ConcessionItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại"));
        
        // Check tên trùng (trừ chính nó)
        if (!item.getItemName().equals(itemData.getItemName()) 
            && itemRepository.existsByItemName(itemData.getItemName())) {
            throw new RuntimeException("Tên item đã tồn tại");
        }
        
        // Update fields
        item.setCategory(itemData.getCategory());
        item.setItemName(itemData.getItemName());
        item.setDescription(itemData.getDescription());
        item.setImageUrl(itemData.getImageUrl());
        item.setPrice(itemData.getPrice());
        item.setCostPrice(itemData.getCostPrice());
        item.setSize(itemData.getSize());
        item.setCalories(itemData.getCalories());
        item.setIngredients(itemData.getIngredients());
        item.setIsCombo(itemData.getIsCombo());
        item.setComboItems(itemData.getComboItems());
        item.setIsAvailable(itemData.getIsAvailable());
        item.setDisplayOrder(itemData.getDisplayOrder());
        item.setUpdatedAt(Instant.now());
        
        ConcessionItem updated = itemRepository.save(item);
        return ResponseEntity.ok(updated);
    }

    /**
     * Xóa item (Admin only) - Soft delete
     * DELETE /api/concessions/items/5
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteItem(@PathVariable Integer id) {
        log.info("Deleting item: {}", id);
        
        ConcessionItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại"));
        
        // Soft delete
        item.setIsAvailable(false);
        item.setUpdatedAt(Instant.now());
        itemRepository.save(item);
        
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
    }

    /**
     * Bật/tắt item (Admin only)
     * PUT /api/concessions/items/5/toggle
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<ConcessionItem> toggleItem(@PathVariable Integer id) {
        log.info("Toggling item: {}", id);
        
        ConcessionItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item không tồn tại"));
        
        item.setIsAvailable(!item.getIsAvailable());
        item.setUpdatedAt(Instant.now());
        
        ConcessionItem updated = itemRepository.save(item);
        return ResponseEntity.ok(updated);
    }

    /**
     * Lấy items có tồn kho thấp (Admin only)
     * GET /api/concessions/items/low-stock
     */
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<ConcessionItem>> getLowStockItems() {
        log.info("Fetching low stock items");
        List<ConcessionItem> items = itemRepository.findLowStockItems();
        return ResponseEntity.ok(items);
    }

    /**
     * Lấy thống kê items
     * GET /api/concessions/items/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN')")
    public ResponseEntity<Map<String, Object>> getItemStats() {
        log.info("Fetching item statistics");
        
        long totalItems = itemRepository.countAvailableItems();
        long totalCombos = itemRepository.countAvailableCombos();
        
        return ResponseEntity.ok(Map.of(
                "totalItems", totalItems,
                "totalCombos", totalCombos,
                "totalNonCombos", totalItems - totalCombos
        ));
    }
}
