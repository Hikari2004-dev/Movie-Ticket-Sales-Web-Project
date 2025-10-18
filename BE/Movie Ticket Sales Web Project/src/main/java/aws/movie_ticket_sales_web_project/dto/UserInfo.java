package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private Integer userId;
    private String email;
    private String fullName;
    private String membershipTier;
    private Integer availablePoints;
}
