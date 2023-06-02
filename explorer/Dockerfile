# Use the official Node.js image as the base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies - Vue3 needs dev deps as well somehow...
RUN npm install 

# Copy the rest of the backend code
COPY . .

# Build TypeScript code
RUN npm run build

# Set the command to start the backend server
CMD ["npm", "start"]