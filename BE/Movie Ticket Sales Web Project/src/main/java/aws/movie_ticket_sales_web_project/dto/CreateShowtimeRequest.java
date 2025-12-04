package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateShowtimeRequest {
    private Integer movieId;
    private Integer hallId;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String formatType;
    private String subtitleLanguage;
    private Double price;
}
