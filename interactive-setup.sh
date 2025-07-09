#!/bin/bash

# HALO Interactive Setup Script
# One-command installation with interactive prompts - just like n8n!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# HALO branding
echo -e "${PURPLE}"
echo "██╗  ██╗ █████╗ ██╗      ██████╗ "
echo "██║  ██║██╔══██╗██║     ██╔═══██╗"
echo "███████║███████║██║     ██║   ██║"
echo "██╔══██║██╔══██║██║     ██║   ██║"
echo "██║  ██║██║  ██║███████╗╚██████╔╝"
echo "╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ "
echo -e "${NC}"
echo -e "${BLUE}Hyper-Automation & Logical Orchestration Platform${NC}"
echo -e "${YELLOW}🎮 Port 2552 - HALO's signature port (Halo: Combat Evolved timeline)${NC}"
echo ""

# Function to prompt for input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local result
    
    echo -e "${BLUE}$prompt${NC}"
    if [[ -n "$default" ]]; then
        echo -e "${YELLOW}Press Enter for default: $default${NC}"
    fi
    read -r result
    echo "${result:-$default}"
}

# Function to validate domain format
validate_domain() {
    local domain="$1"
    if [[ $domain =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to check if port is available
check_port() {
    local port="$1"
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to check DNS resolution
check_dns() {
    local domain="$1"
    if nslookup "$domain" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Prerequisites check
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed.${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"

# Interactive configuration
echo -e "${BLUE}🚀 Let's configure your HALO installation!${NC}"
echo ""

# Deployment type
echo -e "${BLUE}Choose deployment type:${NC}"
echo "1) Local development (localhost:2552)"
echo "2) Production with custom domain (SSL enabled)"
echo ""
DEPLOYMENT_TYPE=$(prompt_with_default "Enter choice (1 or 2):" "1")

if [[ "$DEPLOYMENT_TYPE" == "2" ]]; then
    # Production deployment
    echo ""
    echo -e "${BLUE}🌐 Production Deployment Configuration${NC}"
    
    # Domain configuration
    while true; do
        DOMAIN=$(prompt_with_default "Enter your domain (e.g., halo.yourdomain.com):" "")
        if [[ -z "$DOMAIN" ]]; then
            echo -e "${RED}Domain is required for production deployment${NC}"
            continue
        fi
        
        if validate_domain "$DOMAIN"; then
            break
        else
            echo -e "${RED}Invalid domain format. Please enter a valid domain.${NC}"
        fi
    done
    
    # Email for SSL certificates
    EMAIL=$(prompt_with_default "Enter email for SSL certificates:" "admin@$(echo $DOMAIN | cut -d'.' -f2-)")
    
    # Check DNS resolution
    echo -e "${YELLOW}🔍 Checking DNS resolution for $DOMAIN...${NC}"
    if check_dns "$DOMAIN"; then
        echo -e "${GREEN}✅ DNS resolution successful${NC}"
    else
        echo -e "${YELLOW}⚠️  DNS resolution failed. Make sure your domain points to this server.${NC}"
        echo "Create an A record: $DOMAIN → $(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")"
        
        CONTINUE=$(prompt_with_default "Continue anyway? (y/n):" "y")
        if [[ "$CONTINUE" != "y" ]]; then
            echo "Please configure DNS and run the script again."
            exit 1
        fi
    fi
    
    SITE_URL="https://$DOMAIN"
else
    # Local deployment
    DOMAIN="localhost"
    SITE_URL="http://localhost:2552"
    EMAIL=""
fi

# Port configuration
echo ""
echo -e "${BLUE}🔌 Port Configuration${NC}"
DEFAULT_PORT="2552"

if check_port "$DEFAULT_PORT"; then
    echo -e "${GREEN}✅ Port $DEFAULT_PORT is available${NC}"
    PORT="$DEFAULT_PORT"
else
    echo -e "${YELLOW}⚠️  Port $DEFAULT_PORT is in use${NC}"
    PORT=$(prompt_with_default "Enter alternative port:" "2553")
    
    if ! check_port "$PORT"; then
        echo -e "${RED}❌ Port $PORT is also in use. Please choose another port.${NC}"
        exit 1
    fi
fi

# Database configuration
echo ""
echo -e "${BLUE}🗄️  Database Configuration${NC}"
DB_PASSWORD=$(openssl rand -base64 16 2>/dev/null || echo "halo_$(date +%s)")
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "halo_jwt_secret_$(date +%s)")
ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || echo "halo_encryption_$(date +%s)")

# API Keys (optional)
echo ""
echo -e "${BLUE}🤖 AI Integration (Optional)${NC}"
OPENAI_API_KEY=$(prompt_with_default "Enter OpenAI API key (optional):" "")

# SMTP Configuration (optional)
echo ""
echo -e "${BLUE}📧 Email Configuration (Optional)${NC}"
SMTP_HOST=$(prompt_with_default "SMTP Host (optional):" "")
if [[ -n "$SMTP_HOST" ]]; then
    SMTP_PORT=$(prompt_with_default "SMTP Port:" "587")
    SMTP_USER=$(prompt_with_default "SMTP Username:" "")
    SMTP_PASS=$(prompt_with_default "SMTP Password:" "")
    SMTP_SENDER_NAME=$(prompt_with_default "Sender Name:" "HALO Automation Platform")
fi

# Create directories
echo ""
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p docker/volumes/postgres docker/volumes/storage docker/nginx/conf.d docker/certbot/www docker/certbot/conf

# Generate .env file
echo -e "${BLUE}📝 Generating configuration...${NC}"
cat > .env << EOF
# HALO Configuration - Generated by Interactive Setup
# Port 2552 - HALO's signature port (Halo: Combat Evolved timeline)

# Domain Configuration
DOMAIN=$DOMAIN
SITE_URL=$SITE_URL
SSL_EMAIL=$EMAIL

# Database Configuration
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Supabase Configuration (update these with your actual keys)
ANON_KEY=your_supabase_anon_key_here
SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Integration
OPENAI_API_KEY=$OPENAI_API_KEY

# Email Configuration
SMTP_HOST=$SMTP_HOST
SMTP_PORT=${SMTP_PORT:-587}
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_SENDER_NAME=$SMTP_SENDER_NAME
MAILER_AUTOCONFIRM=false

# Security
DISABLE_SIGNUP=false
JWT_EXPIRY=3600
EOF

# Update Vite config for custom port
if [[ "$PORT" != "2552" ]]; then
    echo -e "${BLUE}🔧 Updating port configuration...${NC}"
    sed -i "s/port: 2552/port: $PORT/" vite.config.ts
    sed -i "s/2552:2552/$PORT:$PORT/" docker-compose.yml
    sed -i "s/:2552/:$PORT/g" docker/nginx/conf.d/default.conf.template
fi

# Generate nginx config for production
if [[ "$DEPLOYMENT_TYPE" == "2" ]]; then
    echo -e "${BLUE}🔧 Generating nginx configuration...${NC}"
    envsubst '${DOMAIN}' < docker/nginx/conf.d/default.conf.template > docker/nginx/conf.d/default.conf
fi

# Set permissions
chmod +x setup.sh ssl-setup.sh ssl-renew.sh 2>/dev/null || true

# Start services
echo ""
echo -e "${BLUE}🚀 Starting HALO services...${NC}"
docker-compose up -d --build

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# SSL setup for production
if [[ "$DEPLOYMENT_TYPE" == "2" ]]; then
    echo -e "${BLUE}🔒 Setting up SSL certificates...${NC}"
    if [[ -f ssl-setup.sh ]]; then
        ./ssl-setup.sh "$DOMAIN" "$EMAIL"
    else
        echo -e "${YELLOW}⚠️  SSL setup script not found. Please configure SSL manually.${NC}"
    fi
fi

# Health check
echo -e "${BLUE}🏥 Performing health check...${NC}"
if curl -f -s "http://localhost:$PORT/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ HALO is running successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but services might still be starting...${NC}"
fi

# Success message
echo ""
echo -e "${GREEN}🎉 HALO Installation Complete!${NC}"
echo ""
echo -e "${PURPLE}🌐 Access HALO at: $SITE_URL${NC}"
if [[ "$DEPLOYMENT_TYPE" == "1" ]]; then
    echo -e "${BLUE}   Local: http://localhost:$PORT${NC}"
fi
echo -e "${YELLOW}🎮 Port $PORT - HALO's signature port (Halo: Combat Evolved timeline)${NC}"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo "1. Visit $SITE_URL to access HALO"
if [[ -n "$OPENAI_API_KEY" ]]; then
    echo "2. AI features are ready with your OpenAI API key"
else
    echo "2. Add OpenAI API key to .env for AI features"
fi
echo "3. Configure additional integrations as needed"
echo "4. Create your first automation workflow"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo "• Stop services: docker-compose down"
echo "• View logs: docker-compose logs -f"
echo "• Restart: docker-compose restart"
if [[ "$DEPLOYMENT_TYPE" == "2" ]]; then
    echo "• Renew SSL: ./ssl-renew.sh"
fi
echo ""
echo -e "${GREEN}Welcome to HALO - Happy Automating! 🚀${NC}"