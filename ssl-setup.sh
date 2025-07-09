#!/bin/bash

# SSL Setup Script for HALO Self-Hosted
# This script configures SSL certificates for your subdomain

set -e

# Check if domain is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <domain> [email]"
    echo "Example: $0 halo.yourdomain.com admin@yourdomain.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-admin@$1}

echo "🔐 Setting up SSL certificates for $DOMAIN..."

# Create required directories
mkdir -p docker/nginx/conf.d
mkdir -p docker/certbot/www
mkdir -p docker/certbot/conf

# Update environment with domain
if [ -f .env ]; then
    # Update existing .env file
    if grep -q "DOMAIN=" .env; then
        sed -i "s/DOMAIN=.*/DOMAIN=$DOMAIN/" .env
    else
        echo "DOMAIN=$DOMAIN" >> .env
    fi
    
    if grep -q "SITE_URL=" .env; then
        sed -i "s/SITE_URL=.*/SITE_URL=https:\/\/$DOMAIN/" .env
    else
        echo "SITE_URL=https://$DOMAIN" >> .env
    fi
else
    echo "❌ .env file not found. Run ./setup.sh first."
    exit 1
fi

# Generate nginx configuration from template
envsubst '$DOMAIN' < docker/nginx/conf.d/default.conf.template > docker/nginx/conf.d/default.conf

echo "📝 Generated nginx configuration for $DOMAIN"

# Start services without SSL first
echo "🚀 Starting services for initial certificate generation..."
docker-compose up -d nginx-proxy

# Wait for nginx to be ready
echo "⏳ Waiting for nginx to start..."
sleep 10

# Generate SSL certificate
echo "🔒 Generating SSL certificate for $DOMAIN..."
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate generated successfully!"
    
    # Restart nginx to load SSL configuration
    echo "🔄 Restarting nginx with SSL configuration..."
    docker-compose restart nginx-proxy
    
    # Start all services
    echo "🚀 Starting all HALO services..."
    docker-compose up -d
    
    echo ""
    echo "🎉 HALO is now available at: https://$DOMAIN"
    echo "🔒 SSL certificate is valid and automatically renewing"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update your DNS to point $DOMAIN to this server"
    echo "2. Configure your domain registrar's DNS settings"
    echo "3. Test the deployment at https://$DOMAIN"
    echo ""
    echo "🔄 To renew certificates manually: ./ssl-renew.sh"
    echo "🛠️  To check certificate status: docker-compose run --rm certbot certificates"
    
else
    echo "❌ Failed to generate SSL certificate"
    echo "Please check:"
    echo "1. Domain $DOMAIN points to this server"
    echo "2. Port 80 is accessible from the internet"
    echo "3. No firewall blocking HTTP traffic"
    exit 1
fi