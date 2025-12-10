#!/bin/bash

echo "=== CORS Fix Deployment Script ==="
echo "EC2 IP: 47.130.182.70"

# 1. Rebuild Backend với CORS fix
echo "1. Building backend with CORS fix..."
cd "BE/Movie Ticket Sales Web Project"
./mvnw clean package -DskipTests

# 2. Stop existing backend service
echo "2. Stopping existing backend..."
sudo systemctl stop movie-ticket-backend 2>/dev/null || echo "Backend service not running"
pkill -f "Movie-Ticket-Sales-Web-Project" 2>/dev/null || echo "No backend process found"

# 3. Start backend với profile dev
echo "3. Starting backend..."
nohup java -jar target/Movie-Ticket-Sales-Web-Project-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev > backend.log 2>&1 &
echo "Backend started in background"

# 4. Wait for backend to start
echo "4. Waiting for backend to start..."
sleep 10

# 5. Test backend API
echo "5. Testing backend API..."
curl -i http://47.130.182.70:8080/api/cinema-chains

# 6. Rebuild frontend với cấu hình mới
echo "6. Rebuilding frontend..."
cd ../../FE/my-app
npm install
NODE_ENV=production npm run build

# 7. Setup nginx nếu chưa có
echo "7. Setting up nginx..."
sudo yum install -y nginx

# 8. Copy build files
sudo cp -r build/* /usr/share/nginx/html/

# 9. Cấu hình nginx cho SPA và API proxy
sudo tee /etc/nginx/conf.d/movie-ticket.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Enable CORS for all responses
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With' always;
    
    # Handle preflight requests
    location / {
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
        
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for proxied requests
        proxy_hide_header 'Access-Control-Allow-Origin';
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept, Origin, X-Requested-With' always;
    }
}
EOF

# 10. Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "=== Deployment Complete ==="
echo "Frontend: http://47.130.182.70"
echo "Backend API: http://47.130.182.70:8080/api"
echo ""
echo "Test URLs:"
echo "curl http://47.130.182.70:8080/api/cinema-chains"
echo "curl http://47.130.182.70/api/cinema-chains"
echo ""
echo "Check logs:"
echo "tail -f backend.log"
echo "sudo tail -f /var/log/nginx/error.log"