package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedShowtimeResponse {
    private List<ShowtimeDto> showtimes;
    private Integer currentPage;
    private Integer totalPages;
    private Long totalItems;
}
