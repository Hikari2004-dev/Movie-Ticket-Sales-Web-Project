#!/bin/bash

# Quick Backend Start Script
echo "=== Quick Backend Start ==="

# Step 1: Kill existing processes
echo "1. Stopping any existing backend..."
sudo pkill -f "Movie-Ticket-Sales" 2>/dev/null
sudo pkill -f "java.*8080" 2>/dev/null
sudo fuser -k 8080/tcp 2>/dev/null

# Step 2: Find backend directory
echo "2. Finding backend directory..."
if [ -d "BE/Movie Ticket Sales Web Project" ]; then
    cd "BE/Movie Ticket Sales Web Project"
    echo "✅ Found backend in BE/Movie Ticket Sales Web Project"
elif [ -d "Movie Ticket Sales Web Project" ]; then
    cd "Movie Ticket Sales Web Project"
    echo "✅ Found backend in current directory"
else
    echo "❌ Backend directory not found"
    exit 1
fi

# Step 3: Check Java
echo "3. Checking Java version..."
java -version || {
    echo "❌ Java not found. Installing Amazon Corretto 17..."
    sudo yum update -y
    sudo yum install -y java-17-amazon-corretto-headless
}

# Step 4: Build application
echo "4. Building application..."
if [ -f "./mvnw" ]; then
    chmod +x ./mvnw
    ./mvnw clean package -DskipTests -q
else
    mvn clean package -DskipTests -q
fi

# Step 5: Find jar file
echo "5. Looking for jar file..."
JAR_FILE=$(find target -name "*.jar" ! -name "*-sources.jar" | head -1)
if [ -z "$JAR_FILE" ]; then
    echo "❌ No jar file found"
    exit 1
fi
echo "✅ Found: $JAR_FILE"

# Step 6: Start application with explicit configuration
echo "6. Starting backend on port 8080..."
nohup java -jar "$JAR_FILE" \
    --spring.profiles.active=dev \
    --server.port=8080 \
    --server.address=0.0.0.0 \
    --logging.level.org.springframework.web=DEBUG \
    > ../../backend.log 2>&1 &

BACKEND_PID=$!
echo "✅ Backend started with PID: $BACKEND_PID"

# Step 7: Wait and test
echo "7. Waiting for backend to start..."
sleep 10

for i in {1..6}; do
    echo "Testing connection (attempt $i/6)..."
    
    # Test localhost first
    if curl -s -m 5 http://localhost:8080/api/cinema-chains >/dev/null 2>&1; then
        echo "✅ Backend responding on localhost:8080"
        break
    fi
    
    # Test public IP
    if curl -s -m 5 http://47.130.182.70:8080/api/cinema-chains >/dev/null 2>&1; then
        echo "✅ Backend responding on 47.130.182.70:8080"
        break
    fi
    
    if [ $i -eq 6 ]; then
        echo "❌ Backend not responding after 60 seconds"
        echo "Check logs: tail -f ../../backend.log"
        exit 1
    fi
    
    sleep 10
done

echo -e "\n=== SUCCESS! ==="
echo "Backend is running on:"
echo "- Local: http://localhost:8080/api"
echo "- Public: http://47.130.182.70:8080/api"
echo ""
echo "Test commands:"
echo "curl http://47.130.182.70:8080/api/cinema-chains"
echo "curl http://47.130.182.70:8080/actuator/health"
echo ""
echo "Logs: tail -f ../../backend.log"
echo "Stop: kill $BACKEND_PID"