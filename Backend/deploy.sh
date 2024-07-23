#!/bin/bash

# Update and install Docker
sudo apt-get update
sudo apt-get install -y docker.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Pull the latest Docker images for backend and frontend
docker pull ${DOCKER_USERNAME}/backend-image:latest
docker pull ${DOCKER_USERNAME}/frontend-image:latest

# Run the backend container
docker run -d --name backend-container -p 3000:4000 ${DOCKER_USERNAME}/backend-image:latest

# Run the frontend container
docker run -d --name frontend-container -p 80:80 ${DOCKER_USERNAME}/frontend-image:latest
