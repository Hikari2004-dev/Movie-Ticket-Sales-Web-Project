#!/bin/bash

echo "=== Backend Connection Diagnosis & Fix ==="
echo "Target: 47.130.182.70:8080"

echo "1. Checking if backend is running..."
netstat -tlnp | grep :8080 || echo "❌ No process on port 8080"

echo -e "\n2. Checking Java processes..."
ps aux | grep java || echo "❌ No Java processes found"

echo -e "\n3. Checking for Spring Boot application..."
ps aux | grep "Movie-Ticket-Sales" || echo "❌ No Spring Boot app running"

echo -e "\n4. Checking port availability..."
sudo ss -tulpn | grep :8080 || echo "Port 8080 is available"

echo -e "\n5. Checking if jar file exists..."
find . -name "*.jar" -type f 2>/dev/null || echo "❌ No jar files found"

echo -e "\n6. Looking for backend directory..."
find . -name "Movie Ticket Sales Web Project" -type d 2>/dev/null || echo "❌ Backend directory not found"

echo -e "\n7. Checking backend logs..."
if [ -f "backend.log" ]; then
    echo "Found backend.log - Last 10 lines:"
    tail -10 backend.log
else
    echo "❌ No backend.log found"
fi

if [ -f "nohup.out" ]; then
    echo "Found nohup.out - Last 10 lines:"
    tail -10 nohup.out
else
    echo "❌ No nohup.out found"
fi

echo -e "\n8. Checking Security Group (if on EC2)..."
curl -m 5 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null && echo "Running on EC2" || echo "Not on EC2 or metadata service unavailable"

echo -e "\n=== FIX ATTEMPT ==="

# Kill any existing Java processes
echo "Killing existing Java processes..."
pkill -f java || echo "No Java processes to kill"

# Find and navigate to backend directory
BACKEND_DIR=$(find . -name "Movie Ticket Sales Web Project" -type d | head -1)
if [ -z "$BACKEND_DIR" ]; then
    echo "❌ Cannot find backend directory"
    exit 1
fi

echo "Found backend directory: $BACKEND_DIR"
cd "$BACKEND_DIR"

# Check if mvnw exists
if [ ! -f "./mvnw" ]; then
    echo "❌ mvnw not found, trying with maven..."
    if command -v mvn &> /dev/null; then
        echo "Using system maven..."
        MAVEN_CMD="mvn"
    else
        echo "❌ No Maven found"
        exit 1
    fi
else
    echo "Using mvnw..."
    chmod +x ./mvnw
    MAVEN_CMD="./mvnw"
fi

# Build the application
echo "Building application..."
$MAVEN_CMD clean package -DskipTests -Dmaven.test.skip=true

# Find the jar file
JAR_FILE=$(find target -name "*.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" | head -1)
if [ -z "$JAR_FILE" ]; then
    echo "❌ No jar file found after build"
    exit 1
fi

echo "Found jar file: $JAR_FILE"

# Start the application
echo "Starting Spring Boot application..."
nohup java -jar "$JAR_FILE" --spring.profiles.active=dev --server.port=8080 > ../../../backend.log 2>&1 &

echo "Application started in background"
echo "Process ID: $!"

# Wait for startup
echo "Waiting 15 seconds for startup..."
sleep 15

# Test connection
echo "Testing connection..."
for i in {1..5}; do
    echo "Attempt $i/5..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health 2>/dev/null; then
        echo "✅ Backend responding on localhost:8080"
        break
    elif curl -s -o /dev/null -w "%{http_code}" http://47.130.182.70:8080/actuator/health 2>/dev/null; then
        echo "✅ Backend responding on public IP"
        break
    else
        echo "Still starting... (attempt $i/5)"
        sleep 3
    fi
done

# Final status check
echo -e "\n=== FINAL STATUS ==="
netstat -tlnp | grep :8080 && echo "✅ Port 8080 is listening" || echo "❌ Port 8080 not listening"

# Test API endpoints
echo -e "\nTesting API endpoints..."
curl -s http://localhost:8080/api/cinema-chains | head -50 || echo "❌ API not responding"

echo -e "\n=== Instructions ==="
echo "If still not working:"
echo "1. Check logs: tail -f ../../../backend.log"
echo "2. Check Security Group allows port 8080"
echo "3. Check if Java 17+ is installed: java -version"
echo "4. Manual start: java -jar $JAR_FILE --server.port=8080"