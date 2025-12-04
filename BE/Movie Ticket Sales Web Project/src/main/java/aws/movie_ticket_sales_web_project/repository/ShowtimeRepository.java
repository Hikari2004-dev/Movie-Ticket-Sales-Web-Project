package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Showtime;
import aws.movie_ticket_sales_web_project.enums.FormatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Integer> {
    
    @Query("SELECT DISTINCT s.formatType FROM Showtime s WHERE s.movie.id = :movieId")
    List<FormatType> findDistinctFormatTypesByMovieId(@Param("movieId") Integer movieId);
    
    @Query("SELECT s FROM Showtime s WHERE s.movie.id = :movieId")
    List<Showtime> findByMovieId(@Param("movieId") Integer movieId);
}