# Module 05 · Containerized Solutions — Backend Dockerfile
# Build:  docker build -t azure-course-backend .
# Run:    docker run -p 3001:3001 --env-file .env azure-course-backend

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies separately for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# App Insights requires the native agent — install build tools only if needed
# RUN apk add --no-cache python3 make g++ && npm ci --omit=dev

EXPOSE 3001

# Health check so Azure Container Instances knows when we're ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "index.js"]
