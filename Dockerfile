FROM node:20-alpine

# Install build tools (kept minimal)
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy the rest of the backend
COPY . .

# Expose the backend port
EXPOSE 3001

# Ensure production environment by default
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]