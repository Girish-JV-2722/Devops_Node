# Use the official Node.js image as the base image
FROM node:14

# Create and change to the frontend app directory
WORKDIR /usr/src/app

# Copy the rest of the application code
COPY ./cloned-repo-frontend/. .

RUN npm install

# Build the React application
RUN npm run build

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Expose port 80
EXPOSE 80

# Command to run the frontend application
CMD ["serve", "-s", "build"]
