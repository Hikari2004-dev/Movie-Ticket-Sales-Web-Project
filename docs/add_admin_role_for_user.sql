-- Script để gán role ADMIN cho user quoc2004@gmail.com (user_id = 2)

-- 1. Kiểm tra role ADMIN đã tồn tại chưa
INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('ADMIN', 'Administrator role with full system access', NOW());

-- 2. Gán role ADMIN cho user_id = 2 (quoc2004@gmail.com)
INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT 2, r.role_id, NOW()
FROM roles r
WHERE r.role_name = 'ADMIN';

-- 3. Kiểm tra kết quả
SELECT 
    u.user_id,
    u.email,
    u.full_name,
    r.role_name,
    ur.assigned_at
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
WHERE u.user_id = 2;

-- 4. Nếu cần gán thêm role khác (CINEMA_CHAIN_ADMIN, CINEMA_MANAGER)
INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('CINEMA_CHAIN_ADMIN', 'Cinema chain administrator', NOW());

INSERT IGNORE INTO roles (role_name, description, created_at) 
VALUES ('CINEMA_MANAGER', 'Cinema manager', NOW());

-- Gán CINEMA_CHAIN_ADMIN
INSERT IGNORE INTO user_roles (user_id, role_id, assigned_at)
SELECT 2, r.role_id, NOW()
FROM roles r
WHERE r.role_name = 'CINEMA_CHAIN_ADMIN';
