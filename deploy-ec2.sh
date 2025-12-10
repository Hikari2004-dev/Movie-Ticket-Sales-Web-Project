#!/bin/bash

# EC2 Deployment Script for Movie Ticket Sales Web Project
# Chạy script này trên EC2 instance

echo "=== Movie Ticket Sales Web Project - EC2 Deployment ==="

# 1. Cập nhật hệ thống
sudo yum update -y

# 2. Cài đặt Java 17 (nếu chưa có)
sudo yum install -y java-17-amazon-corretto-headless

# 3. Cài đặt Node.js và npm (nếu chưa có)
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 4. Cài đặt PM2 để quản lý process
sudo npm install -g pm2

echo "=== Cấu hình biến môi trường ==="

# Lấy public IP của EC2
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "EC2 Public IP: $EC2_PUBLIC_IP"

# Tạo file .env.production cho frontend với IP thực tế
cat > /home/ec2-user/movie-ticket-project/FE/my-app/.env.production << EOF
REACT_APP_API_URL=http://$EC2_PUBLIC_IP:8080/api
REACT_APP_NAME=Movie Ticket Sales
GENERATE_SOURCEMAP=false
EOF

echo "=== Build và Deploy Backend ==="

# Build backend (Spring Boot)
cd /home/ec2-user/movie-ticket-project/BE/Movie\ Ticket\ Sales\ Web\ Project/
./mvnw clean package -DskipTests

# Tạo service systemd cho backend
sudo tee /etc/systemd/system/movie-ticket-backend.service > /dev/null << EOF
[Unit]
Description=Movie Ticket Sales Backend
After=syslog.target network.target

[Service]
User=ec2-user
Type=simple
WorkingDirectory=/home/ec2-user/movie-ticket-project/BE/Movie Ticket Sales Web Project
ExecStart=/usr/bin/java -jar target/Movie-Ticket-Sales-Web-Project-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable và start backend service
sudo systemctl daemon-reload
sudo systemctl enable movie-ticket-backend
sudo systemctl start movie-ticket-backend

echo "=== Build và Deploy Frontend ==="

# Build frontend
cd /home/ec2-user/movie-ticket-project/FE/my-app/
npm install
npm run build

# Cài đặt và cấu hình nginx cho frontend
sudo yum install -y nginx

# Cấu hình nginx
sudo tee /etc/nginx/conf.d/movie-ticket.conf > /dev/null << EOF
server {
    listen 80;
    server_name _;
    
    root /home/ec2-user/movie-ticket-project/FE/my-app/build;
    index index.html;
    
    # Serve static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Set permissions for nginx to access build files
sudo chown -R nginx:nginx /home/ec2-user/movie-ticket-project/FE/my-app/build
sudo chmod -R 755 /home/ec2-user/movie-ticket-project/FE/my-app/build

# Start nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo "=== Cấu hình Security Groups ==="
echo "Hãy đảm bảo Security Group của EC2 cho phép:"
echo "- Port 80 (HTTP) từ 0.0.0.0/0"
echo "- Port 8080 (Backend) từ 0.0.0.0/0"
echo "- Port 22 (SSH) từ IP của bạn"

echo "=== Deployment hoàn thành! ==="
echo "Frontend: http://$EC2_PUBLIC_IP"
echo "Backend API: http://$EC2_PUBLIC_IP:8080/api"
echo ""
echo "Kiểm tra status services:"
echo "sudo systemctl status movie-ticket-backend"
echo "sudo systemctl status nginx"