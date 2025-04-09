# Use Node.js as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy rest of the files
COPY . .

# # Expose port
# EXPOSE 3003

# Start the server
CMD ["npm", "start"]
