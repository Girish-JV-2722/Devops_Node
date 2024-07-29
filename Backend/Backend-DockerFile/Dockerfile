ARG NODE_VERSION
# Use an official Node.js runtime as a parent image
FROM node:${NODE_VERSION}

# Set the working directory in the container
WORKDIR /app

# Copy the rest of your application code
COPY ./cloned-repo-backend/. .

# Install any needed dependencies
RUN npm install

# Make the application port available to the world outside this container
ARG APP_PORT
EXPOSE ${APP_PORT}

# Define the command to run your app
CMD ["npm", "start"]