# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the 'wait-for-it.sh' script into the container
COPY wait-for-it.sh /wait-for-it.sh

# Make sure the script is executable
RUN chmod +x /wait-for-it.sh

# Copy package.json and package-lock.json to the container
COPY dist/package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Build TypeScript code (assuming you have TypeScript installed as a dependency)
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run your app using the script
CMD ["/bin/bash", "-c", "/wait-for-it.sh database:3306 -- node dist/app.js"]

