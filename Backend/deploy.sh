#!/bin/bash

# Usage function to display help message
usage() {
  echo "Usage: $0 [-b] [-f] [-a]"
  echo "  -b    Run backend container"
  echo "  -f    Run frontend container"
  echo "  -a    Run both backend and frontend containers"
  exit 1
}

# Update and install Docker
sudo apt-get update
sudo dnf install -y docker


# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Determine which containers to run based on project type
PROJECT_TYPE=${PROJECT_TYPE}

if [ "$PROJECT_TYPE" = "backend" ]; then
  docker pull ${DOCKER_USERNAME}/backend-image:latest
  echo "Running backend container..."
  docker run -d --name backend-container -p 3000:4000 ${DOCKER_USERNAME}/backend-image:latest
elif [ "$PROJECT_TYPE" = "frontend" ]; then
  docker pull ${DOCKER_USERNAME}/frontend-image:latest
  echo "Running frontend container..."
  docker run -d --name frontend-container -p 80:80 ${DOCKER_USERNAME}/frontend-image:latest
elif [ "$PROJECT_TYPE" = "both" ]; then
  # Pull the latest Docker images
  docker pull ${DOCKER_USERNAME}/backend-image:latest
  docker pull ${DOCKER_USERNAME}/frontend-image:latest
  echo "Running both backend and frontend containers..."
  docker run -d --name backend-container -p 3000:4000 ${DOCKER_USERNAME}/backend-image:latest
  docker run -d --name frontend-container -p 80:80 ${DOCKER_USERNAME}/frontend-image:latest
else
  usage
fi
