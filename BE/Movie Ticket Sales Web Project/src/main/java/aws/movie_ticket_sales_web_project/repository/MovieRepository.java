package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Movie;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {
    
    Page<Movie> findByStatus(MovieStatus status, Pageable pageable);
    
    @Query("SELECT m FROM Movie m WHERE " +
           "(:status IS NULL OR m.status = :status)")
    Page<Movie> findMoviesWithFilters(@Param("status") MovieStatus status, 
                                     Pageable pageable);
}