# HALO Setup Guide

## Quick Start (Recommended)

### One-Command Installation
```bash
git clone YOUR_REPOSITORY_URL halo
cd halo
chmod +x interactive-setup.sh
./interactive-setup.sh
```

This interactive setup will guide you through:
- Choosing local vs production deployment
- Domain and SSL configuration
- Database setup with secure random passwords
- Optional AI integrations (OpenAI)
- Email configuration for notifications

## Prerequisites

- Docker & Docker Compose
- Git
- OpenSSL (for generating secure keys)

## Supabase Configuration (Required)

HALO requires a Supabase project for backend functionality. Before running the setup:

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for it to initialize (takes ~2 minutes)

### 2. Get Your Credentials
From your Supabase dashboard:
- **Project URL**: Found in Settings > API
- **Anon Key**: Found in Settings > API (starts with `eyJ...`)
- **Service Role Key**: Found in Settings > API (starts with `eyJ...`)

### 3. Update Configuration
After running the interactive setup, update your `.env` file:

```bash
# Frontend Configuration (required for app to work)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Backend Configuration (for self-hosted features)
ANON_KEY=your_anon_key_here
SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Update Supabase Project ID
Update `supabase/config.toml`:
```toml
project_id = "your-supabase-project-ref"
```

## Development Setup

For local development:

1. Create `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Add your Supabase credentials to `.env.local`

3. Start the development server:
```bash
npm install
npm run dev
```

The app will be available at `http://localhost:8080`

## Production Deployment

The interactive setup supports production deployment with:
- Automatic SSL certificate generation (Let's Encrypt)
- Nginx reverse proxy configuration
- Docker-based deployment
- Health monitoring

## Port Configuration

- **Default Port**: 8080
- **Alternative Ports**: The setup will detect port conflicts and suggest alternatives
- **Production**: Uses standard ports (80/443) with Nginx proxy

## Management Commands

After installation:

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Update and rebuild
git pull && docker-compose up -d --build
```

## Troubleshooting

### Common Issues

1. **Port 8080 in use**
   - The setup will automatically detect and suggest alternative ports

2. **Supabase connection errors**
   - Verify your credentials in `.env`
   - Check that your Supabase project is active
   - Ensure the frontend environment variables start with `VITE_`

3. **Docker permission errors**
   - Make sure your user is in the docker group
   - Try running with `sudo` if needed

4. **SSL certificate issues**
   - Ensure your domain points to your server IP
   - Check that ports 80 and 443 are open
   - DNS propagation can take up to 24 hours

### Getting Help

- Check the logs: `docker-compose logs -f`
- Verify services are running: `docker-compose ps`
- Test connectivity: `curl http://localhost:8080/health`

## Security Notes

- All sensitive credentials are generated automatically
- Database passwords use strong random generation
- SSL certificates are automatically managed
- Environment variables keep secrets secure
- No hardcoded credentials in the codebase

## Next Steps

1. Access HALO at your configured URL
2. Set up your first automation workflow
3. Configure additional integrations as needed
4. Invite team members (MASP-certified providers)