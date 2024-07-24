#!/bin/bash

# Usage function to display help message
usage() {
  echo "Usage: $0 [-b] [-f] [-a]"
  echo "  -b    Run backend container"
  echo "  -f    Run frontend container"
  echo "  -a    Run both backend and frontend containers"
  exit 1
}

# Update and install Docker and Docker Compose
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Pull the latest Docker images
docker pull ${DOCKER_USERNAME}/backend-image:latest
docker pull ${DOCKER_USERNAME}/frontend-image:latest

# Determine which containers to run based on project type
PROJECT_TYPE=${PROJECT_TYPE}

# Create docker-compose.override.yml based on the project type
cat > docker-compose.override.yml <<EOL
version: '3.8'

services:
EOL

if [ "$PROJECT_TYPE" = "backend" ]; then
  echo "  backend:" >> docker-compose.override.yml
  echo "    image: \${DOCKER_USERNAME}/backend-image:latest" >> docker-compose.override.yml
elif [ "$PROJECT_TYPE" = "frontend" ]; then
  echo "  frontend:" >> docker-compose.override.yml
  echo "    image: \${DOCKER_USERNAME}/frontend-image:latest" >> docker-compose.override.yml
elif [ "$PROJECT_TYPE" = "both" ]; then
  echo "  backend:" >> docker-compose.override.yml
  echo "    image: \${DOCKER_USERNAME}/backend-image:latest" >> docker-compose.override.yml
  echo "  frontend:" >> docker-compose.override.yml
  echo "    image: \${DOCKER_USERNAME}/frontend-image:latest" >> docker-compose.override.yml
else
  usage
fi

# Run docker-compose up with the appropriate services
docker-compose up -d
