package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.ShowtimeStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShowtimeRequest {
    private Integer showtimeId;
    private LocalTime startTime;
    private LocalTime endTime;
    private String formatType;
    private String subtitleLanguage;
    private Double price;
    private ShowtimeStatus status;
}
