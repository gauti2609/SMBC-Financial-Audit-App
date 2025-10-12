#!/bin/bash

set -e

echo "🧪 Starting Comprehensive Financial Reporting Feature Tests..."
echo "================================================================"
echo ""

# Change to the project directory
cd "$(dirname "$0")"

# Function to check if a service is ready
check_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if eval "$check_command" > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    ./scripts/docker-compose down --remove-orphans > /dev/null 2>&1 || true
    echo "✅ Cleanup completed"
}

# Trap to cleanup on exit
trap cleanup EXIT

# Start the services
echo "🚀 Starting required services..."
./scripts/docker-compose up -d

# Wait for PostgreSQL to be ready
if ! check_service "PostgreSQL" "docker exec first-project-postgres-1 pg_isready -U postgres"; then
    echo "❌ PostgreSQL failed to start. Cannot proceed with tests."
    exit 1
fi

# Wait for MinIO to be ready  
if ! check_service "MinIO" "curl -s http://127.0.0.1:9000/minio/health/ready"; then
    echo "❌ MinIO failed to start. Cannot proceed with tests."
    exit 1
fi

# Run database setup
echo ""
echo "🔧 Setting up database and seeding data..."
./scripts/docker-compose exec -T app bash -c "
    echo 'Installing dependencies...'
    pnpm install > /dev/null 2>&1
    echo 'Generating Prisma client...'
    pnpm exec prisma generate > /dev/null 2>&1
    echo 'Pushing database schema...'
    pnpm exec prisma db push --accept-data-loss > /dev/null 2>&1
    echo 'Running setup script...'
    pnpm exec tsx src/server/scripts/setup.ts
"

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully"
else
    echo "❌ Database setup failed"
    exit 1
fi

echo ""
echo "🧪 Running comprehensive feature tests..."
echo ""

# Run the comprehensive test suite
./scripts/docker-compose exec -T app bash -c "
    pnpm exec tsx src/server/scripts/testAllFeatures.ts
"

test_exit_code=$?

echo ""
if [ $test_exit_code -eq 0 ]; then
    echo "🎉 All tests completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   • Review the test results above"
    echo "   • All financial reporting capabilities appear to be working"
    echo "   • The system is ready for production use"
else
    echo "⚠️ Some tests failed or had issues"
    echo ""
    echo "📝 Troubleshooting steps:"
    echo "   • Review the failed tests above"
    echo "   • Check the detailed error messages"
    echo "   • Run specific feature tests if needed"
    echo "   • Check application logs: docker logs \$(docker ps -q -f name=app)"
fi

echo ""
echo "✨ Test execution completed!"
exit $test_exit_code
