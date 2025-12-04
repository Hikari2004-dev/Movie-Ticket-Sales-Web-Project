package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.ShowtimeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeDto {
    private Integer showtimeId;
    private Integer movieId;
    private String movieName;
    private Integer hallId;
    private String hallName;
    private Integer cinemaId;
    private String cinemaName;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String formatType;
    private String subtitleLanguage;
    private Double price;
    private Integer availableSeats;
    private ShowtimeStatus status;
}
