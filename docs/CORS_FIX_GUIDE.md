# CORS Fix Guide - Khắc phục lỗi CORS trên EC2

## Vấn đề
- CORS policy blocking requests từ IP EC2
- Frontend không thể gọi API backend
- Error: "Access-Control-Allow-Origin" header missing

## Đã sửa

### 1. Backend CORS Configuration ✅
**File:** `SecurityConfig.java`
```java
// Đã thêm IP EC2 vào allowed origins
"http://47.130.182.70:*",     // EC2 IP với mọi port
"http://47.130.182.70:80",    // EC2 Frontend  
"http://47.130.182.70:8080",  // EC2 Backend
"*"                           // Allow all cho development
```

### 2. Frontend Environment ✅
**File:** `.env.production`
```env
REACT_APP_API_URL=http://47.130.182.70:8080/api
```

### 3. Deployment Script ✅
**File:** `cors-fix-deploy.sh`
- Rebuild backend với CORS fix
- Rebuild frontend với IP chính xác
- Cấu hình nginx với CORS headers

## Commands để chạy trên EC2

### Option 1: Quick Fix (Chỉ restart backend)
```bash
# 1. Kill existing backend
pkill -f "Movie-Ticket-Sales-Web-Project"

# 2. Rebuild backend
cd "BE/Movie Ticket Sales Web Project"
./mvnw clean package -DskipTests

# 3. Start backend
nohup java -jar target/*.jar --spring.profiles.active=dev > backend.log 2>&1 &

# 4. Test API
curl -i http://47.130.182.70:8080/api/cinema-chains
```

### Option 2: Full Deployment (Backend + Frontend)
```bash
# Upload và chạy script
chmod +x cors-fix-deploy.sh
./cors-fix-deploy.sh
```

### Option 3: Manual Steps

#### Backend:
```bash
cd "BE/Movie Ticket Sales Web Project"
./mvnw clean package -DskipTests
pkill -f "Movie-Ticket-Sales-Web-Project"
nohup java -jar target/*.jar --spring.profiles.active=dev &
```

#### Frontend:
```bash
cd FE/my-app
NODE_ENV=production npm run build
sudo cp -r build/* /usr/share/nginx/html/
sudo systemctl restart nginx
```

## Test sau khi deploy

### 1. Test Backend API trực tiếp
```bash
curl -H "Origin: http://47.130.182.70" http://47.130.182.70:8080/api/cinema-chains
```

### 2. Test CORS preflight
```bash
curl -X OPTIONS \
  -H "Origin: http://47.130.182.70" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://47.130.182.70:8080/api/cinema-chains
```

### 3. Check từ browser
- Mở Developer Tools
- Network tab
- Thử gọi API và check response headers

## Troubleshooting

### Nếu vẫn lỗi CORS:
```bash
# Check nginx config
sudo nginx -t
sudo systemctl reload nginx

# Check backend logs  
tail -f backend.log

# Check nếu backend đang chạy
netstat -tlnp | grep :8080
```

### Nếu API không response:
```bash
# Check Security Group EC2
# Phải allow ports: 22, 80, 8080

# Check firewall
sudo iptables -L
```

### Emergency CORS bypass (Development only):
Thêm vào SecurityConfig.java:
```java
configuration.setAllowedOriginPatterns(Arrays.asList("*"));
configuration.setAllowCredentials(false);
```

## URLs sau khi fix
- Frontend: http://47.130.182.70
- Backend API: http://47.130.182.70:8080/api
- API qua nginx proxy: http://47.130.182.70/api