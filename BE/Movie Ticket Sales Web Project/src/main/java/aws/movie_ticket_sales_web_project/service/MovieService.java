package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.enums.FormatType;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class MovieService {

    private final MovieRepository movieRepository;
    private final MovieGenreMappingRepository movieGenreMappingRepository;
    private final ShowtimeRepository showtimeRepository;

    /**
     * Get movies list with pagination and filters
     */
    public ApiResponse<PagedMoviesResponse> getMovies(String status, 
                                                     Integer page, 
                                                     Integer size, 
                                                     String sortBy, 
                                                     String sortDir) {
        try {
            log.info("Getting movies with filters - status: {}, page: {}, size: {}, sortBy: {}, sortDir: {}", 
                    status, page, size, sortBy, sortDir);

            // Validate and set defaults
            page = (page != null) ? page : 0;
            size = (size != null) ? size : 12;
            sortBy = (sortBy != null) ? sortBy : "releaseDate";
            sortDir = (sortDir != null) ? sortDir : "desc";

            // Create sort object
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), mapSortField(sortBy));
            Pageable pageable = PageRequest.of(page, size, sort);

            // Get movies
            Page<Movie> moviesPage;
            if (status != null && !status.isEmpty()) {
                try {
                    MovieStatus movieStatus = MovieStatus.valueOf(status.toUpperCase());
                    moviesPage = movieRepository.findByStatus(movieStatus, pageable);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status parameter: {}", status);
                    moviesPage = movieRepository.findAll(pageable);
                }
            } else {
                moviesPage = movieRepository.findAll(pageable);
            }

            // Convert to DTOs
            List<MovieListItemDto> movieDtos = moviesPage.getContent().stream()
                    .map(this::convertToMovieListItem)
                    .collect(Collectors.toList());

            PagedMoviesResponse response = new PagedMoviesResponse();
            response.setContent(movieDtos);
            response.setTotalElements(moviesPage.getTotalElements());
            response.setTotalPages(moviesPage.getTotalPages());
            response.setCurrentPage(page);
            response.setSize(size);

            return ApiResponse.<PagedMoviesResponse>builder()
                    .success(true)
                    .message("Movies retrieved successfully")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving movies", e);
            return ApiResponse.<PagedMoviesResponse>builder()
                    .success(false)
                    .message("Failed to retrieve movies: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get movie details by ID
     */
    public ApiResponse<MovieDetailDto> getMovieById(Integer movieId) {
        try {
            log.info("Getting movie details for ID: {}", movieId);

            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + movieId));

            MovieDetailDto movieDetail = convertToMovieDetail(movie);

            return ApiResponse.<MovieDetailDto>builder()
                    .success(true)
                    .message("Movie details retrieved successfully")
                    .data(movieDetail)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving movie details for ID: {}", movieId, e);
            return ApiResponse.<MovieDetailDto>builder()
                    .success(false)
                    .message("Failed to retrieve movie details: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert Movie entity to MovieListItemDto
     */
    private MovieListItemDto convertToMovieListItem(Movie movie) {
        MovieListItemDto dto = new MovieListItemDto();
        dto.setMovieId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setTitleEn(movie.getTitleEn());
        dto.setAgeRating(movie.getAgeRating() != null ? movie.getAgeRating().toString() : null);
        dto.setDuration(movie.getDurationMinutes());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setStatus(movie.getStatus() != null ? movie.getStatus().toString() : null);
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setImdbRating(movie.getImdbRating());
        dto.setIsFeatured(movie.getIsFeatured());
        
        // Get genres
        dto.setGenres(getMovieGenres(movie.getId()));
        
        // Get available formats
        dto.setFormats(getMovieFormats(movie.getId()));

        return dto;
    }

    /**
     * Convert Movie entity to MovieDetailDto
     */
    private MovieDetailDto convertToMovieDetail(Movie movie) {
        MovieDetailDto dto = new MovieDetailDto();
        dto.setMovieId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setTitleEn(movie.getTitleEn());
        dto.setAgeRating(movie.getAgeRating() != null ? movie.getAgeRating().toString() : null);
        dto.setContentWarning(movie.getContentWarning());
        dto.setSynopsis(movie.getSynopsis());
        dto.setSynopsisEn(movie.getSynopsisEn());
        dto.setDuration(movie.getDurationMinutes());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setEndDate(movie.getEndDate());
        dto.setCountry(movie.getCountry());
        dto.setLanguage(movie.getLanguage());
        dto.setSubtitleLanguage(movie.getSubtitleLanguage());
        dto.setDirector(movie.getDirector());
        dto.setCast(movie.getCast());
        dto.setProducer(movie.getProducer());
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setBackdropUrl(movie.getBackdropUrl());
        dto.setTrailerUrl(movie.getTrailerUrl());
        dto.setStatus(movie.getStatus() != null ? movie.getStatus().toString() : null);
        dto.setIsFeatured(movie.getIsFeatured());
        dto.setImdbRating(movie.getImdbRating());
        dto.setImdbId(movie.getImdbId());
        
        // Get genres
        dto.setGenres(getMovieGenres(movie.getId()));
        
        // Get available formats
        dto.setAvailableFormats(getMovieFormats(movie.getId()));

        return dto;
    }

    /**
     * Get genres for a movie
     */
    private List<GenreDto> getMovieGenres(Integer movieId) {
        try {
            List<MovieGenreMapping> genreMappings = movieGenreMappingRepository.findByMovieIdWithGenre(movieId);
            return genreMappings.stream()
                    .map(mapping -> new GenreDto(mapping.getGenre().getId(), mapping.getGenre().getGenreName()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting genres for movie ID: {}", movieId, e);
            return List.of();
        }
    }

    /**
     * Get available formats for a movie
     */
    private List<String> getMovieFormats(Integer movieId) {
        try {
            List<FormatType> formats = showtimeRepository.findDistinctFormatTypesByMovieId(movieId);
            return formats.stream()
                    .map(FormatType::getValue)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting formats for movie ID: {}", movieId, e);
            return List.of();
        }
    }

    /**
     * Map sort field names
     */
    private String mapSortField(String sortBy) {
        switch (sortBy) {
            case "releaseDate":
                return "releaseDate";
            case "title":
                return "title";
            case "popularity":
                return "isFeatured"; // Using isFeatured as popularity indicator
            default:
                return "releaseDate";
        }
    }
}