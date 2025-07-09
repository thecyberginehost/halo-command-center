#!/bin/bash

# HALO Self-Hosted Setup Script
# This script helps set up your self-hosted HALO automation platform

set -e

echo "🚀 Setting up HALO Self-Hosted Environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/your-super-secret-jwt-token-with-at-least-32-characters-long/$JWT_SECRET/" .env
    
    # Generate random database password
    DB_PASSWORD=$(openssl rand -base64 16)
    sed -i "s/your_secure_password_here/$DB_PASSWORD/" .env
    
    # Generate random encryption key
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    sed -i "s/your_32_character_encryption_key_here/$ENCRYPTION_KEY/" .env
    
    echo "✅ Generated secure random passwords and keys"
    echo "⚠️  Please review and update the .env file with your specific configuration"
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
mkdir -p docker/volumes/postgres
mkdir -p docker/volumes/storage

# Set proper permissions
chmod 755 docker/volumes/postgres
chmod 755 docker/volumes/storage

echo "📦 Building and starting services..."

# Build and start the services
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 HALO is now available at: http://localhost"
    echo "📊 Database is accessible at: localhost:5432"
    echo "🔐 Auth service at: http://localhost:9999"
    echo "🗄️  Storage service at: http://localhost:5000"
    echo ""
    echo "📚 Next steps:"
    echo "1. Visit http://localhost to access HALO"
    echo "2. Update your .env file with external API keys (OpenAI, etc.)"
    echo "3. Configure SMTP settings for email notifications"
    echo "4. Set up SSL certificates for production use"
    echo ""
    echo "🛠️  To stop services: docker-compose down"
    echo "🔄 To restart services: docker-compose restart"
    echo "📋 To view logs: docker-compose logs -f"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi