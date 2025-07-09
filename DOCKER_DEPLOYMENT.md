# HALO Self-Hosted Docker Deployment

This guide will help you deploy HALO as a self-hosted solution using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM
- 20GB free disk space

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

3. **Access HALO**
   - Open your browser to `http://localhost`
   - The platform will be ready to use

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

- `DB_PASSWORD`: PostgreSQL database password
- `JWT_SECRET`: JWT signing secret (32+ characters)
- `SITE_URL`: Your domain URL
- `ANON_KEY`: Supabase anonymous key
- `SERVICE_ROLE_KEY`: Supabase service role key
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `SMTP_*`: Email configuration for notifications

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

- **Frontend**: React app served by Nginx
- **Database**: PostgreSQL with your data
- **Auth**: Supabase GoTrue for authentication
- **API**: PostgREST for database API
- **Storage**: Supabase Storage for file uploads
- **Functions**: Edge Runtime for serverless functions
- **Gateway**: Kong for API routing

## Monitoring

### Health Checks

- Application: `http://localhost/health`
- Database: `docker-compose exec db pg_isready`
- Services: `docker-compose ps`

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
3. **Enable SSL/TLS** for production
4. **Configure firewall rules**
5. **Regular security updates**

## Production Deployment

For production deployment:

1. **Use reverse proxy** (Nginx, Traefik, or Cloudflare)
2. **Configure SSL certificates**
3. **Set up monitoring** (Prometheus, Grafana)
4. **Configure backups**
5. **Use external database** for high availability

### SSL Configuration

Add to your reverse proxy:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

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