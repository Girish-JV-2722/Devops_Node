# Use the official Node.js image as the base image
FROM node:18

# Create and change to the frontend app directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json first to leverage Docker cache


# Install dependencies


# Copy the rest of the application code
COPY ./cloned-repo-frontend/. .

RUN npm install

# Build the React application with Vite
RUN npm run build

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Expose port 80
EXPOSE 80

# Command to serve the built application
CMD ["serve", "-s", "dist", "-l", "80"]
