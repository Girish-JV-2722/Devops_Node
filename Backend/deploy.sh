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
# Update the package list
sudo yum update -y

# Install Docker
sudo yum install -y docker 

# Start Docker service
sudo service docker start

# Enable Docker service to start on boot
sudo chkconfig docker on

# Add ec2-user to the docker group to avoid using sudo with Docker commands
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Pull the latest Docker images
docker pull ${DOCKER_USERNAME}/backend-image:latest
docker pull ${DOCKER_USERNAME}/frontend-image:latest

# Determine which containers to run based on project type
PROJECT_TYPE=${PROJECT_TYPE}
# if [ "$PROJECT_TYPE" = "backend" ]; then
#   docker pull ${DOCKER_USERNAME}/backend-image:latest
#   echo "Running backend container..."
#   docker run -d --name backend-container -p 3000:4000 ${DOCKER_USERNAME}/backend-image:latest
# elif [ "$PROJECT_TYPE" = "frontend" ]; then
#   docker pull ${DOCKER_USERNAME}/frontend-image:latest
#   echo "Running frontend container..."
#   docker run -d --name frontend-container -p 80:3000 ${DOCKER_USERNAME}/frontend-image:latest
# elif [ "$PROJECT_TYPE" = "both" ]; then
#   # Pull the latest Docker images
#   docker pull ${DOCKER_USERNAME}/backend-image:latest
#   docker pull ${DOCKER_USERNAME}/frontend-image:latest
#   echo "Running both backend and frontend containers..."
#   docker run -d --name backend-container -p 3000:4000 ${DOCKER_USERNAME}/backend-image:latest
#   docker run -d --name frontend-container -p 80:3000 ${DOCKER_USERNAME}/frontend-image:latest
# else
#   usage
# fi

#!/bin/bash
# Create docker-compose.yml based on the project type
cat > /home/ec2-user/docker-compose.yml <<EOL
version: '3.8'
services:

EOL

if [ "$PROJECT_TYPE" = "backend" ]; then
  cat >> /home/ec2-user/docker-compose.yml <<EOL
  mysql:
    image: mysql:5.7
    container_name: ${projectName}_mysql_db
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    restart: always

  backend:
    image: ${DOCKER_USERNAME}/${projectName}-backend-image:latest
    container_name: ${projectName}_backend
    environment:
      DB_HOST: mysql
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      DB_NAME: ${MYSQL_DATABASE}
      DB_PORT: 3306
    ports:
      - "80:3000"
    depends_on:
      - mysql
    restart: always
    
volumes:
  mysql-data:
EOL
elif [ "$PROJECT_TYPE" = "frontend" ]; then
  cat >> /home/ec2-user/docker-compose.yml <<EOL
  frontend:
    image: ${DOCKER_USERNAME}/${projectName}-frontend-image:latest
    container_name: ${projectName}_frontend
    ports:
      - "80:80"
    environment:
      VITE_BACKEND_URL: ${BACKEND_IP}
    restart: always
EOL
elif [ "$PROJECT_TYPE" = "both" ]; then
  cat >> /home/ec2-user/docker-compose.yml <<EOL
  mysql:
    image: mysql:5.7
    container_name: mysql_db
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    restart: always

  backend:
    image: ${DOCKER_USERNAME}/${projectName}-backend-image:latest
    container_name: ${projectName}_backend
    environment:
      DB_HOST: mysql
      DB_USER: ${MYSQL_USER}
      DB_PASSWORD: ${MYSQL_PASSWORD}
      DB_NAME: ${MYSQL_DATABASE}
      DB_PORT: 3306
    ports:
      - "80:3000"
    depends_on:
      - mysql
    restart: always
    
volumes:
  mysql-data:
EOL
else
  echo "Invalid PROJECT_TYPE specified"
  exit 1
fi

# Run docker-compose up with the appropriate services
cd /home/ec2-user
docker-compose up -d

# Wait for backend service to be ready
echo "Waiting for backend service to be ready..."
sleep 30

docker-compose exec backend npx sequelize db:migrate
