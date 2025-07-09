# HALO Self-Hosted Docker Deployment

This guide will help you deploy HALO as a self-hosted solution using Docker with SSL support and subdomain configuration.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM
- 20GB free disk space
- Domain name with DNS access (for SSL/subdomain setup)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd halo
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **For subdomain deployment with SSL**
   ```bash
   ./ssl-setup.sh halo.yourdomain.com admin@yourdomain.com
   ```

4. **Access HALO**
   - Local: `http://localhost`
   - Production: `https://halo.yourdomain.com`

## SSL and Subdomain Configuration

### Automatic SSL Setup

The deployment includes automatic SSL certificate generation using Let's Encrypt:

```bash
# Configure your domain in .env
DOMAIN=halo.yourdomain.com
SITE_URL=https://halo.yourdomain.com
SSL_EMAIL=admin@yourdomain.com

# Run SSL setup
./ssl-setup.sh halo.yourdomain.com admin@yourdomain.com
```

### Manual SSL Configuration

For manual SSL setup:

1. **Point your domain to the server**
   - Create an A record: `halo.yourdomain.com` → `your-server-ip`

2. **Generate SSL certificates**
   ```bash
   docker-compose run --rm certbot certonly \
     --webroot \
     --webroot-path=/var/www/certbot \
     --email admin@yourdomain.com \
     --agree-tos \
     --no-eff-email \
     -d halo.yourdomain.com
   ```

3. **Restart nginx**
   ```bash
   docker-compose restart nginx-proxy
   ```

### Certificate Renewal

SSL certificates auto-renew. To manually renew:

```bash
./ssl-renew.sh
```

Set up automatic renewal with cron:
```bash
crontab -e
# Add this line:
0 12 * * * /path/to/halo/ssl-renew.sh >> /var/log/ssl-renew.log 2>&1
```

## Manual Setup

If you prefer to set up manually:

1. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your specific values
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **Verify deployment**
   ```bash
   docker-compose ps
   ```

## Configuration

### Environment Variables

Key variables in your `.env` file:

- `DOMAIN`: Your subdomain (e.g., halo.yourdomain.com)
- `SITE_URL`: Full URL with HTTPS
- `DB_PASSWORD`: PostgreSQL database password
- `JWT_SECRET`: JWT signing secret (32+ characters)
- `ANON_KEY`: Supabase anonymous key
- `SERVICE_ROLE_KEY`: Supabase service role key
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `SMTP_*`: Email configuration for notifications
- `SSL_EMAIL`: Email for SSL certificate notifications

### DNS Configuration

Before running SSL setup, configure your DNS:

1. **A Record**: Point your subdomain to your server's IP
   ```
   Type: A
   Name: halo
   Value: your-server-ip-address
   TTL: 300 (or default)
   ```

2. **Wait for DNS propagation** (usually 5-15 minutes)
   ```bash
   nslookup halo.yourdomain.com
   ```

3. **Verify HTTP access** before SSL setup
   ```bash
   curl -I http://halo.yourdomain.com
   ```

### Database Migration

Your existing database schema will need to be migrated:

1. Export your current schema:
   ```bash
   # From your current Supabase project
   supabase db dump --schema-only > schema.sql
   ```

2. Add the schema to `docker/init-db.sql`

3. Restart the database service:
   ```bash
   docker-compose restart db
   ```

## Architecture

The self-hosted setup includes:

- **Reverse Proxy**: Nginx with SSL termination
- **SSL Manager**: Certbot for automatic certificate management
- **Frontend**: React app served by Nginx
- **Database**: PostgreSQL with your data
- **Auth**: Supabase GoTrue for authentication
- **API**: PostgREST for database API
- **Storage**: Supabase Storage for file uploads
- **Functions**: Edge Runtime for serverless functions
- **Gateway**: Kong for API routing

## Monitoring

### Health Checks

- Application: `https://halo.yourdomain.com/health`
- Database: `docker-compose exec db pg_isready`
- Services: `docker-compose ps`
- SSL Status: `docker-compose run --rm certbot certificates`

### Logs

View logs for all services:
```bash
docker-compose logs -f
```

View logs for specific service:
```bash
docker-compose logs -f frontend
docker-compose logs -f db
```

## Backup and Recovery

### Database Backup
```bash
docker-compose exec db pg_dump -U postgres halo_db > backup.sql
```

### Database Restore
```bash
docker-compose exec -T db psql -U postgres halo_db < backup.sql
```

### Full Backup
```bash
docker-compose down
cp -r docker/volumes/ backup/
docker-compose up -d
```

## Security Considerations

1. **Change default passwords** in `.env`
2. **Use strong JWT secrets** (32+ characters)
3. **Enable SSL/TLS** for production (included)
4. **Configure firewall rules** (ports 80, 443, 22)
5. **Regular security updates**
6. **Use strong domain and SSL email**
7. **Enable fail2ban** for SSH protection

### Firewall Configuration

```bash
# UFW example
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## Production Deployment

The Docker setup is production-ready with:

1. **SSL/TLS encryption** (Let's Encrypt)
2. **Reverse proxy** with security headers
3. **Rate limiting** for API endpoints
4. **Automatic certificate renewal**
5. **Security headers** (HSTS, CSP, etc.)
6. **Health checks** and monitoring

### Additional Production Considerations

1. **Use external database** for high availability
2. **Set up monitoring** (Prometheus, Grafana)
3. **Configure log rotation**
4. **Set up backup schedule**
5. **Use CDN** for static assets

## Scaling

For high-traffic deployments:

1. **Use multiple frontend replicas**
2. **External PostgreSQL cluster**
3. **Redis for caching**
4. **Load balancer**
5. **Horizontal scaling**

## Troubleshooting

### Common Issues

1. **Services not starting**: Check logs with `docker-compose logs`
2. **Database connection errors**: Verify DB_PASSWORD in .env
3. **Auth not working**: Check JWT_SECRET configuration
4. **API calls failing**: Verify ANON_KEY and SERVICE_ROLE_KEY

### Reset Everything
```bash
docker-compose down -v
docker system prune -a
./setup.sh
```

## Support

For issues with self-hosted deployment:
1. Check this documentation
2. Review Docker logs
3. Verify environment configuration
4. Check network connectivity between services

## Updating

To update your self-hosted instance:
1. Pull latest changes from repository
2. Run `docker-compose build --no-cache`
3. Run `docker-compose up -d`