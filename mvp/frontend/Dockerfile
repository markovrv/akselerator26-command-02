FROM node:24-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for hot-reload)
RUN npm i

# Copy source code
COPY . .

# Expose port
EXPOSE 25426

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "25426"]
