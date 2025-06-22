# ART Frontend - Docker Setup

This document provides instructions for running the ART Frontend application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Production Build

1. **Build and run the production container:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Open your browser and navigate to `http://localhost:3000`

### Development Build (with Hot Reload)

1. **Build and run the development container:**
   ```bash
   docker-compose --profile dev up --build
   ```

2. **Access the development server:**
   - Open your browser and navigate to `http://localhost:8080`
   - Changes to your code will automatically reload

## Docker Commands

### Build the image
```bash
docker build -t art-frontend .
```

### Run the container
```bash
docker run -p 3000:80 art-frontend
```

### Run in detached mode
```bash
docker-compose up -d
```

### Stop the containers
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f art-frontend
```

### Rebuild without cache
```bash
docker-compose build --no-cache
```

## Environment Variables

The application uses the following environment variables:

- `NODE_ENV`: Set to `production` for production builds, `development` for development

## Ports

- **Production**: Port 3000 (mapped to container port 80)
- **Development**: Port 8080 (mapped to container port 8080)

## Health Check

The application includes a health check endpoint at `/health` that returns a 200 status when the application is running properly.

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the port mapping in `docker-compose.yml`
   - Example: `"3001:80"` instead of `"3000:80"`

2. **Build fails:**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

3. **Container won't start:**
   - Check logs: `docker-compose logs art-frontend`
   - Ensure all required files are present

### Useful Commands

```bash
# Remove all containers and images
docker system prune -a

# View running containers
docker ps

# Enter the container shell
docker exec -it art-frontend sh

# View container resource usage
docker stats
```

## File Structure

```
ART_Front/
├── Dockerfile          # Production Dockerfile
├── Dockerfile.dev      # Development Dockerfile
├── docker-compose.yml  # Docker Compose configuration
├── nginx.conf         # Nginx configuration
├── .dockerignore      # Files to exclude from Docker build
└── README-Docker.md   # This file
```

## Production Deployment

For production deployment, consider:

1. **Using a reverse proxy** (like Traefik or Nginx)
2. **Setting up SSL/TLS certificates**
3. **Configuring environment-specific variables**
4. **Setting up monitoring and logging**
5. **Using Docker volumes for persistent data**

## Security Notes

- The nginx configuration includes security headers
- The application runs as a non-root user in the container
- Static assets are served with appropriate cache headers
- API endpoints are configured for potential backend integration 