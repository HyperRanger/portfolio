FROM node:20-alpine

# Install build tools (kept minimal)
RUN apk add --no-cache python3 make g++ git

# Set working directory to backend (our Node app lives in backend/)
WORKDIR /usr/src/app/backend

# Copy backend package files first for better layer caching
COPY backend/package*.json ./

# Install production dependencies. Use npm install --omit=dev so the build
# doesn't fail when a package-lock.json is not present (npm ci requires a lockfile).
RUN npm install --omit=dev --no-audit --no-fund

# Copy the rest of the project into the container
WORKDIR /usr/src/app
COPY . .

# Expose the backend port
EXPOSE 3001

# Ensure production environment by default
ENV NODE_ENV=production

# Start the server
CMD ["node", "backend/server.js"]