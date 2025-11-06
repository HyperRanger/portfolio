FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy the rest of the backend code
COPY . .

# Expose the backend port
EXPOSE 3000

# Ensure production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]