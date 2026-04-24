FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Create directory for database if needed
RUN mkdir -p /app/src/db

# Expose port
EXPOSE 25425

# Start server
CMD ["npm", "start"]
