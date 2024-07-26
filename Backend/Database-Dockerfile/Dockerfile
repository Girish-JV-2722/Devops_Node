# Use the official MySQL image from the Docker Hub
FROM mysql:latest

# Set environment variables
ENV MYSQL_DATABASE=mydatabase
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword
ENV MYSQL_ROOT_PASSWORD=rootpassword

# Expose the MySQL port
EXPOSE 3306

# Add a custom .sql file to initialize the database
COPY init.sql /docker-entrypoint-initdb.d/
