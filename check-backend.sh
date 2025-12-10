#!/bin/bash

echo "🔍 BACKEND CONNECTION TROUBLESHOOT"
echo "=================================="

# Check 1: Is backend running?
echo "1️⃣ Checking if backend is running..."
if netstat -tlnp 2>/dev/null | grep -q ":8080"; then
    echo "✅ Something is listening on port 8080"
    netstat -tlnp | grep :8080
else
    echo "❌ Nothing listening on port 8080"
fi

# Check 2: Java processes
echo -e "\n2️⃣ Checking Java processes..."
if pgrep -f java > /dev/null; then
    echo "✅ Java processes found:"
    pgrep -af java
else
    echo "❌ No Java processes running"
fi

# Check 3: Spring Boot specific
echo -e "\n3️⃣ Checking Spring Boot processes..."
if pgrep -f "Movie-Ticket-Sales\|spring-boot" > /dev/null; then
    echo "✅ Spring Boot process found:"
    pgrep -af "Movie-Ticket-Sales\|spring-boot"
else
    echo "❌ No Spring Boot process found"
fi

# Check 4: Log files
echo -e "\n4️⃣ Checking log files..."
for log_file in backend.log nohup.out application.log; do
    if [ -f "$log_file" ]; then
        echo "📋 Found $log_file (last 5 lines):"
        tail -5 "$log_file"
        echo "---"
    fi
done

# Check 5: Port accessibility
echo -e "\n5️⃣ Testing port accessibility..."
if command -v telnet >/dev/null; then
    timeout 3 telnet localhost 8080 2>/dev/null && echo "✅ Port 8080 accessible locally" || echo "❌ Port 8080 not accessible locally"
fi

# Check 6: Security groups (EC2)
echo -e "\n6️⃣ Checking if on EC2..."
if curl -s -m 3 http://169.254.169.254/latest/meta-data/instance-id 2>/dev/null; then
    echo "✅ Running on EC2"
    echo "⚠️  Make sure Security Group allows:"
    echo "   - Port 8080 (0.0.0.0/0)"
    echo "   - Port 80 (0.0.0.0/0)"
else
    echo "ℹ️  Not running on EC2 or metadata unavailable"
fi

# Check 7: Firewall
echo -e "\n7️⃣ Checking firewall..."
if command -v iptables >/dev/null; then
    if sudo iptables -L INPUT -n 2>/dev/null | grep -q "DROP\|REJECT"; then
        echo "⚠️  Firewall rules detected - check iptables"
    else
        echo "✅ No blocking firewall rules found"
    fi
fi

echo -e "\n🚀 QUICK FIXES:"
echo "==============="
echo "1. Start backend:     ./quick-backend-start.sh"
echo "2. Full diagnosis:    ./backend-diagnosis.sh" 
echo "3. Check logs:        tail -f backend.log"
echo "4. Kill processes:    pkill -f java"
echo "5. Manual start:      cd 'BE/Movie Ticket Sales Web Project' && nohup java -jar target/*.jar --server.port=8080 &"