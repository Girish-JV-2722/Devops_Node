# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the rest of your application code
COPY ./nodejs/. .

# Install any needed dependencies
RUN npm install

# Make port 8080 available to the world outside this container
EXPOSE 4000

# Define the command to run your app
CMD ["npm", "run", "prod"]
