package aws.movie_ticket_sales_web_project.enums;

public enum RoleName {
    ADMIN("ADMIN", "Administrator"),
    CUSTOMER("CUSTOMER", "Customer"),
    STAFF("STAFF", "Staff");

    private final String roleName;
    private final String displayName;

    RoleName(String roleName, String displayName) {
        this.roleName = roleName;
        this.displayName = displayName;
    }

    public String getRoleName() {
        return roleName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static RoleName fromString(String roleName) {
        for (RoleName role : RoleName.values()) {
            if (role.getRoleName().equalsIgnoreCase(roleName)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + roleName);
    }
}