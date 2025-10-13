package aws.movie_ticket_sales_web_project.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "movie_genres")
public class MovieGenre {
    @Id
    @Column(name = "genre_id", nullable = false)
    private Integer id;

    @Column(name = "genre_name", nullable = false, length = 100)
    private String genreName;

    @Column(name = "genre_name_en", length = 100)
    private String genreNameEn;

    @Lob
    @Column(name = "description")
    private String description;

    @ColumnDefault("1")
    @Column(name = "is_active")
    private Boolean isActive;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getGenreName() {
        return genreName;
    }

    public void setGenreName(String genreName) {
        this.genreName = genreName;
    }

    public String getGenreNameEn() {
        return genreNameEn;
    }

    public void setGenreNameEn(String genreNameEn) {
        this.genreNameEn = genreNameEn;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

}