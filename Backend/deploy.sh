#!/bin/bash

# Update and install necessary packages
sudo yum update -y
sudo yum install -y docker

# Start Docker service
sudo service docker start

# Pull the Docker image from Docker Hub
dockerUsername="girish2722" # Replace with your Docker Hub username
dockerImage="firstimage"

docker pull ${dockerUsername}/${dockerImage}

# Run the Docker container
docker run -d -p 3000:4000 ${dockerUsername}/${dockerImage}

