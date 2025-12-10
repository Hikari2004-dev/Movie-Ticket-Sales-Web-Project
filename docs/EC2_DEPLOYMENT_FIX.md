# Hướng dẫn khắc phục lỗi kết nối EC2

## Vấn đề hiện tại
- Frontend đang cố kết nối tới `localhost:8080` 
- Trên EC2, backend không chạy ở localhost
- Cần cấu hình đúng IP và port cho production

## Khắc phục nhanh

### 1. Cập nhật biến môi trường Frontend
```bash
# Trên EC2, tìm Public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Cập nhật file .env.production
echo "REACT_APP_API_URL=http://YOUR_EC2_PUBLIC_IP:8080/api" > FE/my-app/.env.production
```

### 2. Kiểm tra Backend đang chạy
```bash
# Kiểm tra backend có chạy không
sudo netstat -tlnp | grep :8080

# Nếu chưa chạy, start backend
cd "BE/Movie Ticket Sales Web Project"
nohup java -jar target/*.jar --spring.profiles.active=dev &
```

### 3. Cấu hình Security Group EC2
Đảm bảo Security Group cho phép:
- Port 80 (HTTP): 0.0.0.0/0
- Port 8080 (Backend): 0.0.0.0/0  
- Port 22 (SSH): Your IP

### 4. Rebuild Frontend với cấu hình mới
```bash
cd FE/my-app
npm run build
```

### 5. Test kết nối
```bash
# Test backend API
curl http://YOUR_EC2_PUBLIC_IP:8080/api/cinemas

# Test từ browser
http://YOUR_EC2_PUBLIC_IP:8080/api/cinemas
```

## Cấu hình đầy đủ (Recommended)

### Option 1: Sử dụng nginx reverse proxy
- Frontend chạy port 80
- nginx proxy /api/ requests tới backend:8080
- Chỉ cần expose port 80

### Option 2: Cấu hình domain/subdomain
- Sử dụng Route 53 hoặc domain provider
- Cấu hình HTTPS với SSL certificate
- Production ready

## Files đã tạo
1. `.env.production` - Cấu hình production cho frontend
2. `deploy-ec2.sh` - Script deployment tự động

## Troubleshooting

### Lỗi CORS
Nếu vẫn gặp lỗi CORS, kiểm tra SecurityConfig.java:
```java
configuration.setAllowedOriginPatterns(Arrays.asList("*"));
```

### Database connection
Kiểm tra MySQL service trên EC2:
```bash
sudo systemctl status mysql
```

### Memory issues
Nếu EC2 thiếu RAM:
```bash
# Tăng swap space
sudo dd if=/dev/zero of=/swapfile bs=1024 count=1048576
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```