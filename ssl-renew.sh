#!/bin/bash

# SSL Certificate Renewal Script for HALO
# This script renews SSL certificates and reloads nginx

set -e

echo "🔄 Renewing SSL certificates..."

# Renew certificates
docker-compose run --rm certbot renew

# Reload nginx if renewal was successful
if [ $? -eq 0 ]; then
    echo "✅ Certificates renewed successfully"
    echo "🔄 Reloading nginx..."
    docker-compose exec nginx-proxy nginx -s reload
    echo "✅ Nginx reloaded with new certificates"
else
    echo "❌ Certificate renewal failed"
    exit 1
fi

echo "🎉 SSL certificate renewal completed!"