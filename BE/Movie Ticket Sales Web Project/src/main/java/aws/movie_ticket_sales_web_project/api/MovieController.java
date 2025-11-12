package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.service.MovieService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class MovieController {

    private final MovieService movieService;

    /**
     * Get movies list with pagination and filters
     * GET /api/movies
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedMoviesResponse>> getMovies(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "size", defaultValue = "12") Integer size,
            @RequestParam(value = "sortBy", defaultValue = "releaseDate") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        
        log.info("GET /api/movies - status: {}, page: {}, size: {}, sortBy: {}, sortDir: {}", 
                status, page, size, sortBy, sortDir);

        ApiResponse<PagedMoviesResponse> response = movieService.getMovies(status, page, size, sortBy, sortDir);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get movie details by ID
     * GET /api/movies/{movieId}
     */
    @GetMapping("/{movieId}")
    public ResponseEntity<ApiResponse<MovieDetailDto>> getMovieById(
            @PathVariable Integer movieId) {
        
        log.info("GET /api/movies/{}", movieId);

        ApiResponse<MovieDetailDto> response = movieService.getMovieById(movieId);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}